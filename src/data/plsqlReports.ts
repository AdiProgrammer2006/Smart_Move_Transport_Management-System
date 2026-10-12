import { INITIAL_ROUTES, INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_PASSENGERS, INITIAL_TRIPS, INITIAL_MAINTENANCE, INITIAL_FEEDBACK } from './seedData';
import { TransportRoute, Vehicle, Driver, Passenger, Booking, Payment, VehicleMaintenance } from './relationalTypes';

export interface ReportItem {
  id: string;
  title: string;
  description: string;
  procedureSignature: string;
  parameters: Array<{
    name: string;
    type: string;
    defaultValue: string;
    label: string;
    description: string;
  }>;
  plsqlSource: string;
}

export const PLSQL_PACKAGE_SPEC = `-- =========================================================================
-- PACKAGE SPECIFICATION: PKG_TRANSPORT_REPORTS
-- SmartMove Transport Solutions Enterprise Reporting & Business Logic Engine
-- =========================================================================
CREATE OR REPLACE PACKAGE PKG_TRANSPORT_REPORTS AS

    -- Custom Record and Table Types for Ref Cursors
    TYPE t_cursor IS REF CURSOR;

    -- Custom Exceptions
    e_invalid_date_range EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_invalid_date_range, -20001);
    
    e_passenger_not_found EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_passenger_not_found, -20002);

    e_vehicle_not_found EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_vehicle_not_found, -20003);

    -- 1. REPORT: Most Frequently Used Routes based on ticket bookings
    PROCEDURE GET_TOP_ROUTES (
        p_start_date    IN  DATE DEFAULT SYSDATE - 30,
        p_end_date      IN  DATE DEFAULT SYSDATE,
        p_limit         IN  NUMBER DEFAULT 10,
        p_results_cur   OUT t_cursor
    );

    -- 2. REPORT: Total Revenue Generated from ticket sales within a period
    FUNCTION CALC_PERIOD_REVENUE (
        p_start_date    IN  DATE,
        p_end_date      IN  DATE,
        p_payment_method IN VARCHAR2 DEFAULT NULL
    ) RETURN NUMBER;

    PROCEDURE GET_REVENUE_BREAKDOWN (
        p_start_date    IN  DATE,
        p_end_date      IN  DATE,
        p_results_cur   OUT t_cursor
    );

    -- 3. REPORT: Passenger Travel History Report
    PROCEDURE GET_PASSENGER_HISTORY (
        p_passenger_id  IN  NUMBER,
        p_history_cur   OUT t_cursor,
        p_total_spend   OUT NUMBER,
        p_trips_count   OUT NUMBER
    );

    -- 4. REPORT: Vehicles Due for Maintenance
    PROCEDURE CHECK_FLEET_MAINTENANCE_DUE (
        p_mileage_threshold_km IN NUMBER DEFAULT 1000,
        p_days_threshold       IN NUMBER DEFAULT 14,
        p_vehicles_cur         OUT t_cursor
    );

    -- 5. REPORT: Driver Performance, Safety & Passenger Rating Analysis
    PROCEDURE ANALYZE_DRIVER_PERFORMANCE (
        p_min_trips     IN  NUMBER DEFAULT 1,
        p_drivers_cur   OUT t_cursor
    );

    -- Transactional Booking Stored Procedure with ACID Semantics
    PROCEDURE SP_BOOK_TICKET_TRANSACTION (
        p_trip_id       IN  NUMBER,
        p_passenger_id  IN  NUMBER,
        p_seat_number   IN  VARCHAR2,
        p_payment_method IN VARCHAR2,
        p_booking_id    OUT NUMBER,
        p_payment_id    OUT NUMBER
    );

END PKG_TRANSPORT_REPORTS;
/
`;

