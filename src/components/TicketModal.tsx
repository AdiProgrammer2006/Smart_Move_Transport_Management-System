import React from 'react';
import { Booking, Trip, TransportRoute } from '../data/relationalTypes';
import { QrCode, CheckCircle2, X, Download, ShieldCheck } from 'lucide-react';

interface TicketModalProps {
  booking: Booking | null;
  trip?: Trip;
  route?: TransportRoute;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ booking, trip, route, onClose }) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-600 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">SmartMove Official E-Ticket</h3>
              <p className="text-xs text-teal-100">Boarding Pass & Tax Invoice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400 block">Booking Reference</span>
              <span className="font-mono text-base font-bold text-teal-400">#BK-2026-{booking.booking_id}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{booking.status}</span>
            </div>
          </div>

          {/* Route & Corridor */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Transit Corridor</span>
            <div className="text-sm font-bold text-white">
              {route?.route_name || booking.route_name || 'Metro Central ↔ Tech Corridor'}
            </div>
            <div className="text-xs text-slate-400">
              {route?.origin_city || 'Central Terminal'} → {route?.destination_city || 'Destination Hub'}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-[11px] text-slate-400 block">Seat</span>
              <span className="font-mono text-lg font-bold text-amber-400">{booking.seat_number}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Departure</span>
              <span className="font-mono text-xs font-semibold text-slate-200">
                {booking.departure_time ? new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '07:30 AM'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Total Fare</span>
              <span className="font-mono text-base font-bold text-emerald-400">${booking.total_paid.toFixed(2)}</span>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="border-t border-slate-800 pt-3 flex justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Passenger Name</span>
              <span className="font-medium text-slate-200">{booking.passenger_name || 'Registered Commuter'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Trip Dispatch</span>
              <span className="font-mono text-slate-300">TRIP #{booking.trip_id}</span>
            </div>
          </div>

          {/* Simulated QR Code for Gate Scanner */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="p-3 bg-white rounded-lg shadow-inner">
              {/* Scalable Vector QR Code Representation */}
              <svg className="w-28 h-28" viewBox="0 0 100 100" fill="black">
                <rect width="100" height="100" fill="white" />
                {/* Top-left locator */}
                <rect x="10" y="10" width="24" height="24" fill="black" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="black" />
                {/* Top-right locator */}
                <rect x="66" y="10" width="24" height="24" fill="black" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="black" />
                {/* Bottom-left locator */}
                <rect x="10" y="66" width="24" height="24" fill="black" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="black" />
                {/* Data modules */}
                <rect x="38" y="12" width="4" height="4" fill="black" />
                <rect x="46" y="12" width="4" height="4" fill="black" />
                <rect x="54" y="16" width="4" height="8" fill="black" />
                <rect x="38" y="24" width="8" height="4" fill="black" />
                <rect x="42" y="38" width="16" height="16" fill="black" />
                <rect x="46" y="42" width="8" height="8" fill="white" />
                <rect x="66" y="44" width="8" height="4" fill="black" />
                <rect x="78" y="40" width="12" height="4" fill="black" />
                <rect x="12" y="44" width="8" height="12" fill="black" />
                <rect x="28" y="48" width="4" height="4" fill="black" />
                <rect x="40" y="66" width="8" height="8" fill="black" />
                <rect x="56" y="72" width="8" height="16" fill="black" />
                <rect x="72" y="66" width="16" height="8" fill="black" />
                <rect x="80" y="80" width="8" height="8" fill="black" />
              </svg>
            </div>
            <p className="mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              SCAN AT TURNSTILE GATE • PASS #{booking.booking_id}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
