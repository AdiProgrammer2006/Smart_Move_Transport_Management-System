import React, { useState } from 'react';
import { BUSINESS_REPORTS, PLSQL_PACKAGE_SPEC, PLSQL_PACKAGE_BODY } from '../data/plsqlReports';
import {
  INITIAL_ROUTES,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_PASSENGERS,
  INITIAL_TRIPS,
} from '../data/seedData';
import { BarChart3, Code2, Play, Download, Copy, Check, ChevronRight, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const PlsqlReportsView: React.FC = () => {
  const [selectedReportId, setSelectedReportId] = useState<string>('report_top_routes');
  const [activeTab, setActiveTab] = useState<'RESULTS' | 'PLSQL_CODE' | 'PACKAGE_SPEC'>('RESULTS');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<string>('Package PKG_TRANSPORT_REPORTS compiled successfully. Cursor state: READY.');

  // Form parameters state
  const [params, setParams] = useState<Record<string, string>>({
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    limit: '5',
    payment_method: 'ALL',
    passenger_id: '401',
    mileage_threshold_km: '1000',
    days_threshold: '14',
    min_trips: '1',
  });

  const currentReport = BUSINESS_REPORTS.find((r) => r.id === selectedReportId) || BUSINESS_REPORTS[0];

  const handleParamChange = (name: string, value: string) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setExecutionLog(`Executing PL/SQL procedure: ${currentReport.procedureSignature}...`);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionLog(`PL/SQL Block executed in 14ms. Ref Cursor opened and fetched successfully. ORA-00000: NORMAL SUCCESSFUL COMPLETION.`);
    }, 450);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Report 1 Data: Top Routes
  const renderTopRoutes = () => {
    const routeStats = INITIAL_ROUTES.map((route) => {
      const routeTrips = INITIAL_TRIPS.filter((t) => t.route_id === route.route_id);
      const tripIds = routeTrips.map((t) => t.trip_id);
      const routeBookings = INITIAL_BOOKINGS.filter((b) => tripIds.includes(b.trip_id));
      const totalRevenue = routeBookings.reduce((sum, b) => sum + b.total_paid, 0);
      const totalSeats = routeTrips.reduce((sum, t) => sum + t.total_seats, 0) || 1;
      const occupiedSeats = routeTrips.reduce((sum, t) => sum + (t.total_seats - t.available_seats), 0);
      const occupancyRate = Number(((occupiedSeats / totalSeats) * 100).toFixed(1));

      return {
        route_id: route.route_id,
        route_code: route.route_code,
        route_name: route.route_name,
        category: route.category,
        total_bookings: routeBookings.length,
        total_revenue: totalRevenue,
        occupancy_rate: occupancyRate,
      };
    }).sort((a, b) => b.total_bookings - a.total_bookings);

    const maxBookings = Math.max(...routeStats.map((r) => r.total_bookings), 1);

    return (
      <div className="space-y-4">
        {/* Visual Bar Chart */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Corridor Popularity Ranking (Ticket Bookings)
          </h4>
          <div className="space-y-2">
            {routeStats.map((item, idx) => (
              <div key={item.route_id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">
                    #{idx + 1}. {item.route_code} — {item.route_name}
                  </span>
                  <span className="font-mono text-teal-400 font-bold">{item.total_bookings} Bookings</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                    style={{ width: `${(item.total_bookings / maxBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabular Output */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">RANK</th>
                <th className="p-3">ROUTE CODE</th>
                <th className="p-3">CORRIDOR TITLE</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3 text-right">TOTAL BOOKINGS</th>
                <th className="p-3 text-right">ROUTE REVENUE</th>
                <th className="p-3 text-right">OCCUPANCY %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {routeStats.map((r, i) => (
                <tr key={r.route_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-amber-400">#{i + 1}</td>
                  <td className="p-3 font-mono font-semibold text-teal-300">{r.route_code}</td>
                  <td className="p-3 text-white font-medium">{r.route_name}</td>
                  <td className="p-3 text-slate-400 text-[11px]">{r.category.replace('_', ' ')}</td>
                  <td className="p-3 text-right font-mono font-bold text-white tabular-nums">{r.total_bookings}</td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-semibold tabular-nums">${r.total_revenue.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-slate-300 tabular-nums">{r.occupancy_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Report 2 Data: Revenue Breakdown
  const renderRevenueReport = () => {
    const paymentMethods = ['DIGITAL_WALLET', 'CORPORATE_ACCOUNT', 'CREDIT_CARD', 'DEBIT_CARD'];
    const breakdown = paymentMethods.map((method) => {
      const payments = INITIAL_PAYMENTS.filter(
        (p) => p.payment_method === method && p.payment_status === 'SUCCESS'
      );
      const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
      const avgTicket = payments.length > 0 ? totalVolume / payments.length : 0;
      return {
        method,
        tx_count: payments.length,
        total_volume: totalVolume,
        avg_ticket: avgTicket,
      };
    });

    const grandTotal = breakdown.reduce((sum, b) => sum + b.total_volume, 0);

    return (
      <div className="space-y-4">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Ledger Revenue</span>
            <span className="font-mono text-xl font-bold text-emerald-400 tabular-nums">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Successful Transactions</span>
            <span className="font-mono text-xl font-bold text-white tabular-nums">{INITIAL_PAYMENTS.length} txns</span>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Average Ticket Value</span>
            <span className="font-mono text-xl font-bold text-teal-400 tabular-nums">
              ${(grandTotal / (INITIAL_PAYMENTS.length || 1)).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tabular Output */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">PAYMENT METHOD / CHANNEL</th>
                <th className="p-3 text-right">TX COUNT</th>
                <th className="p-3 text-right">TOTAL VOLUME (USD)</th>
                <th className="p-3 text-right">AVG TICKET VALUE</th>
                <th className="p-3 text-right">REVENUE SHARE %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {breakdown.map((row) => (
                <tr key={row.method} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-semibold text-teal-300">{row.method.replace('_', ' ')}</td>
                  <td className="p-3 text-right font-mono text-white tabular-nums">{row.tx_count}</td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold tabular-nums">
                    ${row.total_volume.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-300 tabular-nums">
                    ${row.avg_ticket.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-amber-300 tabular-nums">
                    {((row.total_volume / (grandTotal || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Report 3 Data: Passenger Travel History
  const renderPassengerHistory = () => {
    const passengerId = Number(params.passenger_id || 401);
    const targetPassenger = INITIAL_PASSENGERS.find((p) => p.passenger_id === passengerId) || INITIAL_PASSENGERS[0];
    const passengerBookings = INITIAL_BOOKINGS.filter((b) => b.passenger_id === targetPassenger.passenger_id);
    const totalSpent = passengerBookings.reduce((sum, b) => sum + b.total_paid, 0);

    return (
      <div className="space-y-4">
        {/* Passenger Profile Dossier Card */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                {targetPassenger.first_name} {targetPassenger.last_name}
              </h4>
              <span className="text-[10px] font-mono bg-teal-950 border border-teal-800 text-teal-300 px-2 py-0.5 rounded">
                {(targetPassenger.passenger_tier || targetPassenger.loyalty_tier || 'STANDARD').replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {targetPassenger.email} · {targetPassenger.phone_number}
              {targetPassenger.organization_name && ` · ${targetPassenger.organization_name}`}
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL EXPENSES</span>
              <span className="text-emerald-400 font-bold text-sm">${totalSpent.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">TRIPS TAKEN</span>
              <span className="text-white font-bold text-sm">{passengerBookings.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">LOYALTY PTS</span>
              <span className="text-amber-400 font-bold text-sm">{targetPassenger.loyalty_points}</span>
            </div>
          </div>
        </div>

        {/* Journey Itinerary History */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">BOOKING REF</th>
                <th className="p-3">CORRIDOR / ROUTE</th>
                <th className="p-3">SEAT</th>
                <th className="p-3">DEPARTURE</th>
                <th className="p-3 text-right">FARE PAID</th>
                <th className="p-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {passengerBookings.map((b) => (
                <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-teal-300">#BK-{b.booking_id}</td>
                  <td className="p-3 text-white font-medium">{b.route_name || 'Corridor Journey'}</td>
                  <td className="p-3 font-mono text-amber-300">{b.seat_number}</td>
                  <td className="p-3 font-mono text-slate-300">
                    {b.departure_time ? new Date(b.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '2026-10-12 07:30'}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold tabular-nums">${b.total_paid.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Report 4 Data: Vehicles Due for Maintenance
  const renderMaintenanceDue = () => {
    const dueVehicles = INITIAL_VEHICLES.map((v) => {
      const nextKm = v.next_service_mileage_km || 100000;
      const kmRemaining = nextKm - v.current_mileage_km;
      const nextDate = v.next_service_date ? new Date(v.next_service_date) : new Date(Date.now() + 864000000);
      const isOverdue = v.current_mileage_km >= nextKm || nextDate <= new Date();
      const isDueSoon = kmRemaining <= 1000;

      let urgency = 'NOMINAL';
      if (isOverdue) urgency = 'CRITICAL_OVERDUE';
      else if (isDueSoon) urgency = 'DUE_SOON';

      return {
        ...v,
        next_service_mileage_km: nextKm,
        kmRemaining,
        urgency,
      };
    }).sort((a, b) => (a.urgency === 'CRITICAL_OVERDUE' ? -1 : 1));

    return (
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-xl flex items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Automated ORA-Trigger flagged 1 asset exceeding mandated mileage threshold (SM-VAN-1105) and 1 asset approaching service window.
          </span>
        </div>

        {/* Tabular Output */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">REGISTRATION</th>
                <th className="p-3">MODEL & TYPE</th>
                <th className="p-3 text-right">CURRENT ODOMETER</th>
                <th className="p-3 text-right">SERVICE THRESHOLD</th>
                <th className="p-3 text-right">BUFFER REMAINING</th>
                <th className="p-3">NEXT DATE</th>
                <th className="p-3 text-center">MAINTENANCE URGENCY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {dueVehicles.map((v) => (
                <tr key={v.vehicle_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-teal-300">{v.registration_no}</td>
                  <td className="p-3 text-white">
                    <span className="font-medium block">{v.model_name}</span>
                    <span className="text-[10px] text-slate-400">{v.vehicle_type}</span>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-200 tabular-nums">{v.current_mileage_km.toLocaleString()} km</td>
                  <td className="p-3 text-right font-mono text-slate-400 tabular-nums">{(v.next_service_mileage_km || 100000).toLocaleString()} km</td>
                  <td className="p-3 text-right font-mono tabular-nums font-bold">
                    <span className={v.kmRemaining <= 0 ? 'text-rose-400' : v.kmRemaining <= 1000 ? 'text-amber-400' : 'text-slate-300'}>
                      {v.kmRemaining.toLocaleString()} km
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{v.next_service_date}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold ${
                        v.urgency === 'CRITICAL_OVERDUE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : v.urgency === 'DUE_SOON'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {v.urgency.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Report 5 Data: Driver Performance Analysis
  const renderDriverPerformance = () => {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">CAPTAIN NAME</th>
                <th className="p-3">LICENSE CLASS</th>
                <th className="p-3 text-right">EXPERIENCE</th>
                <th className="p-3 text-right">SAFETY INDEX</th>
                <th className="p-3 text-right">PASSENGER RATING</th>
                <th className="p-3 text-right">COMPLETED TRIPS</th>
                <th className="p-3 text-center">PERFORMANCE BADGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {INITIAL_DRIVERS.map((d) => (
                <tr key={d.driver_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-white block">{d.full_name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{d.license_number}</span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-400 font-mono">{d.license_class.replace('_', ' ')}</td>
                  <td className="p-3 text-right font-mono text-slate-300 tabular-nums">{d.years_experience} yrs</td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold tabular-nums">{d.safety_score} / 100</td>
                  <td className="p-3 text-right font-mono text-amber-400 font-bold tabular-nums">★ {d.rating.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-white tabular-nums">{d.total_trips_completed}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        d.rating >= 4.90
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : d.rating >= 4.80
                          ? 'bg-teal-950 text-teal-300 border border-teal-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {d.rating >= 4.90 ? 'MASTER CAPTAIN' : d.rating >= 4.80 ? 'EXEMPLARY' : 'STANDARD'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Oracle PL/SQL Enterprise Reporting Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Database business logic implemented via stored procedures, ref cursors, user-defined exceptions, and package bodies.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'RESULTS'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Business Report
          </button>
          <button
            onClick={() => setActiveTab('PLSQL_CODE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'PLSQL_CODE'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PL/SQL Procedure Body
          </button>
          <button
            onClick={() => setActiveTab('PACKAGE_SPEC')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'PACKAGE_SPEC'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Package Spec (.spc)
          </button>
        </div>
      </div>

      {/* Report Switcher Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {BUSINESS_REPORTS.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportId(rep.id)}
            className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
              selectedReportId === rep.id
                ? 'bg-teal-950/40 border-teal-500/80 text-white shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="text-[10px] font-mono text-teal-400 uppercase tracking-wider mb-1">
              REPORT #{rep.id.split('_')[1]}
            </div>
            <div className="text-xs font-semibold text-white line-clamp-1">{rep.title.split(': ')[1]}</div>
          </button>
        ))}
      </div>

      {/* Main Content Pane */}
      {activeTab === 'RESULTS' ? (
        <div className="space-y-5">
          {/* Controls & Interactive Parameters Strip */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{currentReport.title}</h3>
                <p className="text-xs text-slate-400">{currentReport.description}</p>
              </div>
              <button
                disabled={isExecuting}
                onClick={handleExecute}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? 'Executing PL/SQL...' : 'Execute Stored Procedure'}</span>
              </button>
            </div>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {currentReport.parameters.map((param) => (
                <div key={param.name} className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                    <span>{param.label}</span>
                    <span className="font-mono text-[9px] text-slate-500">{param.type}</span>
                  </label>
                  {param.name === 'passenger_id' ? (
                    <select
                      value={params[param.name] || param.defaultValue}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    >
                      {INITIAL_PASSENGERS.map((p) => (
                        <option key={p.passenger_id} value={p.passenger_id}>
                          {p.first_name} {p.last_name} (ID: {p.passenger_id})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={param.type === 'DATE' ? 'date' : param.type === 'NUMBER' ? 'number' : 'text'}
                      value={params[param.name] || param.defaultValue}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                    />
                  )}
                  <p className="text-[10px] text-slate-500">{param.description}</p>
                </div>
              ))}
            </div>

            {/* Execution Console Output */}
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-teal-300 flex items-center justify-between">
              <span>{executionLog}</span>
              <span className="text-slate-500 text-[10px]">AUTHID CURRENT_USER</span>
            </div>
          </div>

          {/* Render Active Report Result */}
          {selectedReportId === 'report_top_routes' && renderTopRoutes()}
          {selectedReportId === 'report_period_revenue' && renderRevenueReport()}
          {selectedReportId === 'report_passenger_history' && renderPassengerHistory()}
          {selectedReportId === 'report_maintenance_due' && renderMaintenanceDue()}
          {selectedReportId === 'report_driver_performance' && renderDriverPerformance()}
        </div>
      ) : activeTab === 'PLSQL_CODE' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-t-xl border border-slate-800">
            <span className="text-xs font-mono text-teal-400">{currentReport.procedureSignature}</span>
            <button
              onClick={() => handleCopyCode(currentReport.plsqlSource)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed max-h-[550px]">
            {currentReport.plsqlSource}
          </pre>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-t-xl border border-slate-800">
            <span className="text-xs font-mono text-teal-400">PACKAGE PKG_TRANSPORT_REPORTS HEADER & SPEC</span>
            <button
              onClick={() => handleCopyCode(PLSQL_PACKAGE_SPEC + '\n\n' + PLSQL_PACKAGE_BODY)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Full Package' : 'Copy Full Spec & Body'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-xl overflow-x-auto text-xs font-mono text-teal-300 leading-relaxed max-h-[550px]">
            {PLSQL_PACKAGE_SPEC}
          </pre>
        </div>
      )}
    </div>
  );
};
