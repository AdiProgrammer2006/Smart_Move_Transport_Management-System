import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Bus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { tripService } from '../../services';
import { Trip } from '../../types';
import { formatLKR, formatTime, formatDate } from '../../utils/formatters';
import { SeatLayoutModal } from '../../components/booking/SeatLayoutModal';

export const SearchTripsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [origin, setOrigin] = useState(searchParams.get('origin') || 'All');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'All');
  const [vehicleType, setVehicleType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [timeFilter, setTimeFilter] = useState('All');

  // Seat modal state
  const [selectedTripForBooking, setSelectedTripForBooking] = useState<Trip | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      const data = await tripService.getAll();
      setTrips(data);
      setLoading(false);
    };
    loadTrips();
  }, []);

  const cities = ['All', 'Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala', 'Matara', 'Jaffna'];

  const filteredTrips = trips.filter((t) => {
    if (origin !== 'All' && !t.startingLocation.toLowerCase().includes(origin.toLowerCase())) return false;
    if (destination !== 'All' && !t.destination.toLowerCase().includes(destination.toLowerCase())) return false;
    if (vehicleType !== 'All' && t.vehicleType !== vehicleType) return false;
    if (t.ticketPriceLkr > maxPrice) return false;
    if (timeFilter === 'Morning' && new Date(t.departureDateTime).getHours() >= 12) return false;
    if (timeFilter === 'Afternoon' && (new Date(t.departureDateTime).getHours() < 12 || new Date(t.departureDateTime).getHours() >= 18)) return false;
    if (timeFilter === 'Evening' && new Date(t.departureDateTime).getHours() < 18) return false;
    return true;
  });

  const handleSeatConfirmed = (trip: Trip, seats: string[]) => {
    navigate('/checkout', {
      state: {
        trip,
        seats,
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Find Scheduled Intercity & Expressway Trips
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time seat availability across Sri Lankan coach and executive van dispatches
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">From (Origin)</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">To (Destination)</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="All">All Vehicles</option>
            <option value="Luxury Coach">Luxury Coach</option>
            <option value="Bus">Bus</option>
            <option value="Van">Executive Van</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Departure Time</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="All">Any Time</option>
            <option value="Morning">Morning (Before 12 PM)</option>
            <option value="Afternoon">Afternoon (12 PM - 6 PM)</option>
            <option value="Evening">Evening / Night (After 6 PM)</option>
          </select>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
            <span>Max Fare:</span>
            <span className="text-teal-400 font-mono">LKR {maxPrice}</span>
          </div>
          <input
            type="range"
            min={500}
            max={5000}
            step={250}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full mt-2 accent-teal-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white font-mono">{filteredTrips.length}</strong> matching departures
        </span>
        <span className="font-mono text-teal-400">NTC Guaranteed Schedules</span>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Bus className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No departures match your filter</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting the destination or vehicle type filter.</p>
          </div>
        ) : (
          filteredTrips.map((trip) => {
            const isFull = trip.availableSeats === 0;

            return (
              <div
                key={trip.id}
                className="p-5 sm:p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Trip Departure / Arrival Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                      {trip.vehicleType} · {trip.vehicleReg}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Captain: {trip.driverName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{trip.routeName}</h3>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Departure</span>
                      <span className="text-sm font-bold text-white">
                        {formatTime(trip.departureDateTime)}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-sans">
                        {trip.startingLocation}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <span className="text-[10px] text-slate-500">Expressway</span>
                      <div className="w-20 sm:w-28 h-0.5 bg-slate-700 relative my-1">
                        <div className="w-2 h-2 rounded-full bg-teal-400 absolute right-0 -top-[3px]"></div>
                      </div>
                      <span className="text-[10px] text-teal-400">Non-Stop</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Est. Arrival</span>
                      <span className="text-sm font-bold text-white">
                        {formatTime(trip.estimatedArrivalDateTime)}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-sans">
                        {trip.destination}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">PER SEAT FARE</span>
                    <span className="text-xl font-black text-teal-400 font-mono">
                      {formatLKR(trip.ticketPriceLkr)}
                    </span>
                    <span
                      className={`text-[11px] font-mono block ${
                        trip.availableSeats <= 5 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {trip.availableSeats} seats remaining
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      Trip Details
                    </button>

                    <button
                      disabled={isFull}
                      onClick={() => setSelectedTripForBooking(trip)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isFull
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-md hover:shadow-teal-500/20'
                      }`}
                    >
                      <span>{isFull ? 'Sold Out' : 'Select Seats'}</span>
                      {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Seat Layout Selection Modal */}
      {selectedTripForBooking && (
        <SeatLayoutModal
          isOpen={!!selectedTripForBooking}
          onClose={() => setSelectedTripForBooking(null)}
          trip={selectedTripForBooking}
          onConfirmSeats={handleSeatConfirmed}
        />
      )}
    </div>
  );
};
