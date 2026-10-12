import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  RotateCcw,
  Bell,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const ProfileSettingsPage: React.FC = () => {
  const { user, role, switchRole, updateProfile, sampleAccounts } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'Suren Abeywickrama');
  const [email, setEmail] = useState(user?.email || 'admin@smartmove.lk');
  const [phone, setPhone] = useState(user?.phone || '+94 77 123 4567');

  // Password fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    showToast('Profile specifications updated successfully.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    showToast('Password updated successfully for account security.', 'success');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleResetAllData = () => {
    localStorage.removeItem('smartmove_auth_user');
    localStorage.removeItem('smartmove_data_vehicles');
    localStorage.removeItem('smartmove_data_trips');
    localStorage.removeItem('smartmove_data_bookings');
    showToast('System data reset to initial seed state. Reloading...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-teal-400" />
          <span>Account Settings & Persona Manager</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Switch demonstration personas, manage your contact details, and maintain mock data state
        </p>
      </div>

      {/* 1-Click Persona Switcher Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Fast Persona Role Switcher</span>
            </h2>
            <p className="text-xs text-slate-400">
              Immediately test role-based permissions and interface views
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold">
            Active: {role}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {sampleAccounts.map((acc) => {
            const isSelected = user?.role === acc.role;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  switchRole(acc.role);
                  showToast(`Switched active persona to ${acc.name} (${acc.role})`, 'success');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 border-teal-400 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold block text-white">{acc.role}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">{acc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleSaveProfile} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Profile Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Contact Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
          >
            Save Profile
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handleChangePassword} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400" />
          <span>Security & Password Credentials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Current Password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Confirm Password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Data Management / Reset Mock State */}
      <div className="p-6 bg-slate-900 border border-red-900/30 rounded-3xl space-y-3 shadow-xl">
        <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-red-400" />
          <span>Reset Demonstration Mock State</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restore all vehicles, drivers, trips, passenger reservations, and maintenance logs back to original initial seed defaults.
        </p>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-bold cursor-pointer transition-colors"
        >
          Reset All Data to Defaults
        </button>
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetAllData}
        title="Reset All Mock Data"
        message="Are you sure you want to restore all tables, vehicles, drivers, bookings, and payments to original mock defaults? Your changes in this session will be cleared."
      />
    </div>
  );
};
