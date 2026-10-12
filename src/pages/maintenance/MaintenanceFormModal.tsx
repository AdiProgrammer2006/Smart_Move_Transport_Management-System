import React, { useState, useEffect } from 'react';
import { MaintenanceRecord, Vehicle, MaintenanceStatus } from '../../types';
import { vehicleService } from '../../services';
import { Modal } from '../../components/common/Modal';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: MaintenanceRecord | null;
}

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceRecord['maintenanceType']>('Routine Inspection');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [maintenanceCostLkr, setMaintenanceCostLkr] = useState(35000);
  const [serviceProvider, setServiceProvider] = useState('Diesel & Motor Engineering (DIMO) Center');
  const [technicianName, setTechnicianName] = useState('Sunil Karunaratne');
  const [status, setStatus] = useState<MaintenanceStatus>('Scheduled');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadVehicles = async () => {
      const v = await vehicleService.getAll();
      setVehicles(v);
      if (initialData) {
        setVehicleId(initialData.vehicleId);
        setMaintenanceType(initialData.maintenanceType);
        setDescription(initialData.description);
        setScheduledDate(initialData.scheduledDate);
        setMaintenanceCostLkr(initialData.maintenanceCostLkr);
        setServiceProvider(initialData.serviceProvider);
        setTechnicianName(initialData.technicianName);
        setStatus(initialData.status);
      } else {
        if (v.length > 0) setVehicleId(v[0].id);
        setMaintenanceType('Routine Inspection');
        setDescription('Periodic multi-point checkup, brake fluids, and oil change');
        setScheduledDate(new Date().toISOString().slice(0, 10));
        setMaintenanceCostLkr(42000);
        setServiceProvider('DIMO Technical Center, Colombo');
        setTechnicianName('Sunil Karunaratne');
        setStatus('Scheduled');
      }
    };
    if (isOpen) {
      loadVehicles();
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selV = vehicles.find((v) => v.id === vehicleId);
    if (!selV) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        vehicleId: selV.id,
        vehicleReg: selV.registrationNumber,
        maintenanceType,
        description,
        scheduledDate,
        maintenanceCostLkr: Number(maintenanceCostLkr),
        serviceProvider,
        technicianName,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Update Service Record #${initialData.id}` : 'Schedule Vehicle Service & Maintenance'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Fleet Asset (Vehicle)</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} - {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Maintenance Category</label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Routine Inspection">Routine Inspection</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Engine Overhaul">Engine Overhaul</option>
              <option value="Tyre Replacement">Tyre Replacement</option>
              <option value="AC System Check">AC System Check</option>
              <option value="Battery Diagnostic">Battery Diagnostic</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Work Order Description</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Scheduled Date</label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Estimated / Incurred Cost (LKR)</label>
            <input
              type="number"
              required
              min={0}
              value={maintenanceCostLkr}
              onChange={(e) => setMaintenanceCostLkr(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Authorized Service Center</label>
            <input
              type="text"
              required
              value={serviceProvider}
              onChange={(e) => setServiceProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Lead Master Technician</label>
            <input
              type="text"
              required
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-xs font-bold text-slate-950 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Schedule Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
