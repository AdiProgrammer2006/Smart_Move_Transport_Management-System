import React from 'react';
import { ShieldCheck, Bus, Award, Users, MapPin, Globe } from 'lucide-react';
import { terminalImage, coachImage } from '../../mockData';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-6">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full font-bold">
          About SmartMove Transport Solutions
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Pioneering Safe & Modern Mobility in Sri Lanka
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Founded with the vision to modernize Sri Lanka's public and private transit landscape, SmartMove combines reliable commercial fleet operations with intelligent real-time scheduling.
        </p>
      </div>

      {/* Visual Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 h-80 sm:h-96">
          <img
            src={terminalImage}
            alt="SmartMove Operations Center"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Centralized Transit Management Engineered for Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every day, thousands of commuters across Colombo, Kandy, Galle, and Matara rely on SmartMove coaches and executive vans to reach their offices, universities, and homes on time.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-mono text-2xl font-black text-teal-400">12,500+</span>
              <span className="text-xs text-slate-400 block">Weekly Passengers Carried</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-mono text-2xl font-black text-blue-400">98.2%</span>
              <span className="text-xs text-slate-400 block">Expressway On-Time Rate</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-mono text-2xl font-black text-emerald-400">100%</span>
              <span className="text-xs text-slate-400 block">Fleet Preventive Maintenance</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
              <span className="font-mono text-2xl font-black text-purple-400">4.9 / 5</span>
              <span className="text-xs text-slate-400 block">Customer Satisfaction Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership & Values */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Our Core Operating Commitments</h2>
          <p className="text-xs text-slate-400">How we maintain zero accidents and passenger trust</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
            <h3 className="text-base font-bold text-white">Safety Above All</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every driver undergoes rigorous background verification, periodic health screenings, and continuous telemetry monitoring for speed compliance.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Award className="w-8 h-8 text-blue-400" />
            <h3 className="text-base font-bold text-white">Strict Vehicle Maintenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated triggers ensure no vehicle operates past mandated brake, tyre, or fluid thresholds. Authorized agency mechanics service every asset.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Globe className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Environmental Responsibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leading the green transition with electric buses from BYD, eliminating tons of particulate matter and urban exhaust annually.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