export const PLSQL_PACKAGE_BODY = `-- =========================================================================
-- PACKAGE BODY: PKG_TRANSPORT_REPORTS
-- Complete Implementation with Cursors, Calculations and Robust Exception Handling
-- =========================================================================
CREATE OR REPLACE PACKAGE BODY PKG_TRANSPORT_REPORTS AS

    -- ---------------------------------------------------------------------
    -- 1. REPORT 1: Most Frequently Used Routes based on ticket bookings
    -- ---------------------------------------------------------------------
    PROCEDURE GET_TOP_ROUTES (
        p_start_date    IN  DATE DEFAULT SYSDATE - 30,
        p_end_date      IN  DATE DEFAULT SYSDATE,
        p_limit         IN  NUMBER DEFAULT 10,
        p_results_cur   OUT t_cursor
    ) IS
    BEGIN
        -- Date validation check
        IF p_start_date > p_end_date THEN
            RAISE_APPLICATION_ERROR(-20001, 'Start date must be earlier than or equal to End date.');
        END IF;

        OPEN p_results_cur FOR
            SELECT 
                r.ROUTE_ID,
                r.ROUTE_CODE,
                r.ROUTE_NAME,
                r.CATEGORY,
                COUNT(b.BOOKING_ID) AS TOTAL_BOOKINGS,
                SUM(b.TOTAL_PAID) AS TOTAL_ROUTE_REVENUE,
                ROUND(AVG(t.TOTAL_SEATS - t.AVAILABLE_SEATS) / AVG(t.TOTAL_SEATS) * 100, 1) AS AVG_OCCUPANCY_RATE_PCT,
                DENSE_RANK() OVER (ORDER BY COUNT(b.BOOKING_ID) DESC) AS POPULARITY_RANK
            FROM ROUTES r
            JOIN TRIPS t ON r.ROUTE_ID = t.ROUTE_ID
            JOIN BOOKINGS b ON t.TRIP_ID = b.TRIP_ID
            WHERE TRUNC(b.BOOKING_TIMESTAMP) BETWEEN TRUNC(p_start_date) AND TRUNC(p_end_date)
              AND b.STATUS IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED')
            GROUP BY r.ROUTE_ID, r.ROUTE_CODE, r.ROUTE_NAME, r.CATEGORY
            ORDER BY TOTAL_BOOKINGS DESC
            FETCH FIRST p_limit ROWS ONLY;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            OPEN p_results_cur FOR SELECT NULL FROM DUAL WHERE 1 = 0;
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Error in GET_TOP_ROUTES: ' || SQLERRM);
            RAISE;
    END GET_TOP_ROUTES;

    -- ---------------------------------------------------------------------
    -- 2. REPORT 2: Total Revenue Generated within a Given Period
    -- ---------------------------------------------------------------------
    FUNCTION CALC_PERIOD_REVENUE (
        p_start_date    IN  DATE,
        p_end_date      IN  DATE,
        p_payment_method IN VARCHAR2 DEFAULT NULL
    ) RETURN NUMBER IS
        v_total_revenue NUMBER(12,2) := 0;
    BEGIN
        IF p_start_date > p_end_date THEN
            RAISE_APPLICATION_ERROR(-20001, 'Invalid date range supplied to CALC_PERIOD_REVENUE.');
        END IF;

        SELECT NVL(SUM(p.AMOUNT), 0)
        INTO v_total_revenue
        FROM PAYMENTS p
        JOIN BOOKINGS b ON p.BOOKING_ID = b.BOOKING_ID
        WHERE TRUNC(p.PAYMENT_TIMESTAMP) BETWEEN TRUNC(p_start_date) AND TRUNC(p_end_date)
          AND p.PAYMENT_STATUS = 'SUCCESS'
          AND (p_payment_method IS NULL OR p.PAYMENT_METHOD = p_payment_method);

        RETURN v_total_revenue;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 0;
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Error in CALC_PERIOD_REVENUE: ' || SQLERRM);
            RAISE;
    END CALC_PERIOD_REVENUE;

    PROCEDURE GET_REVENUE_BREAKDOWN (
        p_start_date    IN  DATE,
        p_end_date      IN  DATE,
        p_results_cur   OUT t_cursor
    ) IS
    BEGIN
        OPEN p_results_cur FOR
            SELECT 
                p.PAYMENT_METHOD,
                COUNT(p.PAYMENT_ID) AS TRANSACTION_COUNT,
                SUM(p.AMOUNT) AS TOTAL_VOLUME_USD,
                ROUND(AVG(p.AMOUNT), 2) AS AVG_TICKET_VALUE_USD,
                ROUND(RATIO_TO_REPORT(SUM(p.AMOUNT)) OVER () * 100, 2) AS REVENUE_SHARE_PCT
            FROM PAYMENTS p
            WHERE TRUNC(p.PAYMENT_TIMESTAMP) BETWEEN TRUNC(p_start_date) AND TRUNC(p_end_date)
              AND p.PAYMENT_STATUS = 'SUCCESS'
            GROUP BY p.PAYMENT_METHOD
            ORDER BY TOTAL_VOLUME_USD DESC;
    END GET_REVENUE_BREAKDOWN;

    -- ---------------------------------------------------------------------
    -- 3. REPORT 3: Passenger Travel History Report
    -- ---------------------------------------------------------------------
    PROCEDURE GET_PASSENGER_HISTORY (
        p_passenger_id  IN  NUMBER,
        p_history_cur   OUT t_cursor,
        p_total_spend   OUT NUMBER,
        p_trips_count   OUT NUMBER
    ) IS
        v_exists NUMBER := 0;
    BEGIN
        -- Verify Passenger Existence
        SELECT COUNT(*) INTO v_exists FROM PASSENGERS WHERE PASSENGER_ID = p_passenger_id;
        IF v_exists = 0 THEN
            RAISE_APPLICATION_ERROR(-20002, 'Passenger ID ' || p_passenger_id || ' does not exist in registry.');
        END IF;

        -- Calculate Summary Aggregates
        SELECT NVL(SUM(b.TOTAL_PAID), 0), COUNT(b.BOOKING_ID)
        INTO p_total_spend, p_trips_count
        FROM BOOKINGS b
        WHERE b.PASSENGER_ID = p_passenger_id
          AND b.STATUS IN ('CONFIRMED', 'CHECKED_IN', 'COMPLETED');

        -- Open Cursor with detailed itinerary history
        OPEN p_history_cur FOR
            SELECT 
                b.BOOKING_ID,
                b.SEAT_NUMBER,
                b.BOOKING_TIMESTAMP,
                b.TOTAL_PAID,
                b.STATUS AS BOOKING_STATUS,
                t.TRIP_ID,
                t.SCHEDULED_DEPARTURE,
                r.ROUTE_CODE,
                r.ROUTE_NAME,
                r.ORIGIN_CITY,
                r.DESTINATION_CITY,
                v.REGISTRATION_NO AS VEHICLE_REG,
                v.MODEL_NAME AS VEHICLE_MODEL,
                d.FULL_NAME AS DRIVER_NAME
            FROM BOOKINGS b
            JOIN TRIPS t ON b.TRIP_ID = t.TRIP_ID
            JOIN ROUTES r ON t.ROUTE_ID = r.ROUTE_ID
            JOIN VEHICLES v ON t.VEHICLE_ID = v.VEHICLE_ID
            JOIN DRIVERS d ON t.DRIVER_ID = d.DRIVER_ID
            WHERE b.PASSENGER_ID = p_passenger_id
            ORDER BY b.BOOKING_TIMESTAMP DESC;
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('Error in GET_PASSENGER_HISTORY: ' || SQLERRM);
            RAISE;
    END GET_PASSENGER_HISTORY;

    -- ---------------------------------------------------------------------
    -- 4. REPORT 4: Finding Vehicles Due for Maintenance
    -- ---------------------------------------------------------------------
    PROCEDURE CHECK_FLEET_MAINTENANCE_DUE (
        p_mileage_threshold_km IN NUMBER DEFAULT 1000,
        p_days_threshold       IN NUMBER DEFAULT 14,
        p_vehicles_cur         OUT t_cursor
    ) IS
    BEGIN
        OPEN p_vehicles_cur FOR
            SELECT 
                v.VEHICLE_ID,
                v.REGISTRATION_NO,
                v.MODEL_NAME,
                v.VEHICLE_TYPE,
                v.CURRENT_MILEAGE_KM,
                v.NEXT_SERVICE_MILEAGE_KM,
                (v.NEXT_SERVICE_MILEAGE_KM - v.CURRENT_MILEAGE_KM) AS KM_REMAINING_TO_SERVICE,
                v.NEXT_SERVICE_DATE,
                ROUND(v.NEXT_SERVICE_DATE - SYSDATE) AS DAYS_UNTIL_SERVICE,
                CASE 
                    WHEN v.CURRENT_MILEAGE_KM >= v.NEXT_SERVICE_MILEAGE_KM OR v.NEXT_SERVICE_DATE <= SYSDATE 
                        THEN 'CRITICAL_OVERDUE'
                    WHEN (v.NEXT_SERVICE_MILEAGE_KM - v.CURRENT_MILEAGE_KM) <= p_mileage_threshold_km 
                         OR (v.NEXT_SERVICE_DATE - SYSDATE) <= p_days_threshold 
                        THEN 'DUE_SOON'
                    ELSE 'NOMINAL'
                END AS MAINTENANCE_URGENCY_STATUS,
                v.STATUS AS CURRENT_OPERATIONAL_STATUS
            FROM VEHICLES v
            WHERE v.CURRENT_MILEAGE_KM >= (v.NEXT_SERVICE_MILEAGE_KM - p_mileage_threshold_km)
               OR v.NEXT_SERVICE_DATE <= (SYSDATE + p_days_threshold)
            ORDER BY 
                CASE 
                    WHEN v.CURRENT_MILEAGE_KM >= v.NEXT_SERVICE_MILEAGE_KM OR v.NEXT_SERVICE_DATE <= SYSDATE THEN 1
                    ELSE 2
                END,
                (v.NEXT_SERVICE_MILEAGE_KM - v.CURRENT_MILEAGE_KM) ASC;
    END CHECK_FLEET_MAINTENANCE_DUE;

    -- ---------------------------------------------------------------------
    -- 5. REPORT 5: Driver Performance and Safety Analysis
    -- ---------------------------------------------------------------------
    PROCEDURE ANALYZE_DRIVER_PERFORMANCE (
        p_min_trips     IN  NUMBER DEFAULT 1,
        p_drivers_cur   OUT t_cursor
    ) IS
    BEGIN
        OPEN p_drivers_cur FOR
            SELECT 
                d.DRIVER_ID,
                d.FULL_NAME,
                d.LICENSE_CLASS,
                d.YEARS_EXPERIENCE,
                d.SAFETY_SCORE,
                d.RATING AS ROSTER_RATING,
                NVL(ROUND(AVG(f.AVERAGE_SCORE), 2), d.RATING) AS PASSENGER_RATING_AVG,
                COUNT(DISTINCT t.TRIP_ID) AS DISPATCHED_TRIPS_COUNT,
                COUNT(f.REVIEW_ID) AS TOTAL_REVIEWS_LOGGED,
                SUM(CASE WHEN f.SENTIMENT = 'POSITIVE' THEN 1 ELSE 0 END) AS POSITIVE_REVIEWS_COUNT,
                CASE 
                    WHEN NVL(AVG(f.AVERAGE_SCORE), d.RATING) >= 4.85 AND d.SAFETY_SCORE >= 95 THEN 'MASTER_CAPTAIN'
                    WHEN NVL(AVG(f.AVERAGE_SCORE), d.RATING) >= 4.50 THEN 'EXEMPLARY'
                    WHEN NVL(AVG(f.AVERAGE_SCORE), d.RATING) >= 4.00 THEN 'STANDARD'
                    ELSE 'COACHING_REQUIRED'
                END AS PERFORMANCE_BADGE
            FROM DRIVERS d
            LEFT JOIN TRIPS t ON d.DRIVER_ID = t.DRIVER_ID
            LEFT JOIN FEEDBACK_REVIEWS f ON d.DRIVER_ID = f.DRIVER_ID
            GROUP BY d.DRIVER_ID, d.FULL_NAME, d.LICENSE_CLASS, d.YEARS_EXPERIENCE, d.SAFETY_SCORE, d.RATING
            HAVING COUNT(DISTINCT t.TRIP_ID) >= p_min_trips OR d.TOTAL_TRIPS_COMPLETED >= p_min_trips
            ORDER BY PASSENGER_RATING_AVG DESC, d.SAFETY_SCORE DESC;
    END ANALYZE_DRIVER_PERFORMANCE;

    -- ---------------------------------------------------------------------
    -- TRANSACTIONAL STORED PROCEDURE: Atomic Ticket Booking & Settlement
    -- ---------------------------------------------------------------------
    PROCEDURE SP_BOOK_TICKET_TRANSACTION (
        p_trip_id       IN  NUMBER,
        p_passenger_id  IN  NUMBER,
        p_seat_number   IN  VARCHAR2,
        p_payment_method IN VARCHAR2,
        p_booking_id    OUT NUMBER,
        p_payment_id    OUT NUMBER
    ) IS
        v_available_seats NUMBER;
        v_base_fare       NUMBER;
        v_discount        NUMBER := 0;
        v_total_paid      NUMBER;
        v_passenger_tier  VARCHAR2(30);
    BEGIN
        -- 1. Lock and check Trip availability
        SELECT AVAILABLE_SEATS INTO v_available_seats
        FROM TRIPS WHERE TRIP_ID = p_trip_id FOR UPDATE;

        IF v_available_seats <= 0 THEN
            RAISE_APPLICATION_ERROR(-20010, 'Trip is fully booked. Zero seats remaining.');
        END IF;

        -- 2. Fetch Passenger Tier for Discount Logic
        SELECT PASSENGER_TIER INTO v_passenger_tier
        FROM PASSENGERS WHERE PASSENGER_ID = p_passenger_id;

        -- 3. Calculate Fare
        SELECT r.BASE_FARE INTO v_base_fare
        FROM TRIPS t JOIN ROUTES r ON t.ROUTE_ID = r.ROUTE_ID
        WHERE t.TRIP_ID = p_trip_id;

        IF v_passenger_tier = 'STUDENT' THEN
            v_discount := ROUND(v_base_fare * 0.20, 2); -- 20% Student Subsidy
        ELSIF v_passenger_tier = 'CORPORATE_EMPLOYEE' THEN
            v_discount := ROUND(v_base_fare * 0.15, 2); -- 15% Corporate Partner Subsidy
        ELSIF v_passenger_tier = 'SENIOR_CITIZEN' THEN
            v_discount := ROUND(v_base_fare * 0.25, 2); -- 25% Senior Subsidy
        END IF;

        v_total_paid := v_base_fare - v_discount;

        -- 4. Insert Booking
        p_booking_id := SEQ_BOOKINGS.NEXTVAL;
        INSERT INTO BOOKINGS (
            BOOKING_ID, TRIP_ID, PASSENGER_ID, SEAT_NUMBER,
            BOOKING_TIMESTAMP, FARE_AMOUNT, DISCOUNT_APPLIED, TOTAL_PAID, STATUS
        ) VALUES (
            p_booking_id, p_trip_id, p_passenger_id, p_seat_number,
            SYSTIMESTAMP, v_base_fare, v_discount, v_total_paid, 'CONFIRMED'
        );

        -- 5. Insert Matching Payment Ledger
        p_payment_id := SEQ_PAYMENTS.NEXTVAL;
        INSERT INTO PAYMENTS (
            PAYMENT_ID, BOOKING_ID, AMOUNT, PAYMENT_METHOD,
            TRANSACTION_REFERENCE, PAYMENT_TIMESTAMP, PAYMENT_STATUS, GATEWAY_RESPONSE_CODE
        ) VALUES (
            p_payment_id, p_booking_id, v_total_paid, p_payment_method,
            'TXN-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || p_booking_id,
            SYSTIMESTAMP, 'SUCCESS', 'AUTH_200_OK'
        );

        -- 6. Trigger TRG_DECREMENT_TRIP_SEATS handles seat decrement automatically!
        COMMIT;

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            ROLLBACK;
            RAISE_APPLICATION_ERROR(-20011, 'Seat ' || p_seat_number || ' has already been reserved on this trip.');
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END SP_BOOK_TICKET_TRANSACTION;

END PKG_TRANSPORT_REPORTS;
/
`;

