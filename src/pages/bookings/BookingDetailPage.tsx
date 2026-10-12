import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ticket,
  QrCode,
  Bus,
  Clock,
  MapPin,
  User,
  CreditCard,
  Download,
  Printer,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { bookingService } from '../../services';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatLKR, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const loadBooking = async () => {
    if (!id) return;
    setLoading(true);
    const b = await bookingService.getById(id);
    setBooking(b || null);
    setLoading(false);
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!id) return;
    await bookingService.cancelBooking(id);
    showToast('Booking cancelled. Seats returned to inventory.', 'alert');
    setIsCancelModalOpen(false);
    loadBooking();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading reservation voucher...</div>;
  }

  if (!booking) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Reservation Not Found</h2>
        <button
          onClick={() => navigate('/app/bookings')}
          className="px-4 py-2 bg-slate-800 text-teal-300 rounded-xl text-xs font-bold"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/bookings')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Boarding Pass</span>
          </button>
          {booking.bookingStatus !== 'Cancelled' && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/80 text-xs font-bold cursor-pointer transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Booking</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Ticket Pass Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Ticket Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-blue-900/80 via-slate-900 to-teal-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase">
                Reference #{booking.bookingReference}
              </span>
              <StatusBadge status={booking.bookingStatus} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{booking.routeName}</h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Amount</span>
            <span className="text-2xl font-black text-teal-400 font-mono">
              {formatLKR(booking.totalAmountLkr)}
            </span>
          </div>
        </div>

        {/* Ticket Body with Two Columns */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Journey Specs */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Passenger</span>
                <p className="text-sm font-bold text-white">{booking.passengerName}</p>
                <p className="text-xs text-slate-400">{booking.passengerEmail}</p>
                <p className="text-xs text-slate-400">{booking.passengerPhone}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Reserved Seats</span>
                <p className="text-xl font-black text-teal-400 font-mono">{booking.seats.join(', ')}</p>
                <p className="text-xs text-slate-400 font-mono">Asset Reg: {booking.vehicleReg}</p>
                <p className="text-xs text-slate-400">Payment: {booking.paymentMethod} ({booking.paymentStatus})</p>
              </div>
            </div>

            {/* Travel Route & Departure */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase block">Departure</span>
                  <p className="text-xs font-bold text-white">{booking.startingLocation}</p>
                  <p className="text-xs font-mono text-teal-300">{formatDateTime(booking.departureDateTime)}</p>
                </div>

                <span className="text-slate-500 font-mono text-xs">→</span>

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] font-bold text-teal-400 uppercase block">Destination</span>
                  <p className="text-xs font-bold text-white">{booking.destination}</p>
                  <p className="text-xs text-slate-400">Direct Expressway Terminal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Passengers must present this digital QR ticket alongside valid National ID at boarding bay.</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-xl">
              <img
                src={booking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SMARTMOVE-${booking.bookingReference}`}
                alt="Ticket QR Code"
                className="w-36 h-36"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-teal-400 block">
                SCAN TO BOARD
              </span>
              <p className="text-[10px] text-slate-400">
                Gate Inspector Scanner ID: BAY-SCAN-2026
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Ticket Reservation"
        message="Are you sure you want to cancel this ticket? The allocated seats will be immediately returned to the trip inventory."
      />
    </div>
  );
};
