import React, { useState, useEffect } from 'react';
import { Driver, DriverStatus } from '../../types';
import { Modal } from '../../components/common/Modal';

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Driver | null;
}

export const DriverFormModal: React.FC<DriverFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [licenseClass, setLicenseClass] = useState('D');
  const [address, setAddress] = useState('');
  const [employmentDate, setEmploymentDate] = useState('2023-01-01');
  const [status, setStatus] = useState<DriverStatus>('Active');
  const [yearsExperience, setYearsExperience] = useState(8);
  const [emergencyContact, setEmergencyContact] = useState('');

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setContactNumber(initialData.contactNumber);
      setEmail(initialData.email);
      setLicenseNumber(initialData.licenseNumber);
      setLicenseExpiryDate(initialData.licenseExpiryDate);
      setLicenseClass(initialData.licenseClass || 'D');
      setAddress(initialData.address);
      setEmploymentDate(initialData.employmentDate);
      setStatus(initialData.status);
      setYearsExperience(initialData.yearsExperience);
      setEmergencyContact(initialData.emergencyContact);
    } else {
      setFullName('');
      setContactNumber('+94 77 ');
      setEmail('');
      setLicenseNumber('B-');
      setLicenseExpiryDate('');
      setLicenseClass('D');
      setAddress('');
      setEmploymentDate(new Date().toISOString().split('T')[0]);
      setStatus('Active');
      setYearsExperience(5);
      setEmergencyContact('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      contactNumber,
      email,
      licenseNumber,
      licenseExpiryDate,
      licenseClass,
      address,
      employmentDate,
      status,
      yearsExperience,
      emergencyContact,
      safetyRating: initialData?.safetyRating || 4.9,
      totalTripsCompleted: initialData?.totalTripsCompleted || 0,
      avatar: initialData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Driver Captain Profile' : 'Register New Commercial Captain'}
      subtitle="Commercial passenger license verification and credentials"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Bandara Jayasinghe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Contact Number</label>
            <input
              type="text"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+94 77 123 4567"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@smartmove.lk"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Commercial License No.</label>
            <input
              type="text"
              required
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="B-67890123"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">License Class (Oracle required)</label>
            <input type="text" required value={licenseClass} onChange={(e) => setLicenseClass(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">License Expiry Date</label>
            <input
              type="date"
              value={licenseExpiryDate}
              onChange={(e) => setLicenseExpiryDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Years Experience</label>
            <input
              type="number"
              min={1}
              max={40}
              required
              value={yearsExperience}
              onChange={(e) => setYearsExperience(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Shift Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DriverStatus)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="Active">Active / On Duty</option>
              <option value="On Trip">On Trip</option>
              <option value="Resting">Resting (Off Duty)</option>
              <option value="On Leave">On Leave</option>

            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Residential Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="No. 45, Temple Road, Kiribathgoda, Western Province"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Emergency Contact Info</label>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="+94 71 889 0123 (Wife / Family Contact)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
          />
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
            {initialData ? 'Save Changes' : 'Register Captain'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
