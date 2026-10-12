import React, { useState } from 'react';
import { Bus, Users, Calendar, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ServicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquiryType, setInquiryType] = useState('Corporate Employee Transit');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Thank you ${inquiryName}! Your charter & service inquiry has been received. Our operations team will contact you within 2 hours.`, 'success');
    setInquiryName('');
    setInquiryEmail('');
    setInquiryCompany('');
    setInquiryMessage('');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Services Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-6">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full font-bold">
          Comprehensive Passenger Mobility
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Tailored Transportation Solutions
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          From daily expressway commuters to multinational corporate fleets and special travel charters, SmartMove provides dependable, digitized transport across Sri Lanka.
        </p>
      </div>

      {/* Three Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pillar 1: Daily Commuters */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Daily Commuter Shuttles</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Express, scheduled departures linking major residential hubs to commercial city centres in Colombo and Kandy.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Dedicated seat reservation via smartphone</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Expressway priority lanes minimizing peak delays</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Student pass subsidies & frequent commuter points</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 2: Corporate Employee Transport */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Corporate Employee Shuttles</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bespoke transport contracts for IT parks, manufacturing facilities, banks, and corporate headquarters.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Automated passenger manifests & QR badge scans</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Centralized corporate billing & monthly invoicing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Custom pickup routes tailored to employee clusters</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pillar 3: Special Travel & Charters */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Special Travel & Event Charters</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              On-demand bus and luxury van charters for conferences, university excursions, weddings, and national tours.
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Experienced multilingual licensed captains</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Flexible itineraries across the island</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Complimentary Wi-Fi, refrigeration & audio systems</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Corporate Inquiry Form */}
      <section className="p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-bold">
            B2B & Fleet Partnerships
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Need a Dedicated Shuttle Contract for Your Organization?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Let our operations dispatch design a dedicated pickup route, vehicle allocation, and corporate billing plan for your team.
          </p>
        </div>

        <form onSubmit={handleSubmitInquiry} className="lg:col-span-7 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Contact Name</label>
              <input
                type="text"
                required
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                placeholder="e.g. Priyantha Dissanayake"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Business Email</label>
              <input
                type="email"
                required
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                placeholder="priyantha@company.lk"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Organization / Company</label>
              <input
                type="text"
                value={inquiryCompany}
                onChange={(e) => setInquiryCompany(e.target.value)}
                placeholder="e.g. MAS Holdings / Dialog Axiata"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Service Category</label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Corporate Employee Transit">Corporate Employee Transit</option>
                <option value="Special Travel Charter">Special Event / Charter</option>
                <option value="Daily Commuter Pass Plan">Group Commuter Pass</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Requirements / Route Details</label>
            <textarea
              rows={3}
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Specify estimated passenger count, starting pickup points, and frequency..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer shadow-md"
          >
            Submit Corporate Inquiry
          </button>
        </form>
      </section>
    </div>
  );
};
