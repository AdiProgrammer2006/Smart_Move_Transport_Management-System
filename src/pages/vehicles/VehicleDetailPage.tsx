import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bus,
  FileText,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Download,
  Image,
} from 'lucide-react';
import { vehicleService, maintenanceService } from '../../services';
import { Vehicle, MaintenanceRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatLKR, formatDate } from '../../utils/formatters';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      const [v, allMnt] = await Promise.all([
        vehicleService.getById(id),
        maintenanceService.getAll(),
      ]);
      setVehicle(v || null);
      setMaintenanceHistory(allMnt.filter((m) => m.vehicleId === id || m.vehicleReg === v?.registrationNumber));
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading vehicle dossier...</div>;
  }

  if (!vehicle) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Vehicle Not Found</h2>
        <button onClick={() => navigate('/app/vehicles')} className="text-xs text-teal-400 underline">
          Return to Fleet List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back button */}
      <button
        onClick={() => navigate('/app/vehicles')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Fleet Inventory</span>
      </button>

      {/* Main Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-teal-400">{vehicle.registrationNumber}</span>
              <StatusBadge status={vehicle.status} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-white">{vehicle.model}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {vehicle.brand} · {vehicle.vehicleType} ({vehicle.manufactureYear} Model)
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-slate-500 block">CURRENT ODOMETER</span>
            <span className="text-lg font-bold text-white">{vehicle.mileageKm.toLocaleString()} km</span>
          </div>
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-500 text-[10px] block">SEATING CAPACITY</span>
            <span className="text-white font-bold">{vehicle.seatingCapacity} Passenger Seats</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">POWERTRAIN FUEL</span>
            <span className="text-teal-400 font-bold">{vehicle.fuelType}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">ASSIGNED CAPTAIN</span>
            <span className="text-white font-bold">{vehicle.assignedDriverName || 'Available'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">ASSET ID</span>
            <span className="text-slate-300">{vehicle.id}</span>
          </div>
        </div>

        {/* Gallery Image */}
        <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-950 border border-slate-800">
          <img
            src={vehicle.image}
            alt={vehicle.model}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-mono text-white">
            Official Fleet Photo: {vehicle.registrationNumber}
          </div>
        </div>
      </div>

      {/* Grid: Compliance Documents (6 cols) & Maintenance History (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Compliance Documents */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compliance Documents</h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Verified
            </span>
          </div>

          <div className="space-y-3">
            {vehicle.documents && vehicle.documents.length > 0 ? (
              vehicle.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block">{doc.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Valid until: {doc.expiryDate}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading verified copy of ${doc.name}`)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">Standard NTC certificates uploaded.</div>
            )}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Maintenance Logs</h3>
            <span className="font-mono text-xs text-slate-400">{maintenanceHistory.length} Records</span>
          </div>

          <div className="space-y-3">
            {maintenanceHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No major overhaul logs recorded for this asset.
              </div>
            ) : (
              maintenanceHistory.map((m) => (
                <div key={m.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{m.maintenanceType}</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatLKR(m.maintenanceCostLkr)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{m.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Provider: {m.serviceProvider}</span>
                    <span>Date: {formatDate(m.scheduledDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
