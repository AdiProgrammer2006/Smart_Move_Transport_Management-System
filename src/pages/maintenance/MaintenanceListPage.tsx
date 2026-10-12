import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Bus,
  Gauge,
  DollarSign,
} from 'lucide-react';
import { maintenanceService } from '../../services';
import { MaintenanceRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { MaintenanceFormModal } from './MaintenanceFormModal';
import { useToast } from '../../contexts/ToastContext';
import { formatLKR, formatDate } from '../../utils/formatters';

export const MaintenanceListPage: React.FC = () => {
  const { showToast } = useToast();

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  const loadMaintenance = async () => {
    setLoading(true);
    const data = await maintenanceService.getAll();
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    if (editingRecord) {
      await maintenanceService.update(editingRecord.id, formData);
      showToast(`Work order #${editingRecord.id} updated successfully.`, 'success');
    } else {
      await maintenanceService.create(formData);
      showToast(`New service order scheduled for ${formData.vehicleReg}`, 'success');
    }
    setEditingRecord(null);
    loadMaintenance();
  };

  const handleMarkComplete = async (record: MaintenanceRecord) => {
    await maintenanceService.update(record.id, {
      status: 'Completed',
      completedDate: new Date().toISOString().slice(0, 10),
    });
    showToast(`Vehicle ${record.vehicleReg} service signed off as Completed.`, 'success');
    loadMaintenance();
  };

  const handleConfirmDelete = async () => {
    if (!deleteRecordId) return;
    await maintenanceService.delete(deleteRecordId);
    showToast('Maintenance record archived.', 'success');
    setDeleteRecordId(null);
    loadMaintenance();
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.technicianName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.maintenanceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const overdueCount = records.filter((r) => r.status === 'Overdue').length;
  const inProgressCount = records.filter((r) => r.status === 'In Progress').length;
  const totalCost = records.reduce((sum, r) => sum + r.maintenanceCostLkr, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-teal-400" />
            <span>Fleet Maintenance & Service Operations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Preventative maintenance scheduling, mechanical work orders, authorized workshop invoices
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRecord(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service Order</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Fleet Service Cost</span>
          <span className="text-2xl font-black text-white font-mono">{formatLKR(totalCost)}</span>
          <p className="text-[10px] text-slate-400">YTD maintenance expenditure</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">In Workshop Bay</span>
          <span className="text-2xl font-black text-blue-400 font-mono">{inProgressCount} active bays</span>
          <p className="text-[10px] text-slate-400">Currently undergoing service</p>
        </div>

        <div className={`p-5 rounded-3xl border space-y-1 ${
          overdueCount > 0 ? 'bg-amber-950/40 border-amber-800/80' : 'bg-slate-900 border-slate-800'
        }`}>
          <span className="text-[11px] font-bold text-slate-400 uppercase block flex items-center gap-1.5">
            {overdueCount > 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            <span>Overdue Inspection Alerts</span>
          </span>
          <span className={`text-2xl font-black font-mono ${overdueCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {overdueCount} vehicles
          </span>
          <p className="text-[10px] text-slate-400">Requires immediate attention</p>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by vehicle reg, service provider, or technician..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Overdue', value: 'Overdue' },
            ],
            onChange: setStatusFilter,
          },
          {
            label: 'Type',
            value: typeFilter,
            options: [
              { label: 'All Categories', value: 'ALL' },
              { label: 'Routine Inspection', value: 'Routine Inspection' },
              { label: 'Brake Service', value: 'Brake Service' },
              { label: 'Engine Overhaul', value: 'Engine Overhaul' },
              { label: 'Tyre Replacement', value: 'Tyre Replacement' },
              { label: 'AC System Check', value: 'AC System Check' },
              { label: 'Battery Diagnostic', value: 'Battery Diagnostic' },
            ],
            onChange: setTypeFilter,
          },
        ]}
      />

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Vehicle & Category</th>
                <th className="px-5 py-4">Work Order Details</th>
                <th className="px-5 py-4">Scheduled Date</th>
                <th className="px-5 py-4">Service Center & Technician</th>
                <th className="px-5 py-4">Cost (LKR)</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No maintenance records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-sm flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-teal-400" />
                          <span>{r.vehicleReg}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-teal-300 font-mono text-[10px] font-bold inline-block">
                          {r.maintenanceType}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-200 line-clamp-2 max-w-xs">{r.description}</p>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-300">
                      {formatDate(r.scheduledDate)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="text-white font-semibold text-xs">{r.serviceProvider}</p>
                        <p className="text-[10px] text-slate-400">Tech: {r.technicianName}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-white text-xs">
                      {formatLKR(r.maintenanceCostLkr)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'Completed' && (
                          <button
                            onClick={() => handleMarkComplete(r)}
                            className="p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 cursor-pointer transition-colors"
                            title="Sign Off As Completed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingRecord(r);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                          title="Edit Service Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteRecordId(r.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                          title="Archive Record"
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
      <MaintenanceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingRecord}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteRecordId}
        onClose={() => setDeleteRecordId(null)}
        onConfirm={handleConfirmDelete}
        title="Archive Maintenance Record"
        message="Are you sure you want to delete this maintenance entry?"
      />
    </div>
  );
};
