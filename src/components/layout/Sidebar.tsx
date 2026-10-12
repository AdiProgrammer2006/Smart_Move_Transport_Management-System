import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Users,
  Compass,
  CalendarClock,
  Ticket,
  CreditCard,
  Wrench,
  MessageSquare,
  BellRing,
  MessagesSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Database,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { role, logout, user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/app/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrator', 'Transport Manager', 'Driver', 'Passenger'],
    },
    {
      label: 'Vehicles',
      path: '/app/vehicles',
      icon: Bus,
      roles: ['Administrator', 'Transport Manager'],
    },
    {
      label: 'Drivers',
      path: '/app/drivers',
      icon: Users,
      roles: ['Administrator', 'Transport Manager'],
    },
    {
      label: 'Routes',
      path: '/app/routes',
      icon: Compass,
      roles: ['Administrator', 'Transport Manager'],
    },
    {
      label: 'Scheduled Trips',
      path: '/app/trips',
      icon: CalendarClock,
      roles: ['Administrator', 'Transport Manager', 'Driver'],
    },
    {
      label: 'Book Tickets',
      path: '/search-trips',
      icon: Ticket,
      roles: ['Passenger', 'Administrator'],
      badge: 'Book',
    },
    {
      label: 'Bookings',
      path: '/app/bookings',
      icon: Ticket,
      roles: ['Administrator', 'Transport Manager', 'Passenger'],
    },
    {
      label: 'Passengers',
      path: '/app/passengers',
      icon: Users,
      roles: ['Administrator'],
    },
    {
      label: 'Payments & Revenue',
      path: '/app/payments',
      icon: CreditCard,
      roles: ['Administrator', 'Passenger'],
    },
    {
      label: 'Maintenance',
      path: '/app/maintenance',
      icon: Wrench,
      roles: ['Administrator', 'Transport Manager'],
      badge: 'Alert',
    },
    {
      label: 'Feedback & Reviews',
      path: '/app/feedback',
      icon: MessageSquare,
      roles: ['Administrator', 'Driver', 'Passenger'],
    },
    {
      label: 'Announcements',
      path: '/app/announcements',
      icon: BellRing,
      roles: ['Administrator', 'Transport Manager', 'Passenger', 'Driver'],
    },
    {
      label: 'Community Forum',
      path: '/app/community',
      icon: MessagesSquare,
      roles: ['Administrator', 'Transport Manager', 'Driver', 'Passenger'],
    },
    {
      label: 'Business Reports',
      path: '/app/reports',
      icon: BarChart3,
      roles: ['Administrator', 'Transport Manager'],
      badge: '5 Reports',
    },
    {
      label: 'Database Design',
      path: '/app/database-design',
      icon: Database,
      roles: ['Administrator', 'Transport Manager', 'Driver', 'Passenger'],
      badge: 'ER & NoSQL',
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: Settings,
      roles: ['Administrator', 'Transport Manager', 'Driver', 'Passenger'],
    },
  ];

  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  const roleThemeColor = {
    Administrator: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    'Transport Manager': 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    Driver: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    Passenger: 'text-teal-400 bg-teal-950/60 border-teal-800/60',
  }[role];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bus className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="text-sm font-extrabold text-white tracking-tight block truncate">
                  SmartMove
                </span>
                <span className="text-[10px] font-bold tracking-wider text-teal-400 uppercase block -mt-0.5 truncate">
                  Transport Solutions
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Identity Card */}
        {!collapsed ? (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="overflow-hidden flex-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Active Role
              </span>
              <span className="text-xs font-bold text-white block truncate">{role}</span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${roleThemeColor}`}></span>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800 shrink-0">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <Link
            to="/app/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-3 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <span className="font-semibold text-white block truncate text-xs">{user?.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">{user?.email}</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => {
              logout();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
