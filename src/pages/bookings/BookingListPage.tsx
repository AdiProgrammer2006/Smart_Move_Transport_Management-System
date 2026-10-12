import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Search,
  Eye,
  QrCode,
  XCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  CreditCard,
  Download,
} from 'lucide-react';
import { bookingService } from '../../services';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TicketPassModal } from '../../components/booking/TicketPassModal';
import { useToast } from '../../contexts/ToastContext';
import { formatLKR, formatDateTime } from '../../utils/formatters';

export const BookingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Booking | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    const data = await bookingService.getAll();
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    await bookingService.cancelBooking(cancelBookingId);
    showToast(`Booking #${cancelBookingId} has been cancelled.`, 'alert');
    setCancelBookingId(null);
    loadBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-teal-400" />
            <span>Passenger Reservations & Ticket Bookings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track confirmed e-tickets, seat allocations, QR boarding passes, and cancellation requests
          </p>
        </div>

        <button
          onClick={() => navigate('/search-trips')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Ticket className="w-4 h-4" />
          <span>Book New Ticket</span>
        </button>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by reservation reference, passenger, or corridor..."
        filters={[
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Confirmed Tickets', value: 'Confirmed' },
              { label: 'Pending Payment', value: 'Pending' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Reference & Passenger</th>
                <th className="px-5 py-4">Corridor & Schedule</th>
                <th className="px-5 py-4">Seats Allocated</th>
                <th className="px-5 py-4">Amount & Payment</th>
                <th className="px-5 py-4">Booking Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No reservations found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] font-bold text-teal-400 block">
                          #{b.bookingReference}
                        </span>
                        <p className="font-bold text-white text-xs">{b.passengerName}</p>
                        <p className="text-[10px] text-slate-400">{b.passengerPhone}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-white text-xs">{b.routeName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{formatDateTime(b.departureDateTime)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Asset: {b.vehicleReg}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-teal-300 font-mono text-xs font-bold inline-block">
                        {b.seats.join(', ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-white">
                          {formatLKR(b.totalAmountLkr)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-slate-400">{b.paymentMethod}</span>
                          <span>·</span>
                          <span
                            className={
                              b.paymentStatus === 'Paid'
                                ? 'text-teal-400'
                                : b.paymentStatus === 'Refunded'
                                ? 'text-purple-400'
                                : 'text-amber-400'
                            }
                          >
                            {b.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={b.bookingStatus} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTicketBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Show Digital QR Boarding Pass"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Pass</span>
                        </button>
                        <button
                          onClick={() => navigate(`/app/bookings/${b.id}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                          title="View Reservation Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {b.bookingStatus !== 'Cancelled' && (
                          <button
                            onClick={() => setCancelBookingId(b.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                            title="Cancel Ticket"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket QR Modal */}
      {selectedTicketBooking && (
        <TicketPassModal
          booking={selectedTicketBooking}
          isOpen={!!selectedTicketBooking}
          onClose={() => setSelectedTicketBooking(null)}
        />
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Ticket Reservation"
        message="Are you sure you want to cancel this ticket? The allocated seats will be immediately released back to the trip inventory."
      />
    </div>
  );
};
