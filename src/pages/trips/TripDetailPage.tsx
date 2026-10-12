import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  Bus,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  CreditCard,
  Ticket,
} from 'lucide-react';
import { tripService, bookingService, vehicleService, driverService } from '../../services';
import { Trip, Booking, Vehicle, Driver, TripStatus } from '../../types';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../contexts/ToastContext';
import { SeatLayoutModal } from '../../components/booking/SeatLayoutModal';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [manifestBookings, setManifestBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  const loadTrip = async () => {
    if (!id) return;
    setLoading(true);
    const t = await tripService.getById(id);
    if (t) {
      setTrip(t);
      const [v, d, allBookings] = await Promise.all([
        vehicleService.getById(t.vehicleId),
        driverService.getById(t.driverId),
        bookingService.getAll(),
      ]);
      setVehicle(v || null);
      setDriver(d || null);
      setManifestBookings(allBookings.filter((b) => b.tripId === t.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  const handleStatusChange = async (newStatus: TripStatus) => {
    if (!id || !trip) return;
    await tripService.updateStatus(id, newStatus);
    showToast(`Trip dispatch status set to ${newStatus}`, 'success');
    loadTrip();
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading trip dispatch manifest...</div>;
  }

  if (!trip) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Trip Not Found</h2>
        <button
          onClick={() => navigate('/app/trips')}
          className="px-4 py-2 bg-slate-800 text-teal-300 rounded-xl text-xs font-bold"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const occupancyRate = Math.round(
    (((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100) || 0
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/app/trips')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Trip Schedule</span>
        </button>

        {/* Status Controller */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">Dispatch Status:</span>
          <select
            value={trip.status}
            onChange={(e) => handleStatusChange(e.target.value as TripStatus)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold cursor-pointer focus:border-teal-400"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Boarding">Boarding</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Trip Card */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-teal-400 font-bold uppercase">
                Trip #{trip.id}
              </span>
              <StatusBadge status={trip.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {trip.routeName}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Ticket Price</span>
            <span className="text-2xl font-black text-teal-400 font-mono">
              {formatLKR(trip.ticketPriceLkr)}
            </span>
          </div>
        </div>

        {/* Timings and Terminal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Departure Point</span>
            </div>
            <p className="text-sm font-extrabold text-white">{trip.startingLocation}</p>
            <p className="text-xs font-mono text-teal-400 pt-1">
              {formatDateTime(trip.departureDateTime)}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2 sm:py-0 border-y md:border-y-0 md:border-x border-slate-800/80">
            <div className="w-full max-w-[200px] space-y-1 text-center">
              <span className="text-xs font-bold text-white font-mono">{occupancyRate}% Occupancy</span>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-teal-400"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                {trip.availableSeats} of {trip.totalSeats} seats open
              </span>
            </div>
          </div>

          <div className="space-y-1 md:text-right">
            <div className="flex md:justify-end items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Destination Arrival</span>
            </div>
            <p className="text-sm font-extrabold text-white">{trip.destination}</p>
            <p className="text-xs font-mono text-slate-300 pt-1">
              {formatTime(trip.estimatedArrivalDateTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Vehicle & Captain details, Passenger Manifest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fleet Asset & Driver Captain */}
        <div className="space-y-6">
          {/* Vehicle card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-4 h-4 text-teal-400" />
                <span>Assigned Fleet Asset</span>
              </h3>
              {vehicle && (
                <Link
                  to={`/app/vehicles/${vehicle.id}`}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                >
                  View Asset
                </Link>
              )}
            </div>

            {vehicle ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{vehicle.registrationNumber}</span>
                  <span className="text-xs text-slate-400">{vehicle.vehicleType}</span>
                </div>
                <p className="text-xs text-slate-300">{vehicle.brand} {vehicle.model}</p>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <span>Capacity: {vehicle.seatingCapacity} seats</span>
                  <span>Fuel: {vehicle.fuelType}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">{trip.vehicleReg}</p>
            )}
          </div>

          {/* Captain Driver Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                <span>Assigned Captain</span>
              </h3>
              {driver && (
                <Link
                  to={`/app/drivers/${driver.id}`}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                >
                  View Profile
                </Link>
              )}
            </div>

            {driver ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{driver.fullName}</span>
                  <span className="text-[11px] font-mono text-teal-400 font-bold">★ {driver.safetyRating}</span>
                </div>
                <p className="text-xs text-slate-400">License: <span className="font-mono text-slate-300">{driver.licenseNumber}</span></p>
                <p className="text-xs text-slate-400">Direct Contact: <span className="font-mono text-slate-300">{driver.contactNumber}</span></p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">{trip.driverName}</p>
            )}
          </div>
        </div>

        {/* Right Column: Passenger Manifest & Seat Occupancy */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Passenger Manifest & Reserved Seats ({manifestBookings.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized digital tickets and boarding confirmations
              </p>
            </div>

            <button
              onClick={() => setIsSeatModalOpen(true)}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Reserve Seat
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {manifestBookings.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                No tickets have been booked for this trip yet. All {trip.totalSeats} seats are currently available.
              </div>
            ) : (
              manifestBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-400 font-bold">#{b.bookingReference}</span>
                      <StatusBadge status={b.bookingStatus} />
                    </div>
                    <p className="font-bold text-white">{b.passengerName}</p>
                    <p className="text-[11px] text-slate-400">{b.passengerPhone} · {b.passengerEmail}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-300 font-mono font-bold block">
                      Seats: {b.seats.join(', ')}
                    </span>
                    <span className="font-mono font-bold text-white block">
                      {formatLKR(b.totalAmountLkr)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Seat Booking Modal */}
      {isSeatModalOpen && (
        <SeatLayoutModal
          trip={trip}
          isOpen={isSeatModalOpen}
          onClose={() => setIsSeatModalOpen(false)}
          onConfirmSeats={(seats) => {
            setIsSeatModalOpen(false);
            navigate('/checkout', { state: { trip, seats } });
          }}
        />
      )}
    </div>
  );
};
