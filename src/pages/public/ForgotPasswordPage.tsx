import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(`Password reset link sent to ${email}`, 'success');
  };

  return (
    <div className="py-16 flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Reset Link Sent</h3>
            <p className="text-xs text-slate-300">
              We have sent a secure password reset link to <strong className="text-white">{email}</strong>. Please check your inbox or spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block mt-3 px-4 py-2 text-xs font-bold bg-teal-400 text-slate-950 rounded-xl"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@smartmove.lk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all cursor-pointer shadow-md"
            >
              Send Reset Instructions
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
