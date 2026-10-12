import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleType, VehicleStatus } from '../../types';
import { Modal } from '../../components/common/Modal';
import { coachImage, vanImage } from '../../mockData';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Vehicle | null;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [nextServiceMileageKm, setNextServiceMileageKm] = useState(55000);
  const [nextServiceDate, setNextServiceDate] = useState('2026-12-01');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Luxury Coach');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState(45);
  const [manufactureYear, setManufactureYear] = useState(2023);
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [mileageKm, setMileageKm] = useState(50000);
  const [fuelType, setFuelType] = useState<'Diesel' | 'Electric' | 'Hybrid' | 'Petrol'>('Diesel');

  useEffect(() => {
    if (initialData) {
      setRegistrationNumber(initialData.registrationNumber);
      setVinNumber(initialData.vinNumber || '');
      setNextServiceMileageKm(initialData.nextServiceMileageKm ?? initialData.mileageKm + 5000);
      setNextServiceDate(initialData.nextServiceDate || '2026-12-01');
      setVehicleType(initialData.vehicleType);
      setBrand(initialData.brand);
      setModel(initialData.model);
      setSeatingCapacity(initialData.seatingCapacity);
      setManufactureYear(initialData.manufactureYear);
      setStatus(initialData.status);
      setMileageKm(initialData.mileageKm);
      setFuelType(initialData.fuelType);
    } else {
      setRegistrationNumber('');
      setVinNumber('');
      setNextServiceMileageKm(55000);
      setNextServiceDate('2026-12-01');
      setVehicleType('Luxury Coach');
      setBrand('Volvo');
      setModel('');
      setSeatingCapacity(45);
      setManufactureYear(2024);
      setStatus('Available');
      setMileageKm(10000);
      setFuelType('Diesel');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      registrationNumber,
      vinNumber,
      nextServiceMileageKm,
      nextServiceDate,
      oracleVehicleType: initialData?.oracleVehicleType,
      oracleStatus: initialData?.oracleStatus,
      oracleFuelType: initialData?.oracleFuelType,
      vehicleType,
      brand,
      model,
      seatingCapacity,
      manufactureYear,
      status,
      mileageKm,
      fuelType,
      image: vehicleType === 'Van' ? vanImage : coachImage,
      documents: initialData?.documents || [],
      galleryImages: initialData?.galleryImages || [vehicleType === 'Van' ? vanImage : coachImage],
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Fleet Vehicle' : 'Register New Fleet Asset'}
      subtitle="Sri Lankan National Transport Commission vehicle registration"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Registration No.</label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              placeholder="e.g. WP ND-4521"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="Luxury Coach">Luxury Coach</option>
              <option value="Bus">Standard Bus</option>
              <option value="Van">Executive Passenger Van</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Manufacturer Brand</label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Volvo, Toyota, BYD"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Model Specification</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. B11R Intercity Cruiser"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Seating Capacity</label>
            <input
              type="number"
              min={4}
              max={100}
              required
              value={seatingCapacity}
              onChange={(e) => setSeatingCapacity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Year of Manufacture</label>
            <input
              type="number"
              min={2015}
              max={2026}
              required
              value={manufactureYear}
              onChange={(e) => setManufactureYear(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Powertrain</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric (Zero Emission)</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Petrol">Petrol</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Operational Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VehicleStatus)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Assigned">Assigned to Run</option>
              <option value="Maintenance">In Maintenance</option>
              <option value="Inactive">Inactive / Retired</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Odometer Reading (KM)</label>
            <input
              type="number"
              min={0}
              required
              value={mileageKm}
              onChange={(e) => setMileageKm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="text-xs text-slate-300">VIN number (required)
            <input required value={vinNumber} onChange={e=>setVinNumber(e.target.value)} maxLength={30} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </label>
          <label className="text-xs text-slate-300">Next service mileage (km)
            <input required type="number" min={0} value={nextServiceMileageKm} onChange={e=>setNextServiceMileageKm(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </label>
          <label className="text-xs text-slate-300">Next service date
            <input required type="date" value={nextServiceDate} onChange={e=>setNextServiceDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors cursor-pointer shadow-md"
          >
            {initialData ? 'Update Vehicle' : 'Register Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
