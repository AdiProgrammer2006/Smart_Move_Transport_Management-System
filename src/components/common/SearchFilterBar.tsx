import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id?: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  placeholder?: string;
  filters?: FilterGroup[];
  onReset?: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  placeholder,
  filters = [],
  onReset,
}) => {
  const effectivePlaceholder = placeholder || searchPlaceholder || 'Search records...';
  const hasActiveFilters = searchQuery !== '' || filters.some((f) => f.value !== '' && f.value !== 'ALL');

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={effectivePlaceholder}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <div key={filter.id || filter.label} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-400 transition-colors cursor-pointer appearance-none pr-8"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
