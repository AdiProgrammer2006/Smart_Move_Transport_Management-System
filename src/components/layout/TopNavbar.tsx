import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  LogOut,
  Settings,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Bus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, NotificationItem } from '../../types';

interface TopNavbarProps {
  onToggleMobile: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobile }) => {
  const location = useLocation();
  const { user, role, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mock Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Departure Ready: Trip #trp-101',
      message: 'Colombo ↔ Kandy Volvo Coach WP ND-4521 is now boarding at Bay A-3.',
      timestamp: '10 mins ago',
      read: false,
      type: 'booking',
    },
    {
      id: 'notif-2',
      title: 'Maintenance Due Alert',
      message: 'King Long Coach NW NB-5420 has reached 145,000km milestone.',
      timestamp: '1 hour ago',
      read: false,
      type: 'maintenance',
    },
    {
      id: 'notif-3',
      title: 'Southern Expressway Advisory',
      message: 'RDA resurfacing notice near Welipenna. Possible 15 min buffer.',
      timestamp: '3 hours ago',
      read: true,
      type: 'alert',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const roles: UserRole[] = ['Administrator', 'Transport Manager', 'Driver', 'Passenger'];

  // Breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathSegments[pathSegments.length - 1]
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').toUpperCase()
    : 'DASHBOARD';

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left Breadcrumb & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link to="/" className="text-slate-500 hover:text-slate-300 font-medium hidden sm:inline">
            SmartMove
          </Link>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="font-mono text-teal-400 font-bold tracking-wide">{currentTitle}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Public Website Preview Link */}
        <Link
          to="/"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Bus className="w-3.5 h-3.5 text-teal-400" />
          <span>Public Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </Link>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setNotificationMenuOpen(false);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-teal-300 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline font-mono">Role:</span>
            <span className="font-bold text-white">{role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800">
                Switch Role Persona
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                    role === r
                      ? 'bg-slate-800 text-teal-300 font-bold'
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

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationMenuOpen(!notificationMenuOpen);
              setRoleMenuOpen(false);
              setUserMenuOpen(false);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-950"></span>
            )}
          </button>

          {notificationMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-teal-950 text-teal-300 border border-teal-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                      n.read
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                        : 'bg-slate-950 border-slate-800 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <Link
                  to="/app/announcements"
                  onClick={() => setNotificationMenuOpen(false)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                >
                  View Travel Bulletins & Notices →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setRoleMenuOpen(false);
              setNotificationMenuOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-white block leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-mono block leading-tight">{role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 space-y-1">
              <div className="px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white block">{user?.name}</span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">{user?.email}</span>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block mt-0.5">
                  {role} Access
                </span>
              </div>

              <Link
                to="/app/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
