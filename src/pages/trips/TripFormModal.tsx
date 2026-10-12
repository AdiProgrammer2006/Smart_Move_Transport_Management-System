import React, { useState, useEffect } from 'react';
import { Trip, Route, Vehicle, Driver, TripStatus } from '../../types';
import { routeService, vehicleService, driverService } from '../../services';
import { Modal } from '../../components/common/Modal';

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Trip | null;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [routeId, setRouteId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [estimatedArrivalDateTime, setEstimatedArrivalDateTime] = useState('');
  const [ticketPriceLkr, setTicketPriceLkr] = useState(1450);
  const [status, setStatus] = useState<TripStatus>('Scheduled');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadPrerequisites = async () => {
      const [r, v, d] = await Promise.all([
        routeService.getAll(),
        vehicleService.getAll(),
        driverService.getAll(),
      ]);
      setRoutes(r);
      setVehicles(v);
      setDrivers(d);

      if (initialData) {
        setRouteId(initialData.routeId);
        setVehicleId(initialData.vehicleId);
        setDriverId(initialData.driverId);
        setDepartureDateTime(initialData.departureDateTime.slice(0, 16));
        setEstimatedArrivalDateTime(initialData.estimatedArrivalDateTime.slice(0, 16));
        setTicketPriceLkr(initialData.ticketPriceLkr);
        setStatus(initialData.status);
      } else {
        if (r.length > 0) {
          setRouteId(r[0].id);
          setTicketPriceLkr(r[0].baseFareLkr);
        }
        if (v.length > 0) setVehicleId(v[0].id);
        if (d.length > 0) setDriverId(d[0].id);
        const now = new Date();
        now.setHours(now.getHours() + 2);
        setDepartureDateTime(now.toISOString().slice(0, 16));
        const arr = new Date(now);
        arr.setHours(arr.getHours() + 3);
        setEstimatedArrivalDateTime(arr.toISOString().slice(0, 16));
        setStatus('Scheduled');
      }
    };

    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen, initialData]);

  const handleRouteChange = (rId: string) => {
    setRouteId(rId);
    const selRoute = routes.find((r) => r.id === rId);
    if (selRoute) {
      setTicketPriceLkr(selRoute.baseFareLkr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selRoute = routes.find((r) => r.id === routeId);
    const selVehicle = vehicles.find((v) => v.id === vehicleId);
    const selDriver = drivers.find((d) => d.id === driverId);

    if (!selRoute || !selVehicle || !selDriver) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        routeId: selRoute.id,
        routeName: selRoute.routeName,
        startingLocation: selRoute.startingLocation,
        destination: selRoute.destination,
        vehicleId: selVehicle.id,
        vehicleReg: selVehicle.registrationNumber,
        vehicleType: selVehicle.vehicleType,
        driverId: selDriver.id,
        driverName: selDriver.fullName,
        departureDateTime: new Date(departureDateTime).toISOString(),
        estimatedArrivalDateTime: new Date(estimatedArrivalDateTime).toISOString(),
        ticketPriceLkr: Number(ticketPriceLkr),
        totalSeats: selVehicle.seatingCapacity,
        availableSeats: initialData ? initialData.availableSeats : selVehicle.seatingCapacity,
        status,
        bookedSeats: initialData ? initialData.bookedSeats : [],
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
      title={initialData ? `Edit Scheduled Trip: ${initialData.id}` : 'Schedule New Passenger Trip'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Transit Corridor (Route)</label>
            <select
              value={routeId}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeName} ({r.distanceKm} km · Base {r.baseFareLkr} LKR)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Assigned Fleet Vehicle</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} - {v.brand} {v.model} ({v.seatingCapacity} Seats)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Assigned Captain (Driver)</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} (License: {d.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Departure Date & Time</label>
            <input
              type="datetime-local"
              required
              value={departureDateTime}
              onChange={(e) => setDepartureDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Estimated Arrival</label>
            <input
              type="datetime-local"
              required
              value={estimatedArrivalDateTime}
              onChange={(e) => setEstimatedArrivalDateTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Ticket Price (LKR)</label>
            <input
              type="number"
              required
              min={100}
              value={ticketPriceLkr}
              onChange={(e) => setTicketPriceLkr(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Trip Dispatch Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Boarding">Boarding</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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
            {isSubmitting ? 'Scheduling...' : initialData ? 'Save Changes' : 'Schedule Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
