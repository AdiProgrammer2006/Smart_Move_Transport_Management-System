import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CreditCard,
  Star,
  MapPin,
  Calendar,
  Bus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService, paymentService, tripService } from '../../services';
import { Booking, Payment, Trip } from '../../types';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';
import { TicketPassModal } from '../../components/booking/TicketPassModal';

export const PassengerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [activeTicketBooking, setActiveTicketBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadPassengerData = async () => {
      const [allBookings, allPayments] = await Promise.all([
        bookingService.getAll(),
        paymentService.getAll(),
      ]);

      // Filter bookings matching current passenger
      const filteredBookings = allBookings.filter(
        (b) => b.passengerEmail === user?.email || b.passengerName.toLowerCase().includes('kasun')
      );
      setMyBookings(filteredBookings.length > 0 ? filteredBookings : allBookings.slice(0, 3));
      setMyPayments(allPayments.slice(0, 3));
    };
    loadPassengerData();
  }, [user]);

  const activeReservations = myBookings.filter((b) => b.bookingStatus === 'Confirmed');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
              SMARTMOVE PASSENGER
            </span>
            <span className="text-xs text-slate-400 font-mono">Loyalty Tier: Regular Commuter</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Ayubowan, {user?.name || 'Kasun Perera'}!
          </h1>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Manage your expressway seat reservations, access digital boarding passes, and view verified payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/search-trips')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20 cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>Book New Trip</span>
          </button>
        </div>
      </div>

      {/* Passenger Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block font-mono">ACTIVE CONFIRMED RESERVATIONS</span>
          <div className="font-mono text-2xl font-black text-white">{activeReservations.length}</div>
          <span className="text-[11px] text-teal-400">Boarding pass ready</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block font-mono">SMARTMOVE LOYALTY POINTS</span>
          <div className="font-mono text-2xl font-black text-amber-400">1,250 PTS</div>
          <span className="text-[11px] text-slate-400">Redeemable for 1 free expressway trip</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 block font-mono">TOTAL COMPLETED RUNS</span>
          <div className="font-mono text-2xl font-black text-emerald-400">18 Trips</div>
          <span className="text-[11px] text-slate-400">Colombo, Kandy, Galle Corridors</span>
        </div>
      </div>

      {/* Active Digital Boarding Pass Spotlight */}
      {activeReservations.length > 0 && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                Next Upcoming Journey
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {activeReservations[0].routeName}
              </h2>
            </div>
            <button
              onClick={() => setActiveTicketBooking(activeReservations[0])}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors cursor-pointer shadow-sm"
            >
              Open E-Ticket Pass & QR
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">REF NUMBER</span>
              <span className="text-teal-400 font-bold">{activeReservations[0].bookingReference}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">SEAT(S)</span>
              <span className="text-amber-400 font-bold">{activeReservations[0].seats.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">DEPARTURE TIME</span>
              <span className="text-white font-bold">{formatDateTime(activeReservations[0].departureDateTime)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TOTAL FARE</span>
              <span className="text-emerald-400 font-bold">{formatLKR(activeReservations[0].totalAmountLkr)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid: All My Bookings (7 cols) + Payment History (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Bookings List */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">My Journey History</h3>
            <Link to="/app/bookings" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
              All Bookings →
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {myBookings.map((b) => (
              <div key={b.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-300">{b.bookingReference}</span>
                    <span className="text-xs font-semibold text-white">{b.routeName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Seats: {b.seats.join(', ')} · Total: {formatLKR(b.totalAmountLkr)}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    onClick={() => setActiveTicketBooking(b)}
                    className="text-xs text-teal-400 hover:text-teal-300 underline font-semibold block cursor-pointer"
                  >
                    View E-Ticket
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {b.bookingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payments History */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Payment Receipts</h3>
            <Link to="/app/payments" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
              Ledger →
            </Link>
          </div>

          <div className="space-y-3">
            {myPayments.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-white font-bold block">{p.receiptNumber}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{p.paymentMethod} Payment</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">{formatLKR(p.amountLkr)}</span>
                  <span className="text-[10px] text-teal-400">{p.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Pass Modal */}
      {activeTicketBooking && (
        <TicketPassModal
          isOpen={!!activeTicketBooking}
          onClose={() => setActiveTicketBooking(null)}
          booking={activeTicketBooking}
        />
      )}
    </div>
  );
};
