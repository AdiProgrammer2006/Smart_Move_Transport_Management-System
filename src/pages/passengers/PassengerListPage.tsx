import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  Award,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { passengerService } from '../../services';
import { Passenger } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { formatDate } from '../../utils/formatters';

export const PassengerListPage: React.FC = () => {
  const navigate = useNavigate();

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadPassengers = async () => {
    setLoading(true);
    const data = await passengerService.getAll();
    setPassengers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPassengers();
  }, []);

  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phoneNumber.includes(searchQuery);
    const matchesTier = tierFilter === 'ALL' || p.tier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || p.accountStatus === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const totalPoints = passengers.reduce((sum, p) => sum + p.loyaltyPoints, 0);
  const corporateCount = passengers.filter((p) => p.tier === 'Corporate Partner').length;
  const studentCount = passengers.filter((p) => p.tier === 'Student Pass').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-teal-400" />
          <span>Registered Passengers & Commuter Accounts</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor passenger profiles, membership tiers, loyalty reward balances, and booking histories
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Registered Commuters</span>
          <span className="text-2xl font-black text-white font-mono">{passengers.length}</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Corporate Partners</span>
          <span className="text-2xl font-black text-blue-400 font-mono">{corporateCount}</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Student Passes</span>
          <span className="text-2xl font-black text-purple-400 font-mono">{studentCount}</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Loyalty Points</span>
          <span className="text-2xl font-black text-teal-400 font-mono">{totalPoints}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by passenger name, email, or mobile..."
        filters={[
          {
            label: 'Tier',
            value: tierFilter,
            options: [
              { label: 'All Tiers', value: 'ALL' },
              { label: 'Regular Commuter', value: 'Regular Commuter' },
              { label: 'Corporate Partner', value: 'Corporate Partner' },
              { label: 'Student Pass', value: 'Student Pass' },
            ],
            onChange: setTierFilter,
          },
          {
            label: 'Account Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'Active' },
              { label: 'Suspended', value: 'Suspended' },
              { label: 'Pending', value: 'Pending' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Passenger & Contact</th>
                <th className="px-5 py-4">Membership Tier</th>
                <th className="px-5 py-4">Registration Date</th>
                <th className="px-5 py-4">Loyalty Balance</th>
                <th className="px-5 py-4">Account Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredPassengers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No passengers match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredPassengers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-sm">{p.fullName}</span>
                        <p className="text-[11px] text-slate-400">{p.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.phoneNumber}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          p.tier === 'Corporate Partner'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : p.tier === 'Student Pass'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>{p.tier}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">
                      {formatDate(p.registrationDate)}
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <span className="font-bold text-teal-400 text-sm">{p.loyaltyPoints}</span>
                      <span className="text-[10px] text-slate-400 block">points</span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={p.accountStatus} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/app/passengers/${p.id}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 cursor-pointer transition-colors"
                        title="View Passenger Profile & Travel History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
