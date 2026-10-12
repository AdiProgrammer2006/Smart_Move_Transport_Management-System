import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Star,
  Bus,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { driverService, tripService, reviewService } from '../../services';
import { Driver, Trip, FeedbackReview } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatTime, formatDate } from '../../utils/formatters';

export const DriverProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [assignedTrips, setAssignedTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriverProfile = async () => {
      if (!id) return;
      setLoading(true);
      const [d, allTrips, allReviews] = await Promise.all([
        driverService.getById(id),
        tripService.getAll(),
        reviewService.getAll(),
      ]);
      setDriver(d || null);
      if (d) {
        setAssignedTrips(allTrips.filter((t) => t.driverId === d.id));
        setReviews(allReviews.filter((r) => r.driverId === d.id));
      }
      setLoading(false);
    };
    loadDriverProfile();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading captain profile...</div>;
  }

  if (!driver) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Driver Not Found</h2>
        <button onClick={() => navigate('/app/drivers')} className="text-xs text-teal-400 underline">
          Return to Driver Roster
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <button
        onClick={() => navigate('/app/drivers')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Driver Roster</span>
      </button>

      {/* Profile Header Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 border border-blue-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg">
              {driver.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-teal-400">{driver.licenseNumber}</span>
                <StatusBadge status={driver.status} size="sm" />
              </div>
              <h1 className="text-2xl font-black text-white">{driver.fullName}</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Commercial Driver ID: {driver.id} · Employed since {formatDate(driver.employmentDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">SAFETY SCORE</span>
              <span className="text-amber-400 font-bold text-base">★ {driver.safetyRating.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TOTAL TRIPS</span>
              <span className="text-white font-bold text-base">{driver.totalTripsCompleted}</span>
            </div>
          </div>
        </div>

        {/* Contact & License Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-mono">Contact Info</span>
            <div className="text-white font-mono">{driver.contactNumber}</div>
            <div className="text-slate-400">{driver.email}</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-mono">License Expiry</span>
            <div className="text-white font-mono">{formatDate(driver.licenseExpiryDate)}</div>
            <div className="text-emerald-400 font-mono">Class B Heavy Vehicle</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-mono">Emergency Contact</span>
            <div className="text-white">{driver.emergencyContact || 'Available on file'}</div>
            <div className="text-slate-400 truncate">{driver.address}</div>
          </div>
        </div>
      </div>

      {/* Grid: Assigned Corridor Dispatches (7 cols) & Passenger Reviews (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Assigned Trips */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Timetable Dispatches</h3>
            <span className="text-xs font-mono text-teal-400">{assignedTrips.length} Runs</span>
          </div>

          <div className="divide-y divide-slate-800">
            {assignedTrips.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No active dispatches assigned.</div>
            ) : (
              assignedTrips.map((t) => (
                <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white block">{t.routeName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatTime(t.departureDateTime)} · {t.vehicleReg}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Passenger Ratings */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Passenger Commendations</h3>
            <span className="text-xs font-mono text-amber-400">★ {driver.safetyRating} Rating</span>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Captain maintains an exemplary zero-complaint record.
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{r.passengerName}</span>
                    <span className="font-mono text-amber-400 font-bold">★ {r.driverRating}.0</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic">"{r.feedbackComment}"</p>
                  <span className="text-[10px] text-slate-500 font-mono block">{formatDate(r.reviewDate)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
