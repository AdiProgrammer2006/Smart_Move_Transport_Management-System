import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bus, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, sampleAccounts } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@smartmove.lk');
  const [password, setPassword] = useState('password123');

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    showToast(`Welcome back to SmartMove Transport Solutions!`, 'success');
    navigate('/app/dashboard');
  };

  const handleQuickRoleLogin = (account: typeof sampleAccounts[0]) => {
    login(account.email, account.role);
    showToast(`Signed in as ${account.name} (${account.role})`, 'success');
    navigate('/app/dashboard');
  };

  return (
    <div className="py-12 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign In to SmartMove</h1>
          <p className="text-xs text-slate-400">
            Access your passenger account, driver roster, or management console
          </p>
        </div>

        {/* 1-Click Role Logins for Fast Evaluation */}
        <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal-400 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1-Click Test Personas</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sampleAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleQuickRoleLogin(acc)}
                className="p-2 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-400 transition-all cursor-pointer group"
              >
                <span className="text-[11px] font-bold text-white block group-hover:text-teal-300">
                  {acc.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">{acc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@smartmove.lk"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <label className="font-bold text-slate-400 uppercase">Password</label>
              <Link to="/forgot-password" className="text-teal-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          New passenger commuter?{' '}
          <Link to="/register" className="text-teal-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
