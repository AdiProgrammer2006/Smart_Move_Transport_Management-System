import React, { useState } from 'react';
import { Trip } from '../../types';
import { Modal } from '../common/Modal';
import { formatLKR } from '../../utils/formatters';
import { Check, ArrowRight } from 'lucide-react';

interface SeatLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onConfirmSeats: (trip: Trip, selectedSeats: string[]) => void;
}

export const SeatLayoutModal: React.FC<SeatLayoutModalProps> = ({
  isOpen,
  onClose,
  trip,
  onConfirmSeats,
}) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  if (!trip) return null;

  const occupiedSeats = trip.bookedSeats || [];

  // Generate 10-12 rows for coaches/buses or 4-5 rows for vans
  const isVan = trip.vehicleType === 'Van';
  const rowCount = isVan ? 5 : 11;
  const rows = Array.from({ length: rowCount }, (_, i) => String(i + 1).padStart(2, '0'));
  const colsLeft = isVan ? ['A'] : ['A', 'B'];
  const colsRight = isVan ? ['B', 'C'] : ['C', 'D'];

  const toggleSeat = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum 6 seats per booking reservation.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalPrice = selectedSeats.length * trip.ticketPriceLkr;

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    onConfirmSeats(trip, selectedSeats);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Passenger Seats"
      subtitle={`${trip.routeName} · ${trip.vehicleType} (${trip.vehicleReg})`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Legend */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-teal-500 border border-teal-400 shadow-sm"></div>
            <span className="text-teal-300 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-rose-950/70 border border-rose-800 text-rose-500"></div>
            <span className="text-slate-500">Occupied</span>
          </div>
        </div>

        {/* Bus / Van Chassis Frame */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs mx-auto">
          {/* Driver Cockpit */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-[11px] font-mono text-slate-500">
            <span>[ FRONT ]</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              DRIVER: {trip.driverName}
            </span>
          </div>

          {/* Seat Rows Grid */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {rows.map((row) => (
              <div key={row} className="flex items-center justify-between gap-3">
                {/* Left side */}
                <div className="flex gap-2">
                  {colsLeft.map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`w-9 h-9 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-400 text-slate-950 shadow-md ring-2 ring-teal-300'
                            : isOccupied
                            ? 'bg-rose-950/40 border border-rose-900 text-rose-700 cursor-not-allowed line-through'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-teal-400 hover:text-white'
                        }`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle */}
                <span className="text-[10px] font-mono text-slate-600 w-4 text-center">{row}</span>

                {/* Right side */}
                <div className="flex gap-2">
                  {colsRight.map((col) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <button
                        key={seatId}
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`w-9 h-9 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-400 text-slate-950 shadow-md ring-2 ring-teal-300'
                            : isOccupied
                            ? 'bg-rose-950/40 border border-rose-900 text-rose-700 cursor-not-allowed line-through'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-teal-400 hover:text-white'
                        }`}
                      >
                        {seatId}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Summary & Action */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Chosen Seats:</span>
            <span className="font-mono font-bold text-teal-400">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Fare per Seat:</span>
            <span className="font-mono text-white">{formatLKR(trip.ticketPriceLkr)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Payable</span>
              <span className="font-mono text-lg font-bold text-teal-400">{formatLKR(totalPrice)}</span>
            </div>

            <button
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-teal-500/20 cursor-pointer"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
