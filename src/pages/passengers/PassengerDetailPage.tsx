import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { passengerService, bookingService } from '../../services';
import { Passenger, Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatLKR, formatDateTime, formatDate } from '../../utils/formatters';

export const PassengerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      const [p, allBookings] = await Promise.all([
        passengerService.getById(id),
        bookingService.getAll(),
      ]);
      setPassenger(p || null);
      if (p) {
        setBookings(allBookings.filter((b) => b.passengerId === p.id || b.passengerEmail === p.email));
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading commuter profile...</div>;
  }

  if (!passenger) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Passenger Record Not Found</h2>
        <button
          onClick={() => navigate('/app/passengers')}
          className="px-4 py-2 bg-slate-800 text-teal-300 rounded-xl text-xs font-bold"
        >
          Back to Passengers
        </button>
      </div>
    );
  }

  const totalSpent = bookings.reduce((sum, b) => sum + (b.bookingStatus === 'Confirmed' ? b.totalAmountLkr : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/passengers')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Passengers</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
              {passenger.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{passenger.fullName}</h1>
                <StatusBadge status={passenger.accountStatus} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Passenger ID: {passenger.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Loyalty Points</span>
              <span className="text-xl font-black text-teal-400 font-mono">{passenger.loyaltyPoints}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifetime Spend</span>
              <span className="text-xl font-black text-white font-mono">{formatLKR(totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* Contact Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email Address</span>
            </span>
            <p className="text-white font-semibold">{passenger.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              <span>Mobile Contact</span>
            </span>
            <p className="text-white font-semibold font-mono">{passenger.phoneNumber}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>Program Tier</span>
            </span>
            <p className="text-teal-300 font-semibold">{passenger.tier}</p>
          </div>
        </div>
      </div>

      {/* Travel History */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Ticket className="w-4 h-4 text-teal-400" />
          <span>Travel & Ticket Booking History ({bookings.length})</span>
        </h3>

        <div className="space-y-3 pt-1">
          {bookings.length === 0 ? (
            <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
              No previous bookings recorded for this passenger yet.
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-400">#{b.bookingReference}</span>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <p className="font-bold text-white">{b.routeName}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{formatDateTime(b.departureDateTime)}</span>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-300 font-mono font-bold inline-block">
                    Seats: {b.seats.join(', ')}
                  </span>
                  <p className="font-mono font-bold text-white text-sm">{formatLKR(b.totalAmountLkr)}</p>
                  <p className="text-[10px] text-slate-400">{b.paymentMethod} · {b.paymentStatus}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
