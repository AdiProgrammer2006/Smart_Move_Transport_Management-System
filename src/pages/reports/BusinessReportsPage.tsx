import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  Clock,
  Bus,
  Users,
  CreditCard,
  Wrench,
  Award,
  Code2,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  MOCK_ROUTES,
  MOCK_BOOKINGS,
  MOCK_PAYMENTS,
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  MOCK_PASSENGERS,
  MOCK_MAINTENANCE,
} from '../../mockData';
import { formatLKR, formatDate } from '../../utils/formatters';

export const BusinessReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showSqlCode, setShowSqlCode] = useState(false);

  // Filters
  const [timeframe, setTimeframe] = useState<'30days' | '90days' | 'ytd'>('30days');
  const [selectedRouteId, setSelectedRouteId] = useState('ALL');

  // Colors
  const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

  // ===================== REPORT 1: Most Frequently Used Routes =====================
  const report1Data = MOCK_ROUTES.map((r) => {
    const routeBookings = MOCK_BOOKINGS.filter((b) => b.routeName.includes(r.routeName) || b.startingLocation === r.startingLocation);
    const totalTickets = routeBookings.reduce((sum, b) => sum + b.seats.length, 0);
    const totalRevenue = routeBookings.reduce((sum, b) => sum + b.totalAmountLkr, 0);
    return {
      name: r.routeName.split(' ')[0] + ' ↔ ' + r.routeName.split(' ').slice(-1)[0],
      fullName: r.routeName,
      ticketsSold: Math.max(totalTickets, r.isPopular ? 142 : 45),
      revenue: Math.max(totalRevenue, r.isPopular ? 185000 : 54000),
      distance: r.distanceKm,
    };
  }).sort((a, b) => b.ticketsSold - a.ticketsSold);

  // ===================== REPORT 2: Total Revenue by Period =====================
  const report2Daily = [
    { day: 'Mon 06', revenue: 142500, bookings: 78 },
    { day: 'Tue 07', revenue: 168000, bookings: 92 },
    { day: 'Wed 08', revenue: 184500, bookings: 104 },
    { day: 'Thu 09', revenue: 212000, bookings: 118 },
    { day: 'Fri 10', revenue: 295000, bookings: 165 },
    { day: 'Sat 11', revenue: 345000, bookings: 195 },
    { day: 'Sun 12', revenue: 310000, bookings: 172 },
  ];

  // ===================== REPORT 3: Passenger Travel & Loyalty =====================
  const report3Data = MOCK_PASSENGERS.map((p) => {
    const pBookings = MOCK_BOOKINGS.filter((b) => b.passengerEmail === p.email);
    const spend = pBookings.reduce((s, b) => s + b.totalAmountLkr, 0);
    return {
      id: p.id,
      name: p.fullName,
      tier: p.tier,
      totalTrips: Math.max(pBookings.length, p.tier === 'Corporate Partner' ? 18 : 6),
      totalSpent: Math.max(spend, p.tier === 'Corporate Partner' ? 38500 : 12400),
      loyaltyPoints: p.loyaltyPoints,
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  // ===================== REPORT 4: Vehicles Due for Maintenance =====================
  const report4Data = MOCK_VEHICLES.map((v) => {
    const serviceIntervalKm = 25000;
    const kmSinceLastService = v.mileageKm % serviceIntervalKm;
    const kmRemaining = serviceIntervalKm - kmSinceLastService;
    const isUrgent = kmRemaining < 5000 || v.status === 'Maintenance';
    return {
      reg: v.registrationNumber,
      model: `${v.brand} ${v.model}`,
      currentMileage: v.mileageKm,
      kmRemaining,
      status: v.status,
      urgent: isUrgent,
      lastServiceCost: 45000,
    };
  }).sort((a, b) => a.kmRemaining - b.kmRemaining);

  // ===================== REPORT 5: Driver Performance Audit =====================
  const report5Data = MOCK_DRIVERS.map((d) => ({
    name: d.fullName,
    license: d.licenseNumber,
    trips: d.totalTripsCompleted,
    rating: d.safetyRating,
    onTimeRate: '98.4%',
    status: d.status,
    experience: `${d.yearsExperience} yrs`,
  })).sort((a, b) => b.rating - a.rating);

  const plsqlCodeSnippets = {
    1: `-- PL/SQL Report 1: Top Booked Routes
CREATE OR REPLACE PROCEDURE SP_REPORT_TOP_ROUTES(p_limit IN NUMBER DEFAULT 5) AS
  CURSOR c_routes IS
    SELECT r.route_name, COUNT(b.booking_id) AS total_bookings, SUM(b.total_amount_lkr) AS total_revenue
    FROM routes r
    JOIN trips t ON r.route_id = t.route_id
    JOIN bookings b ON t.trip_id = b.trip_id
    WHERE b.booking_status = 'Confirmed'
    GROUP BY r.route_name
    ORDER BY total_bookings DESC;
BEGIN
  FOR r_rec IN c_routes LOOP
    DBMS_OUTPUT.PUT_LINE(r_rec.route_name || ' | Bookings: ' || r_rec.total_bookings);
  END LOOP;
END;`,
    2: `-- PL/SQL Report 2: Revenue Calculation Engine
CREATE OR REPLACE FUNCTION FN_GET_TOTAL_REVENUE(p_start_date IN DATE, p_end_date IN DATE) 
RETURN NUMBER IS
  v_total NUMBER := 0;
BEGIN
  SELECT NVL(SUM(amount_lkr), 0) INTO v_total
  FROM payments
  WHERE payment_status = 'Paid'
    AND transaction_date BETWEEN p_start_date AND p_end_date;
  RETURN v_total;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;`,
    3: `-- PL/SQL Report 3: Passenger Travel History Audit
CREATE OR REPLACE PROCEDURE SP_PASSENGER_TRAVEL_SUMMARY(p_passenger_id IN VARCHAR2) AS
  TYPE t_history IS RECORD (route_name VARCHAR2(100), fare NUMBER, departure_date DATE);
  CURSOR c_history IS
    SELECT r.route_name, b.total_amount_lkr, t.departure_datetime
    FROM bookings b
    JOIN trips t ON b.trip_id = t.trip_id
    JOIN routes r ON t.route_id = r.route_id
    WHERE b.passenger_id = p_passenger_id;
BEGIN
  FOR rec IN c_history LOOP
    DBMS_OUTPUT.PUT_LINE(rec.route_name || ' on ' || TO_CHAR(rec.departure_date, 'YYYY-MM-DD'));
  END LOOP;
END;`,
    4: `-- PL/SQL Report 4: Vehicles Due for Service
CREATE OR REPLACE PROCEDURE SP_VEHICLES_DUE_MAINTENANCE(p_threshold_km IN NUMBER DEFAULT 5000) AS
  CURSOR c_veh IS
    SELECT registration_number, mileage_km,
           (25000 - MOD(mileage_km, 25000)) AS km_until_service
    FROM vehicles
    WHERE (25000 - MOD(mileage_km, 25000)) <= p_threshold_km
    ORDER BY km_until_service ASC;
BEGIN
  FOR v IN c_veh LOOP
    DBMS_OUTPUT.PUT_LINE('ALERT: ' || v.registration_number || ' due in ' || v.km_until_service || ' km');
  END LOOP;
END;`,
    5: `-- PL/SQL Report 5: Driver Safety and Performance Audit
CREATE OR REPLACE PROCEDURE SP_DRIVER_PERFORMANCE_AUDIT AS
  CURSOR c_drv IS
    SELECT full_name, license_number, safety_rating, total_trips_completed
    FROM drivers
    WHERE status != 'Inactive'
    ORDER BY safety_rating DESC;
BEGIN
  FOR d IN c_drv LOOP
    DBMS_OUTPUT.PUT_LINE(d.full_name || ' | Rating: ' || d.safety_rating || ' | Completed: ' || d.total_trips_completed);
  END LOOP;
END;`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-teal-400" />
            <span>Business Reports & PL/SQL Analytics Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enterprise business intelligence, route load metrics, revenue aggregation, and fleet audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSqlCode(!showSqlCode)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              showSqlCode
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{showSqlCode ? 'Hide PL/SQL Code' : 'Inspect PL/SQL Engine'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 5 Business Reports Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        {[
          { id: 1, label: '1. Top Used Routes', icon: Compass },
          { id: 2, label: '2. Revenue Trends', icon: TrendingUp },
          { id: 3, label: '3. Passenger History', icon: Users },
          { id: 4, label: '4. Service Inspection', icon: Wrench },
          { id: 5, label: '5. Driver Safety Audit', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PL/SQL Code Drawer */}
      {showSqlCode && (
        <div className="p-5 bg-slate-950 border border-teal-500/40 rounded-3xl space-y-2 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between text-teal-400 pb-2 border-b border-slate-800">
            <span className="font-bold flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Oracle Database 21c PL/SQL Package Logic (Report #{activeReport})</span>
            </span>
            <span className="text-[10px] text-slate-400">ENGINE: ORACLE PL/SQL V12.2</span>
          </div>
          <pre className="text-teal-300 overflow-x-auto p-2 bg-slate-900 rounded-xl leading-relaxed whitespace-pre-wrap">
            {plsqlCodeSnippets[activeReport]}
          </pre>
        </div>
      )}

      {/* Report 1 View */}
      {activeReport === 1 && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Most Frequently Used Transit Corridors</h2>
                <p className="text-xs text-slate-400">
                  Passenger seat reservations analyzed across intercity routes
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report1Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#2dd4bf' }}
                  />
                  <Bar dataKey="ticketsSold" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Tickets Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Rank & Corridor Name</th>
                    <th className="px-4 py-3">Distance</th>
                    <th className="px-4 py-3">Total Tickets Sold</th>
                    <th className="px-4 py-3">Total Ticket Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report1Data.map((item, idx) => (
                    <tr key={item.fullName} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">
                        #{idx + 1} {item.fullName}
                      </td>
                      <td className="px-4 py-3 font-mono">{item.distance} km</td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-400">{item.ticketsSold} seats</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{formatLKR(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 2 View */}
      {activeReport === 2 && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Revenue Generated from Ticket Sales</h2>
                <p className="text-xs text-slate-400">
                  Weekly collections across online cards, counter payments, and mobile wallets
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report2Daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Daily Revenue (LKR)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Weekly Aggregate:</span>
                <span className="text-lg font-bold text-teal-400">{formatLKR(1659500)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Peak Day:</span>
                <span className="text-lg font-bold text-white">Sat 11 ({formatLKR(345000)})</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Avg Fare / Seat:</span>
                <span className="text-lg font-bold text-white">{formatLKR(1790)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Gateway Settle:</span>
                <span className="text-lg font-bold text-purple-400">100% RECONCILED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 3 View */}
      {activeReport === 3 && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white">Passenger Travel History & Commuter Loyalty Report</h2>
              <p className="text-xs text-slate-400">
                Frequent traveler tier metrics, corporate spend patterns, and accumulated reward balances
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Passenger Name</th>
                    <th className="px-4 py-3">Membership Tier</th>
                    <th className="px-4 py-3">Completed Trips</th>
                    <th className="px-4 py-3">Total Spend</th>
                    <th className="px-4 py-3">Loyalty Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report3Data.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono text-[10px]">
                          {p.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">{p.totalTrips} journeys</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{formatLKR(p.totalSpent)}</td>
                      <td className="px-4 py-3 font-mono text-teal-400 font-bold">{p.loyaltyPoints} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 4 View */}
      {activeReport === 4 && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white">Vehicles Due for Maintenance & Inspection Audit</h2>
              <p className="text-xs text-slate-400">
                Mileage-based 25,000 km periodic service interval alerts and current workshop statuses
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Registration Number</th>
                    <th className="px-4 py-3">Model Specs</th>
                    <th className="px-4 py-3">Odometer Mileage</th>
                    <th className="px-4 py-3">Remaining to Service</th>
                    <th className="px-4 py-3">Operational Status</th>
                    <th className="px-4 py-3">Inspection Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report4Data.map((v) => (
                    <tr key={v.reg} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white">{v.reg}</td>
                      <td className="px-4 py-3 text-slate-300">{v.model}</td>
                      <td className="px-4 py-3 font-mono">{v.currentMileage.toLocaleString()} km</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={v.urgent ? 'text-amber-400' : 'text-teal-400'}>
                          {v.kmRemaining.toLocaleString()} km left
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.urgent
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {v.urgent ? 'Service Due / Urgent' : 'Normal Fleet Cycle'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 5 View */}
      {activeReport === 5 && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white">Driver Captain Performance & Safety Audit</h2>
              <p className="text-xs text-slate-400">
                Safety rating audits, zero-incident track records, completed passenger trips, and on-time dispatches
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Captain Name</th>
                    <th className="px-4 py-3">License Number</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Completed Trips</th>
                    <th className="px-4 py-3">Safety Rating</th>
                    <th className="px-4 py-3">On-Time Arrival Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {report5Data.map((d) => (
                    <tr key={d.license} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-white">{d.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{d.license}</td>
                      <td className="px-4 py-3 font-mono">{d.experience}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{d.trips} trips</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">★ {d.rating.toFixed(1)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-400">{d.onTimeRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
