import React from 'react';
import { Vehicle, Driver, TransportRoute, Trip, Booking, Payment } from '../data/relationalTypes';
import { Bus, Users, TrendingUp, AlertTriangle, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { fleetCoachImg, transitHubImg } from '../data/seedData';

interface DashboardViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: TransportRoute[];
  trips: Trip[];
  bookings: Booking[];
  payments: Payment[];
  onNavigate: (tab: any) => void;
  onOpenTicket: (booking: Booking) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  drivers,
  routes,
  trips,
  bookings,
  payments,
  onNavigate,
  onOpenTicket,
}) => {
  const activeFleetCount = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'MAINTENANCE').length;
  const activeTrips = trips.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'BOARDING');
  const totalRevenue = payments
    .filter((p) => p.payment_status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Hero Operational Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2.5 py-0.5 rounded">
                  Live Operations Command
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Oracle 21c EE · MongoDB 7.0 Atlas
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
                SmartMove Transport Solutions Central Dispatch
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                Integrated enterprise passenger transit platform managing intercity coaches, electric commuter shuttles, corporate employee charters, and student routes.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onNavigate('booking')}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Bus className="w-4 h-4" />
                <span>Reserve Passenger Seat</span>
              </button>
              <button
                onClick={() => onNavigate('plsql_reports')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>View PL/SQL Reports (5)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('er_diagram')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Inspect EER Architecture
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src={transitHubImg}
              alt="SmartMove Smart Transit Platform"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Full-Width Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fleet Readiness</span>
            <Bus className="w-4 h-4 text-teal-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {activeFleetCount} / {vehicles.length}
          </div>
          <div className="text-[11px] text-slate-400">
            {maintenanceCount > 0 ? (
              <span className="text-amber-400 font-medium">1 Vehicle in Maintenance</span>
            ) : (
              <span className="text-emerald-400 font-medium">All Assets Nominal</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Dispatches</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {activeTrips.length} Live
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">98.2% On-Time Dispatch</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Settled Revenue</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Ledger Verified</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Fleet Safety Index</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">97.4%</div>
          <div className="text-[11px] text-teal-400 font-medium">Zero Recorded Incidents</div>
        </div>
      </div>

      {/* Operations Grid: Live Trip Board (8 cols) + Urgent Maintenance / Quick Booking (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Timetable & Dispatch Board */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Live Dispatches & Journey Tracking</h3>
                <p className="text-xs text-slate-400">Timetable status across metropolitan express and airport routes</p>
              </div>
              <span className="font-mono text-[11px] text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                {trips.length} Timetabled Runs
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {trips.map((trip) => {
                const route = routes.find((r) => r.route_id === trip.route_id);
                const vehicle = vehicles.find((v) => v.vehicle_id === trip.vehicle_id);
                const driver = drivers.find((d) => d.driver_id === trip.driver_id);
                const occupied = trip.total_seats - trip.available_seats;
                const occupancyPct = Math.round((occupied / trip.total_seats) * 100);

                return (
                  <div key={trip.trip_id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-400">{route?.route_code}</span>
                        <span className="text-xs font-semibold text-white">{route?.route_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Captain: <strong className="text-slate-200">{driver?.full_name}</strong></span>
                        <span>·</span>
                        <span>Asset: <strong className="text-slate-200">{vehicle?.registration_no}</strong> ({vehicle?.model_name})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">DEPARTURE</span>
                        <span className="text-white font-semibold">
                          {new Date(trip.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="w-24">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span>Occupancy</span>
                          <span className="text-teal-300 font-bold">{occupancyPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full"
                            style={{ width: `${occupancyPct}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            trip.status === 'IN_TRANSIT'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : trip.status === 'BOARDING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : trip.status === 'COMPLETED'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-teal-950 text-teal-300 border border-teal-800'
                          }`}
                        >
                          {trip.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Confirmed Bookings Strip */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Ticket Ledger Transactions</h3>
              <button
                onClick={() => onNavigate('booking')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
              >
                + New Reservation
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 font-mono border-b border-slate-800">
                  <tr>
                    <th className="pb-2">BOOKING ID</th>
                    <th className="pb-2">PASSENGER</th>
                    <th className="pb-2">ROUTE</th>
                    <th className="pb-2">SEAT</th>
                    <th className="pb-2 text-right">PAID</th>
                    <th className="pb-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.booking_id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-teal-300 font-bold">#BK-{b.booking_id}</td>
                      <td className="py-2.5 text-white font-sans">{b.passenger_name}</td>
                      <td className="py-2.5 text-slate-400 font-sans truncate max-w-[140px]">{b.route_name}</td>
                      <td className="py-2.5 text-amber-300">{b.seat_number}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold tabular-nums">${b.total_paid.toFixed(2)}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onOpenTicket(b)}
                          className="text-[11px] font-sans text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                        >
                          View Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet Maintenance Alert & Quick Corridor Guide */}
        <div className="lg:col-span-4 space-y-4">
          {/* Urgent Maintenance Card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Fleet Maintenance Priority</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white">SM-VAN-1105</h4>
                  <span className="text-[10px] text-slate-400">Mercedes-Benz Sprinter 319 CDI</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  OVERDUE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Odometer reached 62,400km exceeding 60,000km brake threshold. Brake overhaul work order #801 in progress.
              </p>
              <div className="pt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Garage: Central Bay #2</span>
                <span>Cost: $840.00</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('plsql_reports')}
              className="w-full py-2 text-xs font-semibold text-teal-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Open Maintenance Report (Report 4) →
            </button>
          </div>

          {/* MongoDB Unstructured Highlight */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Community & Bulletins</span>
              <span className="text-[10px] font-mono text-emerald-400">MongoDB Feed</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase">Alert: SM-101 / SM-204</span>
                <p className="text-slate-300 line-clamp-2">
                  Metro Grand Central Platform 4 flooring upgrades. Boarding temporarily at Bay 7.
                </p>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-mono text-teal-400 uppercase">Student Forum Notice</span>
                <p className="text-slate-300 line-clamp-2">
                  University Shuttle standby vans added for exam week peak commute hours.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('mongodb_hub')}
              className="w-full py-2 text-xs font-semibold text-emerald-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Explore MongoDB NoSQL Hub →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
