import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  Fuel,
  Users,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { vehicleService } from '../../services';
import { Vehicle } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { VehicleFormModal } from './VehicleFormModal';
import { useToast } from '../../contexts/ToastContext';

export const VehicleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to load vehicles', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, formData);
        showToast(`Vehicle ${formData.registrationNumber} updated in Oracle.`, 'success');
      } else {
        await vehicleService.create(formData);
        showToast(`Vehicle ${formData.registrationNumber} saved to Oracle.`, 'success');
      }
      setIsFormOpen(false);
      setEditingVehicle(null);
      await loadVehicles();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Vehicle save failed', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteVehicleId) return;
    try {
      await vehicleService.delete(deleteVehicleId);
      showToast('Vehicle deleted from Oracle.', 'success');
      setDeleteVehicleId(null);
      await loadVehicles();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Vehicle delete failed', 'error');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || v.vehicleType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Fleet Asset Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registry of buses, luxury coaches, and passenger vans with NTC registration and maintenance states
          </p>
        </div>

        <button
          onClick={() => {
            setEditingVehicle(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer shadow-md shadow-teal-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Search & Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by plate, brand, or model..."
        filters={[
          {
            id: 'typeFilter',
            label: 'Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Vehicle Types', value: 'ALL' },
              { label: 'Luxury Coach', value: 'Luxury Coach' },
              { label: 'Bus', value: 'Bus' },
              { label: 'Executive Van', value: 'Van' },
            ],
          },
          {
            id: 'statusFilter',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Available', value: 'Available' },
              { label: 'Assigned', value: 'Assigned' },
              { label: 'Maintenance', value: 'Maintenance' },
              { label: 'Inactive', value: 'Inactive' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('ALL');
          setStatusFilter('ALL');
        }}
      />

      {/* Vehicles Data Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
            <tr>
              <th className="p-3.5">REGISTRATION #</th>
              <th className="p-3.5">VEHICLE SPECS</th>
              <th className="p-3.5">TYPE & FUEL</th>
              <th className="p-3.5 text-center">CAPACITY</th>
              <th className="p-3.5 text-right">ODOMETER</th>
              <th className="p-3.5 text-center">STATUS</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-mono">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                  No vehicle records found matching the current search parameters.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-teal-300 block text-xs">{vehicle.registrationNumber}</span>
                    <span className="text-[10px] text-slate-500 font-sans">ID: {vehicle.id}</span>
                  </td>

                  <td className="p-3.5 font-sans">
                    <span className="font-bold text-white block">{vehicle.model}</span>
                    <span className="text-[11px] text-slate-400">{vehicle.brand} ({vehicle.manufactureYear})</span>
                  </td>

                  <td className="p-3.5 font-sans">
                    <span className="text-slate-200 block text-xs">{vehicle.vehicleType}</span>
                    <span className="text-[10px] font-mono text-teal-400">{vehicle.fuelType}</span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="font-bold text-white text-xs">{vehicle.seatingCapacity}</span>
                    <span className="text-[10px] text-slate-500 block">Seats</span>
                  </td>

                  <td className="p-3.5 text-right tabular-nums text-slate-300">
                    {vehicle.mileageKm.toLocaleString()} km
                  </td>

                  <td className="p-3.5 text-center font-sans">
                    <StatusBadge status={vehicle.status} size="sm" />
                  </td>

                  <td className="p-3.5 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/app/vehicles/${vehicle.id}`)}
                        className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="View Details & Documents"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingVehicle(vehicle);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Vehicle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteVehicleId(vehicle.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vehicle Form Modal */}
      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingVehicle}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteVehicleId}
        onClose={() => setDeleteVehicleId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle Asset"
        message="Are you sure you want to remove this vehicle asset from SmartMove? Active scheduled trips using this asset may require re-assignment."
        confirmLabel="Delete Asset"
        isDestructive
      />
    </div>
  );
};