export const BUSINESS_REPORTS: ReportItem[] = [
  {
    id: 'report_top_routes',
    title: 'Report 1: Most Frequently Used Routes',
    description: 'Ranks corridors based on ticket bookings, passenger volume, occupancy rates, and revenue generation.',
    procedureSignature: 'PROCEDURE GET_TOP_ROUTES(p_start_date IN DATE, p_end_date IN DATE, p_limit IN NUMBER, p_results_cur OUT t_cursor)',
    parameters: [
      { name: 'start_date', type: 'DATE', defaultValue: '2026-10-01', label: 'Start Date', description: 'Beginning of observation period' },
      { name: 'end_date', type: 'DATE', defaultValue: '2026-10-31', label: 'End Date', description: 'End of observation period' },
      { name: 'limit', type: 'NUMBER', defaultValue: '5', label: 'Top N Limit', description: 'Number of top routes to return' },
    ],
    plsqlSource: PLSQL_PACKAGE_BODY.split('-- 1. REPORT 1:')[1].split('-- ---------------------------------------------------------------------')[1],
  },
  {
    id: 'report_period_revenue',
    title: 'Report 2: Total Revenue Generated from Ticket Sales',
    description: 'Calculates financial performance over arbitrary date intervals with payment method breakdown and average ticket values.',
    procedureSignature: 'FUNCTION CALC_PERIOD_REVENUE(p_start_date IN DATE, p_end_date IN DATE, p_payment_method IN VARCHAR2) RETURN NUMBER',
    parameters: [
      { name: 'start_date', type: 'DATE', defaultValue: '2026-10-01', label: 'Start Date', description: 'Fiscal reporting start' },
      { name: 'end_date', type: 'DATE', defaultValue: '2026-10-31', label: 'End Date', description: 'Fiscal reporting end' },
      { name: 'payment_method', type: 'VARCHAR2', defaultValue: 'ALL', label: 'Payment Method Filter', description: 'Filter by channel: CREDIT_CARD, DIGITAL_WALLET, CORPORATE_ACCOUNT, or ALL' },
    ],
    plsqlSource: PLSQL_PACKAGE_BODY.split('-- 2. REPORT 2:')[1].split('-- ---------------------------------------------------------------------')[1],
  },
  {
    id: 'report_passenger_history',
    title: 'Report 3: Passenger Travel History Report',
    description: 'Generates comprehensive passenger journey dossier, lifetime expenditure, preferred corridors, and loyalty audit.',
    procedureSignature: 'PROCEDURE GET_PASSENGER_HISTORY(p_passenger_id IN NUMBER, p_history_cur OUT t_cursor, p_total_spend OUT NUMBER, p_trips_count OUT NUMBER)',
    parameters: [
      { name: 'passenger_id', type: 'NUMBER', defaultValue: '401', label: 'Passenger ID', description: 'Enter passenger identifier to query dossier' },
    ],
    plsqlSource: PLSQL_PACKAGE_BODY.split('-- 3. REPORT 3:')[1].split('-- ---------------------------------------------------------------------')[1],
  },
  {
    id: 'report_maintenance_due',
    title: 'Report 4: Vehicles Due for Maintenance',
    description: 'Identifies fleet assets exceeding or nearing safety thresholds based on odometer readings and calendar deadlines.',
    procedureSignature: 'PROCEDURE CHECK_FLEET_MAINTENANCE_DUE(p_mileage_threshold_km IN NUMBER, p_days_threshold IN NUMBER, p_vehicles_cur OUT t_cursor)',
    parameters: [
      { name: 'mileage_threshold_km', type: 'NUMBER', defaultValue: '1000', label: 'Mileage Buffer (KM)', description: 'Flag vehicles within this remaining distance' },
      { name: 'days_threshold', type: 'NUMBER', defaultValue: '14', label: 'Calendar Buffer (Days)', description: 'Flag vehicles within this inspection date window' },
    ],
    plsqlSource: PLSQL_PACKAGE_BODY.split('-- 4. REPORT 4:')[1].split('-- ---------------------------------------------------------------------')[1],
  },
  {
    id: 'report_driver_performance',
    title: 'Report 5: Driver Performance & Safety Rating Analysis',
    description: 'Evaluates driver conduct, safety index, customer ratings, commendations, and trip volume.',
    procedureSignature: 'PROCEDURE ANALYZE_DRIVER_PERFORMANCE(p_min_trips IN NUMBER, p_drivers_cur OUT t_cursor)',
    parameters: [
      { name: 'min_trips', type: 'NUMBER', defaultValue: '1', label: 'Minimum Trips Completed', description: 'Filter captains with at least N trips' },
    ],
    plsqlSource: PLSQL_PACKAGE_BODY.split('-- 5. REPORT 5:')[1].split('-- ---------------------------------------------------------------------')[1],
  },
];
