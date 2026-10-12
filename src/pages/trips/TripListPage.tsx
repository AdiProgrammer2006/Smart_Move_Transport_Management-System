import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Bus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { tripService, routeService } from '../../services';
import { Trip, Route, TripStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TripFormModal } from './TripFormModal';
import { useToast } from '../../contexts/ToastContext';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';

export const TripListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);

  const loadTripsAndRoutes = async () => {
    setLoading(true);
    const [t, r] = await Promise.all([tripService.getAll(), routeService.getAll()]);
    setTrips(t);
    setRoutes(r);
    setLoading(false);
  };

  useEffect(() => {
    loadTripsAndRoutes();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    if (editingTrip) {
      await tripService.update(editingTrip.id, formData);
      showToast(`Trip ${editingTrip.id} updated successfully.`, 'success');
    } else {
      const newT = await tripService.create(formData);
      showToast(`Trip scheduled successfully with ID #${newT.id}`, 'success');
    }
    setEditingTrip(null);
    loadTripsAndRoutes();
  };

  const handleConfirmCancelTrip = async () => {
    if (!cancelTripId) return;
    await tripService.updateStatus(cancelTripId, 'Cancelled');
    showToast(`Trip #${cancelTripId} marked as Cancelled.`, 'alert');
    setCancelTripId(null);
    loadTripsAndRoutes();
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesRoute = routeFilter === 'ALL' || t.routeId === routeFilter;
    return matchesSearch && matchesStatus && matchesRoute;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarClock className="w-7 h-7 text-teal-400" />
            <span>Trip Scheduling & Dispatch Control</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Coordinate fleet timetables, vehicle allocations, captain assignments, and seat load factors
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrip(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Trip</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by trip ID, vehicle reg, driver, or corridor..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Boarding', value: 'Boarding' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
            onChange: setStatusFilter,
          },
          {
            label: 'Corridor',
            value: routeFilter,
            options: [
              { label: 'All Corridors', value: 'ALL' },
              ...routes.map((r) => ({ label: r.routeName, value: r.id })),
            ],
            onChange: setRouteFilter,
          },
        ]}
      />

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Trip ID & Corridor</th>
                <th className="px-5 py-4">Vehicle & Captain</th>
                <th className="px-5 py-4">Departure · Arrival</th>
                <th className="px-5 py-4">Fare & Available Seats</th>
                <th className="px-5 py-4">Dispatch Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No trips match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const occupancyPercent = Math.round(
                    (((trip.totalSeats - trip.availableSeats) / trip.totalSeats) * 100) || 0
                  );

                  return (
                    <tr key={trip.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[11px] font-bold text-teal-400">
                            #{trip.id}
                          </span>
                          <p className="font-bold text-white text-xs leading-snug">{trip.routeName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{trip.startingLocation}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Bus className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span className="font-semibold text-white">{trip.vehicleReg}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            Captain: <strong className="text-slate-300">{trip.driverName}</strong>
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-white font-bold">
                            <Clock className="w-3 h-3 text-teal-400" />
                            <span>{formatDateTime(trip.departureDateTime)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Arr: {formatTime(trip.estimatedArrivalDateTime)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-teal-400 text-xs">
                            {formatLKR(trip.ticketPriceLkr)}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full ${
                                  occupancyPercent > 80 ? 'bg-amber-400' : 'bg-teal-400'
                                }`}
                                style={{ width: `${occupancyPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-300">
                              {trip.availableSeats} left
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={trip.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/app/trips/${trip.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                            title="View Trip Itinerary & Manifest"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTrip(trip);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                            title="Edit Trip Parameters"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {trip.status !== 'Cancelled' && (
                            <button
                              onClick={() => setCancelTripId(trip.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
                              title="Cancel Scheduled Trip"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <TripFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTrip(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTrip}
      />

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelTripId}
        onClose={() => setCancelTripId(null)}
        onConfirm={handleConfirmCancelTrip}
        title="Cancel Scheduled Trip"
        message="Are you sure you want to mark this trip as Cancelled? Passengers booked on this trip will receive delay notifications."
      />
    </div>
  );
};
