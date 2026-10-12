import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  MapPin,
  Clock,
  Bus,
  Calendar,
  Users,
  Sparkles,
  Edit2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { routeService, tripService } from '../../services';
import { Route, Trip } from '../../types';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RouteFormModal } from './RouteFormModal';
import { useToast } from '../../contexts/ToastContext';

export const RouteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [route, setRoute] = useState<Route | null>(null);
  const [scheduledTrips, setScheduledTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadRouteDetails = async () => {
    if (!id) return;
    setLoading(true);
    const r = await routeService.getById(id);
    if (r) {
      setRoute(r);
      const allTrips = await tripService.getAll();
      setScheduledTrips(allTrips.filter((t) => t.routeId === r.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRouteDetails();
  }, [id]);

  const handleUpdate = async (formData: any) => {
    if (!id) return;
    await routeService.update(id, formData);
    showToast('Route corridor updated successfully', 'success');
    loadRouteDetails();
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading corridor details...</div>;
  }

  if (!route) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Transit Corridor Not Found</h2>
        <button
          onClick={() => navigate('/app/routes')}
          className="px-4 py-2 bg-slate-800 text-teal-300 rounded-xl text-xs font-bold"
        >
          Back to Routes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/routes')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Corridors</span>
        </button>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Route Specs</span>
        </button>
      </div>

      {/* Corridor Header Card */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-bold">
                Route ID: {route.id}
              </span>
              <StatusBadge status={route.status} />
              {route.isPopular && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured Corridor</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {route.routeName}
            </h1>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Standard Fare</span>
            <span className="text-2xl font-black text-teal-400 font-mono">{formatLKR(route.baseFareLkr)}</span>
          </div>
        </div>

        {/* Origin & Destination Banner */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Starting Terminal</span>
            </div>
            <p className="text-sm font-extrabold text-white">{route.startingLocation}</p>
          </div>

          <div className="flex flex-col items-center justify-center py-2 sm:py-0 border-y md:border-y-0 md:border-x border-slate-800/80">
            <span className="text-sm font-black text-teal-400 font-mono">{route.distanceKm} Kilometers</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{route.estimatedDuration}</span>
            </span>
          </div>

          <div className="space-y-1 md:text-right">
            <div className="flex md:justify-end items-center gap-1.5 text-xs font-bold text-slate-400 uppercase">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Destination Terminal</span>
            </div>
            <p className="text-sm font-extrabold text-white">{route.destination}</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Stops Timeline & Scheduled Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intermediate Stops Timeline */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Waypoints & Intermediate Stops</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{route.stops?.length || 0} Stops</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Origin Stop */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-bold shrink-0">
                A
              </div>
              <div>
                <p className="text-xs font-bold text-white">{route.startingLocation}</p>
                <span className="text-[10px] text-slate-400 font-mono">0 km · Departure Point</span>
              </div>
            </div>

            {/* Waypoints */}
            {route.stops && route.stops.length > 0 ? (
              route.stops.map((stop, idx) => (
                <div key={stop.id || idx} className="ml-3.5 pl-5 border-l-2 border-dashed border-slate-800 relative space-y-1 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 absolute -left-[6px] top-2 ring-4 ring-slate-900" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-200">{stop.stopName}</p>
                    <span className="text-[11px] font-mono text-teal-400 font-bold">{formatLKR(stop.fareFromStartLkr)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>+{stop.durationFromStartMins} mins</span>
                    <span>·</span>
                    <span>{stop.distanceFromStartKm} km from departure</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="ml-3.5 pl-5 border-l-2 border-slate-800 py-3 text-xs text-slate-400 italic">
                Non-stop expressway service without passenger pick-up points.
              </div>
            )}

            {/* Destination Stop */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center text-xs font-bold shrink-0">
                B
              </div>
              <div>
                <p className="text-xs font-bold text-white">{route.destination}</p>
                <span className="text-[10px] text-slate-400 font-mono">{route.distanceKm} km · Terminal Arrival</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Trips on this Corridor */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bus className="w-4 h-4 text-teal-400" />
              <span>Active Scheduled Trips ({scheduledTrips.length})</span>
            </h3>
            <Link
              to="/app/trips"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              View All Trips
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {scheduledTrips.length === 0 ? (
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                No active trips currently scheduled on this corridor.
              </div>
            ) : (
              scheduledTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{trip.vehicleType} · {trip.vehicleReg}</span>
                    <StatusBadge status={trip.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{formatDateTime(trip.departureDateTime)}</span>
                    </span>
                    <span className="font-mono text-teal-400 font-bold">{formatLKR(trip.ticketPriceLkr)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>Captain: {trip.driverName}</span>
                    <span className="font-mono">{trip.availableSeats} of {trip.totalSeats} seats left</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <RouteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={route}
      />
    </div>
  );
};
