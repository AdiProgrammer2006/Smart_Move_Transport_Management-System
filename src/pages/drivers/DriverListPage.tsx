import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { driverService } from '../../services';
import { Driver } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DriverFormModal } from './DriverFormModal';
import { useToast } from '../../contexts/ToastContext';

export const DriverListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteDriverId, setDeleteDriverId] = useState<string | null>(null);

  const loadDrivers = async () => {
    setLoading(true);
    const data = await driverService.getAll();
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    try {
    if (editingDriver) {
      await driverService.update(editingDriver.id, formData);
      showToast(`Driver ${formData.fullName} updated successfully.`, 'success');
    } else {
      await driverService.create(formData);
      showToast(`New commercial captain ${formData.fullName} registered!`, 'success');
    }
    setEditingDriver(null);
    setIsFormOpen(false);
    await loadDrivers();
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to save driver', 'error'); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDriverId) return;
    try {
      await driverService.delete(deleteDriverId);
      showToast('Driver removed from active roster.', 'info');
      setDeleteDriverId(null);
      await loadDrivers();
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to delete driver', 'error'); }
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Driver Captains Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Licensed commercial captains, safety ratings, shift availability, and assigned fleet assets
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDriver(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer shadow-md shadow-teal-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Captain</span>
        </button>
      </div>

      {/* Search & Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, license number, or phone..."
        filters={[
          {
            id: 'statusFilter',
            label: 'Shift Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Shift Statuses', value: 'ALL' },
              { label: 'Active', value: 'Active' },
              { label: 'On Trip', value: 'On Trip' },
              { label: 'Resting', value: 'Resting' },
              { label: 'On Leave', value: 'On Leave' },
              { label: 'Inactive', value: 'Inactive' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
        }}
      />

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
            <tr>
              <th className="p-3.5">CAPTAIN NAME</th>
              <th className="p-3.5">LICENSE #</th>
              <th className="p-3.5">CONTACT INFO</th>
              <th className="p-3.5 text-center">EXPERIENCE</th>
              <th className="p-3.5 text-right">SAFETY RATING</th>
              <th className="p-3.5 text-center">STATUS</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-mono">
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                  No drivers found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {driver.fullName.charAt(0)}
                      </div>
                      <div className="font-sans">
                        <span className="font-bold text-white block text-xs">{driver.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Vehicle: {driver.assignedVehicleReg || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="text-teal-300 font-bold block">{driver.licenseNumber}</span>
                    <span className="text-[10px] text-slate-500">Exp: {driver.licenseExpiryDate}</span>
                  </td>

                  <td className="p-3.5 font-sans">
                    <span className="text-slate-200 block text-xs font-mono">{driver.contactNumber}</span>
                    <span className="text-[10px] text-slate-400">{driver.email}</span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="font-bold text-white text-xs">{driver.yearsExperience}</span>
                    <span className="text-[10px] text-slate-500 block">Years</span>
                  </td>

                  <td className="p-3.5 text-right tabular-nums">
                    <span className="text-amber-400 font-bold text-xs block">★ {driver.safetyRating.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500">{driver.totalTripsCompleted} trips</span>
                  </td>

                  <td className="p-3.5 text-center font-sans">
                    <StatusBadge status={driver.status} size="sm" />
                  </td>

                  <td className="p-3.5 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/app/drivers/${driver.id}`)}
                        className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="View Captain Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingDriver(driver);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Driver"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteDriverId(driver.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Driver"
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

      {/* Driver Form Modal */}
      <DriverFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingDriver}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDriverId}
        onClose={() => setDeleteDriverId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Driver from Roster"
        message="Are you sure you want to remove this commercial driver from the active roster? Any active assigned journeys must be reallocated."
        confirmLabel="Remove Driver"
        isDestructive
      />
    </div>
  );
};
