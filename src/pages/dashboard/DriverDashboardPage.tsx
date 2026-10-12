import React, { useState, useEffect } from 'react';
import {
  Bus,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { tripService, bookingService, reviewService } from '../../services';
import { Trip, Booking, FeedbackReview, TripStatus } from '../../types';
import { formatTime, formatDateTime } from '../../utils/formatters';

export const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [assignedTrips, setAssignedTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myReviews, setMyReviews] = useState<FeedbackReview[]>([]);
  const [selectedTripManifest, setSelectedTripManifest] = useState<Trip | null>(null);

  useEffect(() => {
    const loadDriverData = async () => {
      const [allTrips, allBookings, allReviews] = await Promise.all([
        tripService.getAll(),
        bookingService.getAll(),
        reviewService.getAll(),
      ]);

      // Filter trips assigned to this driver or captain Bandara Jayasinghe
      const driverTrips = allTrips.filter(
        (t) => t.driverName.toLowerCase().includes('bandara') || t.driverId === 'drv-1'
      );
      setAssignedTrips(driverTrips);
      setBookings(allBookings);
      setMyReviews(allReviews.filter((r) => r.driverId === 'drv-1' || r.driverId === 'drv-2'));
    };
    loadDriverData();
  }, [user]);

  const handleUpdateTripStatus = async (tripId: string, newStatus: TripStatus) => {
    await tripService.updateStatus(tripId, newStatus);
    setAssignedTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: newStatus } : t))
    );
    showToast(`Trip #${tripId} status updated to "${newStatus}". Central dispatch notified.`, 'success');
  };

  const activeTrip = assignedTrips.find((t) => t.status === 'In Progress' || t.status === 'Boarding') || assignedTrips[0];
  const manifestBookings = selectedTripManifest
    ? bookings.filter((b) => b.tripId === selectedTripManifest.id && b.bookingStatus === 'Confirmed')
    : [];

  return (
    <div className="space-y-8">
      {/* Driver Welcome Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              COMMERCIAL CAPTAIN ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">Duty Shift: Morning Roster</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Captain {user?.name || 'Bandara Jayasinghe'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assigned Vehicle: <strong className="text-white font-mono">WP ND-4521</strong> (Volvo B11R Grand Cruiser)
          </p>
        </div>

        {/* Safety Badge */}
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">SAFETY RATING</span>
            <span className="text-amber-400 font-bold text-sm">★ 4.95 / 5.0</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">TRIPS RUN</span>
            <span className="text-white font-bold text-sm">1,420 Journeys</span>
          </div>
        </div>
      </div>

      {/* Active Run Command Box */}
      {activeTrip && (
        <div className="p-6 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-800/80 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                Current Assigned Dispatch
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{activeTrip.routeName}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Status:</span>
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                {activeTrip.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">SCHEDULED DEPARTURE</span>
              <span className="text-white font-bold text-sm">{formatTime(activeTrip.departureDateTime)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">ESTIMATED ARRIVAL</span>
              <span className="text-white font-bold text-sm">{formatTime(activeTrip.estimatedArrivalDateTime)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">PASSENGERS ON BOARD</span>
              <span className="text-teal-400 font-bold text-sm">
                {activeTrip.totalSeats - activeTrip.availableSeats} Passengers
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">AVAILABLE SEATS</span>
              <span className="text-slate-300 font-bold text-sm">{activeTrip.availableSeats} Open</span>
            </div>
          </div>

          {/* Captain Live Status Controller */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-300 font-semibold">
              Live Terminal / Highway Dispatch Action:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleUpdateTripStatus(activeTrip.id, 'Boarding')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                1. Call Boarding
              </button>
              <button
                onClick={() => handleUpdateTripStatus(activeTrip.id, 'In Progress')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>2. Gate Departure (In Transit)</span>
              </button>
              <button
                onClick={() => handleUpdateTripStatus(activeTrip.id, 'Completed')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>3. Complete Run</span>
              </button>
              <button
                onClick={() => setSelectedTripManifest(activeTrip)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Passenger Manifest ({activeTrip.totalSeats - activeTrip.availableSeats})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: All Assigned Schedule & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Schedule List */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white">Upcoming Timetabled Dispatches</h3>

          <div className="divide-y divide-slate-800">
            {assignedTrips.map((t) => (
              <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">{t.routeName}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDateTime(t.departureDateTime)} · {t.vehicleReg}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTripManifest(t)}
                    className="px-2.5 py-1 text-[11px] font-mono text-teal-400 hover:underline"
                  >
                    Manifest
                  </button>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Passenger Commendations */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white">Passenger Ratings & Reviews</h3>

          <div className="space-y-3">
            {myReviews.map((r) => (
              <div key={r.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{r.passengerName}</span>
                  <span className="font-mono text-amber-400 font-bold">★ {r.driverRating}.0</span>
                </div>
                <p className="text-slate-300 italic text-[11px]">"{r.feedbackComment}"</p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Trip: {r.tripName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manifest Modal */}
      {selectedTripManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Passenger Boarding Manifest</h3>
                <p className="text-xs text-slate-400">{selectedTripManifest.routeName}</p>
              </div>
              <button
                onClick={() => setSelectedTripManifest(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {manifestBookings.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No confirmed reservations found for this dispatch yet.
                </div>
              ) : (
                manifestBookings.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{b.passengerName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{b.passengerPhone}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-amber-400 font-bold block">Seat: {b.seats.join(', ')}</span>
                      <span className="text-[10px] font-mono text-emerald-400">PAID</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedTripManifest(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 cursor-pointer"
            >
              Done Reviewing Manifest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
