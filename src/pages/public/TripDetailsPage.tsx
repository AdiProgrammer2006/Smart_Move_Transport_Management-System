import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bus,
  Clock,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Users,
  CreditCard,
  Wifi,
} from 'lucide-react';
import { tripService, routeService, vehicleService, driverService } from '../../services';
import { Trip, Route, Vehicle, Driver } from '../../types';
import { formatLKR, formatDateTime, formatTime } from '../../utils/formatters';
import { SeatLayoutModal } from '../../components/booking/SeatLayoutModal';

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  useEffect(() => {
    const loadTripData = async () => {
      if (!id) return;
      setLoading(true);
      const tripData = await tripService.getById(id);
      if (tripData) {
        setTrip(tripData);
        const [routeData, vehicleData, driverData] = await Promise.all([
          routeService.getById(tripData.routeId),
          vehicleService.getById(tripData.vehicleId),
          driverService.getById(tripData.driverId),
        ]);
        setRoute(routeData || null);
        setVehicle(vehicleData || null);
        setDriver(driverData || null);
      }
      setLoading(false);
    };
    loadTripData();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading trip itinerary...</div>;
  }

  if (!trip) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-white">Trip Not Found</h2>
        <button
          onClick={() => navigate('/search-trips')}
          className="text-xs text-teal-400 underline font-semibold"
        >
          Return to Trips Search
        </button>
      </div>
    );
  }

  const handleSeatConfirmed = (tripToBook: Trip, seats: string[]) => {
    navigate('/checkout', {
      state: {
        trip: tripToBook,
        seats,
      },
    });
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Search</span>
      </button>

      {/* Main Banner */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                DISPATCH #{trip.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {trip.vehicleType} Express Service
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">{trip.routeName}</h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Ticket Fare</span>
            <span className="text-2xl font-black text-teal-400 font-mono">
              {formatLKR(trip.ticketPriceLkr)}
            </span>
            <span className="text-xs text-slate-400 block font-mono">
              {trip.availableSeats} of {trip.totalSeats} seats open
            </span>
          </div>
        </div>

        {/* Departure & Arrival Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500">Departure</span>
            <div className="text-lg font-bold text-white">{trip.startingLocation}</div>
            <div className="text-xs text-teal-300 font-mono">{formatDateTime(trip.departureDateTime)}</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500">Destination</span>
            <div className="text-lg font-bold text-white">{trip.destination}</div>
            <div className="text-xs text-blue-300 font-mono">{formatDateTime(trip.estimatedArrivalDateTime)}</div>
          </div>
        </div>
      </div>

      {/* Grid: Route Itinerary (7 cols) + Assigned Asset & Driver (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Route Intermediate Stops */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Route Stops & Timetable</h3>
            <p className="text-xs text-slate-400">Scheduled passenger pick-up and drop-off waypoints</p>
          </div>

          <div className="space-y-4">
            {route?.stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-start gap-3.5">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-teal-500/10 border border-teal-500/40 text-teal-300 flex items-center justify-center font-mono text-xs font-bold">
                    {idx + 1}
                  </div>
                  {idx < route.stops.length - 1 && (
                    <div className="w-0.5 h-12 bg-slate-800 my-1"></div>
                  )}
                </div>

                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{stop.stopName}</span>
                    <span className="font-mono text-[11px] text-teal-400">+{stop.durationFromStartMins} min</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {stop.distanceFromStartKm} km from terminal · Fare: {formatLKR(stop.fareFromStartLkr || trip.ticketPriceLkr)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Vehicle & Driver */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vehicle Spec */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fleet Vehicle</h3>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white">{vehicle?.model}</h4>
                  <span className="text-xs text-slate-400">{vehicle?.brand} · {vehicle?.manufactureYear}</span>
                </div>
                <span className="font-mono text-xs font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {vehicle?.registrationNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <div>Capacity: {vehicle?.seatingCapacity} Seats</div>
                <div>Fuel: {vehicle?.fuelType}</div>
              </div>
            </div>
          </div>

          {/* Captain Spec */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assigned Driver Captain</h3>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  {driver?.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{driver?.fullName}</h4>
                  <span className="text-[11px] text-teal-400 font-mono">Safety Rating: ★ {driver?.safetyRating}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800 font-mono">
                <div>License: {driver?.licenseNumber}</div>
                <div>Experience: {driver?.yearsExperience} years on intercity corridors</div>
              </div>
            </div>
          </div>

          {/* Book CTA */}
          <button
            onClick={() => setSeatModalOpen(true)}
            className="w-full py-3.5 rounded-2xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all shadow-xl hover:shadow-teal-500/20 cursor-pointer"
          >
            Select Seats & Book This Trip
          </button>
        </div>
      </div>

      {/* Seat Selection Modal */}
      <SeatLayoutModal
        isOpen={seatModalOpen}
        onClose={() => setSeatModalOpen(false)}
        trip={trip}
        onConfirmSeats={handleSeatConfirmed}
      />
    </div>
  );
};
