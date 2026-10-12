import React, { useState } from 'react';
import { Trip, TransportRoute, Passenger, Booking } from '../data/relationalTypes';
import { Bus, User, CreditCard, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface BookingPortalViewProps {
  trips: Trip[];
  routes: TransportRoute[];
  passengers: Passenger[];
  bookings: Booking[];
  onBookSuccess: (newBooking: Booking) => void;
  onOpenTicket: (booking: Booking) => void;
}

export const BookingPortalView: React.FC<BookingPortalViewProps> = ({
  trips,
  routes,
  passengers,
  bookings,
  onBookSuccess,
  onOpenTicket,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<number>(routes[0]?.route_id || 301);
  const filteredTrips = trips.filter((t) => t.route_id === selectedRouteId && t.status !== 'COMPLETED');
  const [selectedTripId, setSelectedTripId] = useState<number>(filteredTrips[0]?.trip_id || trips[0]?.trip_id || 501);
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [selectedPassengerId, setSelectedPassengerId] = useState<number>(passengers[0]?.passenger_id || 401);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DIGITAL_WALLET');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txLog, setTxLog] = useState<string | null>(null);

  const currentRoute = routes.find((r) => r.route_id === selectedRouteId) || routes[0];
  const currentTrip = trips.find((t) => t.trip_id === selectedTripId) || filteredTrips[0] || trips[0];
  const currentPassenger = passengers.find((p) => p.passenger_id === selectedPassengerId) || passengers[0];

  // Calculate pricing & discount
  const baseFare = currentRoute?.base_fare || 8.50;
  let discountPct = 0;
  if (currentPassenger.passenger_tier === 'STUDENT') discountPct = 0.20;
  else if (currentPassenger.passenger_tier === 'CORPORATE_EMPLOYEE') discountPct = 0.15;
  else if (currentPassenger.passenger_tier === 'SENIOR_CITIZEN') discountPct = 0.25;

  const discountAmount = Number((baseFare * discountPct).toFixed(2));
  const finalPrice = Number((baseFare - discountAmount).toFixed(2));

  // Determine occupied seats for current trip
  const occupiedSeats = bookings
    .filter((b) => b.trip_id === currentTrip.trip_id && b.status !== 'CANCELLED')
    .map((b) => b.seat_number);

  // Generate seat map layout (12 rows x 4 seats: A, B [aisle] C, D)
  const rows = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const columnsLeft = ['A', 'B'];
  const columnsRight = ['C', 'D'];

  const handleSeatSelect = (seat: string) => {
    if (occupiedSeats.includes(seat)) return;
    setSelectedSeat(seat);
  };

  const handleExecuteBooking = () => {
    if (!selectedSeat) return;

    setIsProcessing(true);
    setTxLog('Calling PL/SQL procedure: PKG_TRANSPORT_REPORTS.SP_BOOK_TICKET_TRANSACTION...');

    setTimeout(() => {
      // Simulate Oracle atomic transaction commit
      const newBookingId = 600 + bookings.length + 1;
      const newBooking: Booking = {
        booking_id: newBookingId,
        trip_id: currentTrip.trip_id,
        passenger_id: currentPassenger.passenger_id,
        seat_number: selectedSeat,
        booking_timestamp: new Date().toISOString(),
        fare_amount: baseFare,
        discount_applied: discountAmount,
        total_paid: finalPrice,
        status: 'CONFIRMED',
        passenger_name: `${currentPassenger.first_name} ${currentPassenger.last_name}`,
        passenger_email: currentPassenger.email,
        route_name: currentRoute.route_name,
        departure_time: currentTrip.scheduled_departure,
      };

      onBookSuccess(newBooking);
      setIsProcessing(false);
      setTxLog(`Transaction Committed: Booking #${newBookingId} verified with ${paymentMethod}.`);
      onOpenTicket(newBooking);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Express Seat Reservation & Digital Ticketing</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Atomic seat reservation connected to Oracle PL/SQL transaction logic with dynamic passenger tier subsidies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Corridor & Passenger Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Corridor Selection */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <label className="text-xs font-semibold text-slate-300 block">1. Select Transit Corridor</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {routes.map((route) => (
                <button
                  key={route.route_id}
                  onClick={() => {
                    setSelectedRouteId(route.route_id);
                    const t = trips.find((item) => item.route_id === route.route_id && item.status !== 'COMPLETED');
                    if (t) setSelectedTripId(t.trip_id);
                    setSelectedSeat('');
                  }}
                  className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                    selectedRouteId === route.route_id
                      ? 'bg-teal-950/40 border-teal-500/80 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-teal-400">{route.route_code}</span>
                    <span className="text-[11px] text-slate-400">{route.total_distance_km} km · {route.estimated_duration_mins} min</span>
                  </div>
                  <div className="text-xs font-medium text-white line-clamp-1">{route.route_name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Base Fare: <span className="font-mono text-emerald-400 font-semibold">${route.base_fare.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Departure Dispatch Selector */}
            <div className="border-t border-slate-800/80 pt-3">
              <label className="text-xs font-semibold text-slate-300 block mb-2">2. Choose Scheduled Dispatch</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredTrips.map((trip) => (
                  <button
                    key={trip.trip_id}
                    onClick={() => {
                      setSelectedTripId(trip.trip_id);
                      setSelectedSeat('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedTripId === trip.trip_id
                        ? 'bg-slate-800 border-teal-400 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold">
                      {new Date(trip.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Trip #{trip.trip_id} · <span className="text-teal-400 font-mono">{trip.available_seats} seats left</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Passenger Identity & Tier Discount */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <label className="text-xs font-semibold text-slate-300 block">3. Passenger Account & Tier Subsidy</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {passengers.map((p) => (
                <button
                  key={p.passenger_id}
                  onClick={() => setSelectedPassengerId(p.passenger_id)}
                  className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                    selectedPassengerId === p.passenger_id
                      ? 'bg-teal-950/40 border-teal-500/80 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{p.first_name} {p.last_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">ID #{p.passenger_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.email}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-teal-400 font-medium">
                      {p.passenger_tier === 'STUDENT' ? 'Student (-20%)' : p.passenger_tier === 'CORPORATE_EMPLOYEE' ? 'Corporate (-15%)' : p.passenger_tier === 'SENIOR_CITIZEN' ? 'Senior (-25%)' : 'Commuter'}
                    </span>
                    <span className="font-mono text-slate-400">Bal: ${p.wallet_balance.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">4. Payment Settlement Gateway</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { method: 'DIGITAL_WALLET' as PaymentMethod, label: 'SmartMove Wallet' },
                { method: 'CORPORATE_ACCOUNT' as PaymentMethod, label: 'Corporate Billing' },
                { method: 'CREDIT_CARD' as PaymentMethod, label: 'Credit Card' },
                { method: 'DEBIT_CARD' as PaymentMethod, label: 'Debit Card' },
              ].map((item) => (
                <button
                  key={item.method}
                  onClick={() => setPaymentMethod(item.method)}
                  className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-colors cursor-pointer ${
                    paymentMethod === item.method
                      ? 'bg-slate-800 border-teal-400 text-teal-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Seat Map & Checkout Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bus Seat Map */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Interactive Cabin Seat Map</span>
                <span className="text-[11px] text-slate-400">Click an available teal seat to select</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500"></div>
                  <span className="text-slate-400">Open</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400"></div>
                  <span className="text-slate-400">Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></div>
                  <span className="text-slate-500">Booked</span>
                </div>
              </div>
            </div>

            {/* Cabin Body Mockup */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-xs mx-auto">
              {/* Driver Cabin Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3 text-[11px] text-slate-500 font-mono">
                <span>[ FRONT COCKPIT ]</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400">CAPTAIN CABIN</span>
              </div>

              {/* Rows */}
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                {rows.map((row) => (
                  <div key={row} className="flex items-center justify-between gap-2">
                    {/* Left seats A, B */}
                    <div className="flex gap-1.5">
                      {columnsLeft.map((col) => {
                        const seatCode = `${row}${col}`;
                        const isOccupied = occupiedSeats.includes(seatCode);
                        const isSelected = selectedSeat === seatCode;

                        return (
                          <button
                            key={seatCode}
                            disabled={isOccupied}
                            onClick={() => handleSeatSelect(seatCode)}
                            className={`w-8 h-8 rounded text-[11px] font-mono font-semibold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300 font-bold'
                                : isOccupied
                                ? 'bg-slate-800/80 text-slate-600 border border-slate-800 cursor-not-allowed'
                                : 'bg-teal-950/40 border border-teal-600/60 text-teal-300 hover:bg-teal-800/40 hover:border-teal-400'
                            }`}
                          >
                            {seatCode}
                          </button>
                        );
                      })}
                    </div>

                    {/* Aisle Spacer */}
                    <span className="text-[9px] font-mono text-slate-600 w-4 text-center">{row}</span>

                    {/* Right seats C, D */}
                    <div className="flex gap-1.5">
                      {columnsRight.map((col) => {
                        const seatCode = `${row}${col}`;
                        const isOccupied = occupiedSeats.includes(seatCode);
                        const isSelected = selectedSeat === seatCode;

                        return (
                          <button
                            key={seatCode}
                            disabled={isOccupied}
                            onClick={() => handleSeatSelect(seatCode)}
                            className={`w-8 h-8 rounded text-[11px] font-mono font-semibold flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300 font-bold'
                                : isOccupied
                                ? 'bg-slate-800/80 text-slate-600 border border-slate-800 cursor-not-allowed'
                                : 'bg-teal-950/40 border border-teal-600/60 text-teal-300 hover:bg-teal-800/40 hover:border-teal-400'
                            }`}
                          >
                            {seatCode}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Settlement Breakdown</h3>
            
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Seat:</span>
                <span className="font-mono font-bold text-teal-400">{selectedSeat || 'None (Choose on map)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Corridor Fare:</span>
                <span className="font-mono text-slate-200">${baseFare.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Tier Subsidy ({discountPct * 100}%):</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Net Total:</span>
                <span className="font-mono text-emerald-400">${finalPrice.toFixed(2)}</span>
              </div>
            </div>

            {txLog && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-400">
                {txLog}
              </div>
            )}

            <button
              disabled={!selectedSeat || isProcessing}
              onClick={handleExecuteBooking}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !selectedSeat || isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-md hover:shadow-teal-500/20'
              }`}
            >
              {isProcessing ? (
                <span>Executing Oracle Stored Procedure...</span>
              ) : (
                <>
                  <span>Confirm Reservation & Generate Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
