import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { routeService } from '../../services';
import { Route } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { RouteFormModal } from './RouteFormModal';
import { useToast } from '../../contexts/ToastContext';
import { formatLKR } from '../../utils/formatters';

export const RouteListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteRouteId, setDeleteRouteId] = useState<string | null>(null);

  const loadRoutes = async () => {
    setLoading(true);
    const data = await routeService.getAll();
    setRoutes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    if (editingRoute) {
      await routeService.update(editingRoute.id, formData);
      showToast(`Route ${formData.routeName} updated successfully.`, 'success');
    } else {
      await routeService.create(formData);
      showToast(`New route corridor ${formData.routeName} established!`, 'success');
    }
    setEditingRoute(null);
    loadRoutes();
  };

  const handleConfirmDelete = async () => {
    if (!deleteRouteId) return;
    await routeService.delete(deleteRouteId);
    showToast('Route corridor archived successfully.', 'success');
    setDeleteRouteId(null);
    loadRoutes();
  };

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.startingLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-teal-400" />
            <span>Transit Corridor & Route Planning</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage intercity highway networks, intermediate stops, distance metrics, and standard fares
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRoute(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transit Corridor</span>
        </button>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by route name, origin, or destination..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active Corridors', value: 'Active' },
              { label: 'Inactive / Suspended', value: 'Inactive' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Routes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Corridor & Origin / Destination</th>
                <th className="px-5 py-4">Distance & Duration</th>
                <th className="px-5 py-4">Standard Fare</th>
                <th className="px-5 py-4">Intermediate Stops</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No routes match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{route.routeName}</span>
                          {route.isPopular && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>{route.startingLocation}</span>
                          <span>→</span>
                          <span>{route.destination}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <div>
                        <span className="text-white font-bold">{route.distanceKm} km</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{route.estimatedDuration}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-teal-400 text-sm">
                      {formatLKR(route.baseFareLkr)}
                    </td>

                    <td className="px-5 py-4">
                      {route.stops && route.stops.length > 0 ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] font-semibold">
                            {route.stops.length} stop{route.stops.length > 1 ? 's' : ''}
                          </span>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                            {route.stops.map((s) => s.stopName).join(' · ')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Non-stop point-to-point</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={route.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/app/routes/${route.id}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRoute(route);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                          title="Edit Corridor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteRouteId(route.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                          title="Archive Route"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <RouteFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRoute(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingRoute}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteRouteId}
        onClose={() => setDeleteRouteId(null)}
        onConfirm={handleConfirmDelete}
        title="Archive Route Corridor"
        message="Are you sure you want to deactivate this corridor? Existing booked trips will retain their route information."
      />
    </div>
  );
};
