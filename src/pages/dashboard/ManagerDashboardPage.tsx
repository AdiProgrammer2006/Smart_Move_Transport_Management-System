import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bus,
  Users,
  Compass,
  CalendarClock,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { vehicleService, driverService, routeService, tripService, maintenanceService } from '../../services';
import { Vehicle, Driver, Route, Trip, MaintenanceRecord } from '../../types';
import { formatTime } from '../../utils/formatters';

export const ManagerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  useEffect(() => {
    const loadManagerData = async () => {
      const [v, d, r, t, m] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        routeService.getAll(),
        tripService.getAll(),
        maintenanceService.getAll(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setRoutes(r);
      setTrips(t);
      setMaintenance(m);
    };
    loadManagerData();
  }, []);

  const overdueMaintenance = maintenance.filter((m) => m.status === 'Overdue');
  const activeDispatches = trips.filter((t) => t.status === 'In Progress' || t.status === 'Boarding');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Transport Manager Operations Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational fleet readiness, driver shift assignments, timetable execution, and workshop logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/app/vehicles')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fleet Inventory
          </button>
          <button
            onClick={() => navigate('/app/trips')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-md"
          >
            Dispatch Monitor
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block">Fleet In Service</span>
          <div className="font-mono text-2xl font-black text-white">
            {vehicles.filter((v) => v.status === 'Available' || v.status === 'Assigned').length} / {vehicles.length}
          </div>
          <span className="text-[11px] text-teal-400 font-mono">83.3% Fleet Availability</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block">Active Drivers On Duty</span>
          <div className="font-mono text-2xl font-black text-blue-400">
            {drivers.filter((d) => d.status === 'Active' || d.status === 'On Trip').length} / {drivers.length}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Roster Shift Nominal</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block">Live Dispatches</span>
          <div className="font-mono text-2xl font-black text-emerald-400">
            {activeDispatches.length} En Route
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">98.2% On-Time Execution</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block">Workshop Work Orders</span>
          <div className="font-mono text-2xl font-black text-amber-400">{maintenance.length}</div>
          <span className="text-[11px] text-rose-400 font-mono">{overdueMaintenance.length} Overdue Action</span>
        </div>
      </div>

      {/* Overdue Maintenance Banner if applicable */}
      {overdueMaintenance.length > 0 && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Critical Maintenance Alert</h4>
              <p className="text-xs text-slate-300">
                Asset <strong className="text-white font-mono">{overdueMaintenance[0].vehicleReg}</strong> has exceeded 145,000km milestone and requires immediate turbocharger overhaul.
              </p>
            </div>
          </div>
          <Link
            to="/app/maintenance"
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shrink-0"
          >
            Review Orders
          </Link>
        </div>
      )}

      {/* Main Grid: Trip Dispatch Roster (7 cols) + Driver Captains Status (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timetabled Trips */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Daily Corridor Dispatch Schedule</h3>
              <p className="text-xs text-slate-400">Real-time status updates from terminal bays</p>
            </div>
            <Link to="/app/trips" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
              Schedule Run →
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {trips.map((t) => (
              <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-300">{t.vehicleReg}</span>
                    <span className="text-xs font-semibold text-white">{t.routeName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Captain: {t.driverName}</span>
                    <span>·</span>
                    <span className="font-mono">{t.availableSeats} of {t.totalSeats} seats open</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-white block">
                    {formatTime(t.departureDateTime)}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      t.status === 'In Progress'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : t.status === 'Boarding'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers Shift Availability */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Driver Captains Roster</h3>
            <Link to="/app/drivers" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
              All Roster →
            </Link>
          </div>

          <div className="space-y-3">
            {drivers.map((d) => (
              <div key={d.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    {d.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{d.fullName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Rating: ★ {d.safetyRating} · {d.yearsExperience} yrs exp
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    d.status === 'Active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : d.status === 'On Trip'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
