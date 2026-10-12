import React, { useState, useEffect } from 'react';
import { Route, IntermediateStop } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Plus, Trash2, MapPin } from 'lucide-react';

interface RouteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Route | null;
}

export const RouteFormModal: React.FC<RouteFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [routeName, setRouteName] = useState('');
  const [startingLocation, setStartingLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(115);
  const [estimatedDuration, setEstimatedDuration] = useState('3 hrs 15 mins');
  const [baseFareLkr, setBaseFareLkr] = useState(1450);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isPopular, setIsPopular] = useState(false);
  const [stops, setStops] = useState<IntermediateStop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRouteName(initialData.routeName);
      setStartingLocation(initialData.startingLocation);
      setDestination(initialData.destination);
      setDistanceKm(initialData.distanceKm);
      setEstimatedDuration(initialData.estimatedDuration);
      setBaseFareLkr(initialData.baseFareLkr);
      setStatus(initialData.status);
      setIsPopular(initialData.isPopular || false);
      setStops(initialData.stops || []);
    } else {
      setRouteName('');
      setStartingLocation('');
      setDestination('');
      setDistanceKm(120);
      setEstimatedDuration('3 hrs 00 mins');
      setBaseFareLkr(1500);
      setStatus('Active');
      setIsPopular(false);
      setStops([]);
    }
  }, [initialData, isOpen]);

  const handleAddStop = () => {
    const newStop: IntermediateStop = {
      id: `stp-${Date.now()}`,
      stopName: 'Intermediate City',
      durationFromStartMins: 45,
      distanceFromStartKm: 35,
      fareFromStartLkr: 500,
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, idx) => idx !== index));
  };

  const handleStopChange = (index: number, field: keyof IntermediateStop, val: any) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], [field]: val };
    setStops(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        routeName,
        startingLocation,
        destination,
        distanceKm: Number(distanceKm),
        estimatedDuration,
        baseFareLkr: Number(baseFareLkr),
        status,
        isPopular,
        stops,
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
      title={initialData ? `Edit Corridor: ${initialData.routeName}` : 'Register New Transit Corridor'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Route Corridor Name</label>
            <input
              type="text"
              required
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g. Colombo ↔ Kandy Expressway Superline"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Origin Terminal</label>
            <input
              type="text"
              required
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              placeholder="e.g. Bastian Mawatha, Colombo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Destination Terminal</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Goods Shed, Kandy"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Total Distance (km)</label>
            <input
              type="number"
              required
              min={1}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Estimated Duration</label>
            <input
              type="text"
              required
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="e.g. 3 hrs 15 mins"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Standard Ticket Fare (LKR)</label>
            <input
              type="number"
              required
              min={100}
              value={baseFareLkr}
              onChange={(e) => setBaseFareLkr(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Corridor Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isPopular"
            checked={isPopular}
            onChange={(e) => setIsPopular(e.target.checked)}
            className="rounded border-slate-800 text-teal-500 focus:ring-0"
          />
          <label htmlFor="isPopular" className="text-xs text-slate-300 font-semibold cursor-pointer">
            Mark as Featured / High-Demand Corridor
          </label>
        </div>

        {/* Intermediate Stops */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Intermediate Stops ({stops.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddStop}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {stops.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No intermediate stops configured. Non-stop point-to-point service.</p>
            ) : (
              stops.map((stop, idx) => (
                <div key={stop.id || idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={stop.stopName}
                      onChange={(e) => handleStopChange(idx, 'stopName', e.target.value)}
                      placeholder="Stop name"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="mins"
                      value={stop.durationFromStartMins}
                      onChange={(e) => handleStopChange(idx, 'durationFromStartMins', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="LKR"
                      value={stop.fareFromStartLkr}
                      onChange={(e) => handleStopChange(idx, 'fareFromStartLkr', Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
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
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Route'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
