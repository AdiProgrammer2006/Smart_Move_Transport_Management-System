import React from 'react';
import { Bus, Database, BarChart3, Layers, Compass, FileCode2 } from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'booking' 
  | 'fleet' 
  | 'er_diagram' 
  | 'plsql_reports' 
  | 'mongodb_hub' 
  | 'sql_workbench';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickBook: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onQuickBook }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors">
              <Bus className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-base font-bold tracking-tight text-white block">
                SmartMove
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase block">
                Transport Solutions
              </span>
            </div>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Operations Hub</span>
            </button>

            <button
              onClick={() => onTabChange('booking')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'booking'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Book Ticket</span>
            </button>

            <button
              onClick={() => onTabChange('fleet')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'fleet'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Fleet & Drivers</span>
            </button>

            <button
              onClick={() => onTabChange('er_diagram')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'er_diagram'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ER / EER Studio</span>
            </button>

            <button
              onClick={() => onTabChange('plsql_reports')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'plsql_reports'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>PL/SQL Reports</span>
            </button>

            <button
              onClick={() => onTabChange('mongodb_hub')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'mongodb_hub'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB Hub</span>
            </button>

            <button
              onClick={() => onTabChange('sql_workbench')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'sql_workbench'
                  ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>SQL Workbench</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickBook}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:shadow-teal-500/20"
            >
              + Reserve Seat
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
