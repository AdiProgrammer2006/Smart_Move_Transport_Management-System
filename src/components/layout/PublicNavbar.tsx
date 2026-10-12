import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, User, LogIn, Menu, X, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const { user, role, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Trips', path: '/search-trips' },
    { label: 'Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const roles: UserRole[] = ['Administrator', 'Transport Manager', 'Driver', 'Passenger'];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block">
                SmartMove
              </span>
              <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase block -mt-0.5">
                Transport Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-teal-300 bg-slate-900 border border-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Quick Dev Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono font-medium rounded-lg bg-slate-900 border border-slate-800 text-teal-300 hover:border-slate-700 transition-colors cursor-pointer"
                title="Switch role for instant UI testing"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Role: {role}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800">
                    Switch Test Persona
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between ${
                        role === r
                          ? 'bg-slate-800 text-teal-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{r}</span>
                      {role === r && <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/app/dashboard"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Dashboard ({role})
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-mono mb-1">Active Role: {role}</div>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`p-2 text-xs font-medium rounded-lg border text-left ${
                    role === r
                      ? 'bg-slate-800 border-teal-400 text-teal-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <Link
              to="/app/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-3 py-2.5 text-center text-xs font-bold text-slate-950 bg-teal-400 rounded-lg block"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
