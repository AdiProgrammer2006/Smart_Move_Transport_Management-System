import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bus,
  Users,
  Compass,
  CalendarClock,
  Ticket,
  TrendingUp,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  vehicleService,
  driverService,
  routeService,
  tripService,
  passengerService,
  bookingService,
  paymentService,
  maintenanceService,
} from '../../services';
import { Vehicle, Driver, Route, Trip, Passenger, Booking, Payment, MaintenanceRecord } from '../../types';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { BookingsTrendChart } from '../../components/charts/BookingsTrendChart';
import { PopularRoutesChart } from '../../components/charts/PopularRoutesChart';
import { TicketPassModal } from '../../components/booking/TicketPassModal';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  const [activeTicketBooking, setActiveTicketBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      const [v, d, r, t, p, b, pay, m] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        routeService.getAll(),
        tripService.getAll(),
        passengerService.getAll(),
        bookingService.getAll(),
        paymentService.getAll(),
        maintenanceService.getAll(),
      ]);
      setVehicles(v);
      setDrivers(d);
      setRoutes(r);
      setTrips(t);
      setPassengers(p);
      setBookings(b);
      setPayments(pay);
      setMaintenance(m);
    };
    loadAllData();
  }, []);

  const activeVehiclesCount = vehicles.filter((v) => v.status === 'Available' || v.status === 'Assigned').length;
  const pendingMaintenanceCount = maintenance.filter((m) => m.status === 'Scheduled' || m.status === 'Overdue').length;
  const totalRevenueLkr = payments.filter((p) => p.paymentStatus === 'Paid').reduce((sum, p) => sum + p.amountLkr, 0);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Administrator Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            System-wide fleet telemetry, ticket reservations, passenger records, and revenue analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/app/trips')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            + Dispatch Trip
          </button>
          <button
            onClick={() => navigate('/app/reports')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer shadow-md shadow-teal-500/20"
          >
            View Business Reports (5)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Fleet Availability</span>
            <Bus className="w-4 h-4 text-teal-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">
            {activeVehiclesCount} <span className="text-sm font-normal text-slate-500">/ {vehicles.length}</span>
          </div>
          <div className="text-[11px] text-teal-400 font-medium">
            {vehicles.length - activeVehiclesCount} assets in depot/maintenance
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Commercial Captains</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono text-2xl font-black text-white">{drivers.length}</div>
          <div className="text-[11px] text-slate-400 font-mono">100% NTC Licensed</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Settled Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
            {formatLKR(totalRevenueLkr)}
          </div>
          <div className="text-[11px] text-slate-400">Total ticket ledger sales</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono text-2xl font-black text-amber-400">
            {pendingMaintenanceCount}
          </div>
          <div className="text-[11px] text-rose-400 font-medium">1 overdue overhaul</div>
        </div>
      </div>

      {/* Charts Grid: Revenue Chart (8 cols) + Popular Routes (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Daily Revenue Volume (LKR)</h3>
              <p className="text-xs text-slate-400">Confirmed passenger bookings across Sri Lankan corridors</p>
            </div>
            <span className="font-mono text-xs text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800 font-bold">
              Weekly Trend
            </span>
          </div>
          <RevenueChart />
        </div>

        <div className="lg:col-span-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Top Expressway Corridors</h3>
            <p className="text-xs text-slate-400">Passenger density ranking</p>
          </div>
          <PopularRoutesChart />
        </div>
      </div>

      {/* Hourly Bookings Trend */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Peak Hour Booking Velocity</h3>
            <p className="text-xs text-slate-400">Hourly volume of online seat reservations and cancellations</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Confirmed
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cancelled
            </span>
          </div>
        </div>
        <BookingsTrendChart />
      </div>

      {/* Split: Upcoming Trip Dispatches (6 cols) & Recent Bookings (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upcoming Dispatches */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Live Dispatches & Schedules</h3>
            <Link to="/app/trips" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
              Manage All →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {trips.slice(0, 4).map((t) => (
              <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-300">{t.vehicleReg}</span>
                    <span className="text-xs font-semibold text-white">{t.routeName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Captain: {t.driverName}</span>
                    <span>·</span>
                    <span className="text-teal-400 font-mono">{t.availableSeats} seats open</span>
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

        {/* Recent Confirmed Bookings */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Passenger Bookings</h3>
            <Link to="/app/bookings" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
              All Bookings →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 font-mono border-b border-slate-800">
                <tr>
                  <th className="pb-2">REF #</th>
                  <th className="pb-2">PASSENGER</th>
                  <th className="pb-2">SEATS</th>
                  <th className="pb-2 text-right">FARE</th>
                  <th className="pb-2 text-right">E-TICKET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 text-teal-300 font-bold">{b.bookingReference}</td>
                    <td className="py-2.5 text-white font-sans">{b.passengerName}</td>
                    <td className="py-2.5 text-amber-300">{b.seats.join(', ')}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">{formatLKR(b.totalAmountLkr)}</td>
                    <td className="py-2.5 text-right font-sans">
                      <button
                        onClick={() => setActiveTicketBooking(b)}
                        className="text-[11px] text-teal-400 hover:text-teal-300 underline font-semibold cursor-pointer"
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

      {/* Ticket Pass Modal */}
      {activeTicketBooking && (
        <TicketPassModal
          isOpen={!!activeTicketBooking}
          onClose={() => setActiveTicketBooking(null)}
          booking={activeTicketBooking}
        />
      )}
    </div>
  );
};
