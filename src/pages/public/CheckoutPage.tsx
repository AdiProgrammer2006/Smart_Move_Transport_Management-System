import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Bus,
  MapPin,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Download,
  AlertCircle,
  QrCode,
  Tag,
} from 'lucide-react';
import { Trip, Booking } from '../../types';
import { bookingService, paymentService, tripService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';
import { TicketPassModal } from '../../components/booking/TicketPassModal';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const stateTrip = (location.state as { trip?: Trip; seats?: string[] })?.trip;
  const stateSeats = (location.state as { trip?: Trip; seats?: string[] })?.seats || ['1A'];

  // Form states
  const [passengerName, setPassengerName] = useState(user?.name || 'Kasun Perera');
  const [passengerEmail, setPassengerEmail] = useState(user?.email || 'passenger@smartmove.lk');
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '+94 77 123 4567');
  const [passengerNic, setPassengerNic] = useState('199245802145V');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Bank Transfer' | 'Cash'>('Card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('452');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // If no trip was selected, provide a graceful fallback or prompt to select
  const currentTrip: Trip = stateTrip || {
    id: 'trp-101',
    routeId: 'rt-1',
    routeName: 'Colombo ↔ Kandy Expressway Superline',
    startingLocation: 'Bastian Mawatha Terminal, Colombo',
    destination: 'Kandy Goods Shed Terminal',
    vehicleId: 'veh-1',
    vehicleReg: 'WP ND-4521',
    vehicleType: 'Luxury Coach',
    driverId: 'drv-1',
    driverName: 'Bandara Jayasinghe',
    departureDateTime: '2026-10-12T06:30:00Z',
    estimatedArrivalDateTime: '2026-10-12T09:45:00Z',
    ticketPriceLkr: 1450,
    availableSeats: 34,
    totalSeats: 45,
    status: 'Scheduled',
    bookedSeats: ['1C', '2D'],
  };

  const seatsCount = stateSeats.length;
  const subtotal = currentTrip.ticketPriceLkr * seatsCount;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const serviceCharge = 150;
  const totalAmount = subtotal - discountAmount + serviceCharge;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SMARTCOMMUTE' || promoCode.trim().toUpperCase() === 'SRILANKA') {
      setDiscountPercent(15);
      showToast('Promo code applied! 15% discount granted.', 'success');
    } else {
      showToast('Invalid promo code. Try SMARTCOMMUTE', 'error');
    }
  };

  const handleConfirmCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !passengerEmail || !passengerPhone) {
      showToast('Please fill in all passenger details', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Booking
      const bookingData = await bookingService.create({
        tripId: currentTrip.id,
        routeName: currentTrip.routeName,
        startingLocation: currentTrip.startingLocation,
        destination: currentTrip.destination,
        departureDateTime: currentTrip.departureDateTime,
        passengerId: user?.id || `p-${Date.now()}`,
        passengerName,
        passengerEmail,
        passengerPhone,
        seats: stateSeats,
        totalAmountLkr: totalAmount,
        bookingStatus: 'Confirmed',
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid',
        vehicleReg: currentTrip.vehicleReg,
      });

      // 2. Create Payment Record
      await paymentService.create({
        bookingId: bookingData.id,
        bookingReference: bookingData.bookingReference,
        passengerName,
        amountLkr: totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid',
      });

      // 3. Update Trip available seats
      const updatedBooked = [...(currentTrip.bookedSeats || []), ...stateSeats];
      await tripService.update(currentTrip.id, {
        bookedSeats: updatedBooked,
        availableSeats: Math.max(0, currentTrip.totalSeats - updatedBooked.length),
      });

      setCompletedBooking(bookingData);
      showToast('Booking confirmed! Your digital boarding ticket is ready.', 'success');
    } catch {
      showToast('Payment processing error. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedBooking) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-8">
        <div className="p-8 bg-slate-900 border border-teal-500/30 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">
            Reservation Confirmed · Reference #{completedBooking.bookingReference}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Thank You, {completedBooking.passengerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Your seats ({completedBooking.seats.join(', ')}) on {completedBooking.routeName} are reserved. A confirmation SMS and digital ticket have been issued.
          </p>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2 font-mono text-xs max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-400">Route:</span>
              <span className="text-white font-bold">{completedBooking.routeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Departure:</span>
              <span className="text-white">{formatDateTime(completedBooking.departureDateTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Seats Reserved:</span>
              <span className="text-teal-400 font-bold">{completedBooking.seats.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Paid:</span>
              <span className="text-white font-bold">{formatLKR(completedBooking.totalAmountLkr)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                // Open modal
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Show Boarding QR Ticket</span>
            </button>
            <Link
              to="/app/bookings"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>View in My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Modal display */}
        <TicketPassModal
          booking={completedBooking}
          isOpen={true}
          onClose={() => navigate('/app/bookings')}
        />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Confirm Ticket Reservation & Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review trip itinerary, enter passenger details, and complete payment
        </p>
      </div>

      <form onSubmit={handleConfirmCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Passenger Info & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Passenger Information Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <User className="w-4 h-4 text-teal-400" />
              <span>Primary Passenger Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  placeholder="e.g. Kasun Perera"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">National ID / Passport</label>
                <input
                  type="text"
                  required
                  value={passengerNic}
                  onChange={(e) => setPassengerNic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  placeholder="e.g. 199245802145V"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address (for e-ticket)</label>
                <input
                  type="email"
                  required
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  placeholder="passenger@smartmove.lk"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Mobile Number (for SMS updates)</label>
                <input
                  type="tel"
                  required
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <CreditCard className="w-4 h-4 text-teal-400" />
              <span>Payment Gateway & Method</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Master, Amex' },
                { id: 'Bank Transfer', label: 'Mobile / Online Banking', desc: 'Genie, FriMi, IPG' },
                { id: 'Cash', label: 'Pay at Counter', desc: 'Terminal Bay Cashier' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === m.id
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block text-white">{m.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{m.desc}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'Card' && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                    placeholder="4532 0000 0000 0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">CVV Security Code</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Itinerary Summary</h3>

            <div className="space-y-3 pb-4 border-b border-slate-800">
              <div className="flex items-start gap-2.5">
                <Bus className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">{currentTrip.routeName}</span>
                  <span className="text-[11px] text-slate-400 block">{currentTrip.vehicleType} · {currentTrip.vehicleReg}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold">{currentTrip.startingLocation}</span>
                  <span className="block text-[11px] text-slate-400">To: {currentTrip.destination}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{formatDateTime(currentTrip.departureDateTime)}</span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Seats Reserved:</span>
                <span className="font-mono font-bold text-teal-400">{stateSeats.join(', ')}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-400" />
                <span>Discount / Voucher Code</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="SMARTCOMMUTE"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 font-mono text-xs pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Base Fare ({seatsCount} seat{seatsCount > 1 ? 's' : ''}):</span>
                <span>{formatLKR(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-teal-400">
                  <span>Discount ({discountPercent}%):</span>
                  <span>- {formatLKR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Online Booking Fee:</span>
                <span>{formatLKR(serviceCharge)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Payable:</span>
                <span className="text-teal-400 text-base">{formatLKR(totalAmount)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-extrabold text-xs transition-all shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Authorize {formatLKR(totalAmount)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>256-Bit SSL Encrypted Instant Payment</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
