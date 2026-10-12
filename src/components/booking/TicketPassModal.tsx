import React from 'react';
import { Booking } from '../../types';
import { Modal } from '../common/Modal';
import { formatLKR, formatDateTime } from '../../utils/formatters';
import { Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TicketPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official E-Ticket & Boarding Pass"
      subtitle={`Booking Reference #${booking.bookingReference}`}
      maxWidth="md"
    >
      <div className="space-y-5 print:p-0">
        {/* Printable Ticket Voucher */}
        <div className="bg-slate-950 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">SmartMove Official E-Ticket</h4>
                <p className="text-[10px] text-teal-400 font-mono">National Transport Commission Compliant</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{booking.bookingStatus}</span>
            </div>
          </div>

          {/* Corridor & Route Header */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block font-mono">TRANSIT CORRIDOR</span>
            <div className="text-base font-extrabold text-white">{booking.routeName}</div>
            <div className="text-xs text-slate-300 font-medium">
              {booking.startingLocation} → {booking.destination}
            </div>
          </div>

          {/* Key Ticket Details Grid */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">SEAT(S)</span>
              <span className="font-mono text-base font-bold text-amber-400">{booking.seats.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">DEPARTURE</span>
              <span className="font-mono text-xs font-semibold text-slate-200">
                {formatDateTime(booking.departureDateTime)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">TOTAL FARE</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{formatLKR(booking.totalAmountLkr)}</span>
            </div>
          </div>

          {/* Passenger & Vehicle Info */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-3">
            <div>
              <span className="text-slate-400 block text-[10px]">PASSENGER NAME</span>
              <span className="font-semibold text-white">{booking.passengerName}</span>
              <span className="text-[10px] text-slate-500 block">{booking.passengerPhone}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">ASSIGNED FLEET</span>
              <span className="font-mono font-bold text-teal-300">{booking.vehicleReg}</span>
              <span className="text-[10px] text-slate-500 font-mono block">Paid via {booking.paymentMethod}</span>
            </div>
          </div>

          {/* Vector SVG Turnstile QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="p-3 bg-white rounded-lg shadow-inner">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="black">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="24" height="24" fill="black" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="black" />
                <rect x="66" y="10" width="24" height="24" fill="black" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="black" />
                <rect x="10" y="66" width="24" height="24" fill="black" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="black" />
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
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">
              SCAN AT TERMINAL TURNSTILE GATE
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ticket</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
