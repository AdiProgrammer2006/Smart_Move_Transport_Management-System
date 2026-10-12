import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  Search,
  ShieldCheck,
  Clock,
  Wifi,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_ROUTES, MOCK_VEHICLES, coachImage, vanImage, terminalImage } from '../../mockData';
import { formatLKR } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Colombo');
  const [destination, setDestination] = useState('Kandy');
  const [travelDate, setTravelDate] = useState('2026-10-12');
  const [passengers, setPassengers] = useState('1');

  const sriLankanCities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Kurunegala', 'Matara', 'Jaffna'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search-trips?origin=${origin}&destination=${destination}&date=${travelDate}&passengers=${passengers}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={terminalImage}
            alt="SmartMove Smart Transit Hub"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40"></div>
        </div>

        <div className="relative z-10 px-6 sm:px-12 py-16 sm:py-24 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Lanka's Next-Gen Passenger Transportation Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight text-balance">
            Move Smarter Across Sri Lanka with Guaranteed Comfort.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Premium intercity luxury coaches, expressway passenger vans, and corporate transport connecting Colombo, Kandy, Galle, Jaffna, and Katunayake International Airport.
          </p>

          {/* Search Card */}
          <form
            onSubmit={handleSearch}
            className="p-4 sm:p-5 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
          >
            {/* Origin */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                <span>Origin</span>
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {sriLankanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>Destination</span>
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {sriLankanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              />
            </div>

            {/* Passengers */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Users className="w-3 h-3 text-teal-400" />
                <span>Seats</span>
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Passenger{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Find Trips</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Routes Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Expressway Corridors
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              High-frequency non-stop routes running daily on Sri Lanka's expressway networks
            </p>
          </div>
          <button
            onClick={() => navigate('/search-trips')}
            className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 cursor-pointer"
          >
            <span>Explore All Corridors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MOCK_ROUTES.slice(0, 3).map((route) => (
            <div
              key={route.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-teal-400 font-bold bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded">
                    {route.distanceKm} KM EXPRESS
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    From {formatLKR(route.baseFareLkr)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  {route.routeName}
                </h3>

                <p className="text-xs text-slate-400">
                  Estimated Travel Duration: <strong className="text-slate-200">{route.estimatedDuration}</strong>
                </p>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div>Departure: {route.startingLocation}</div>
                  <div>Terminal: {route.destination}</div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/search-trips?origin=${route.startingLocation}&destination=${route.destination}`)}
                className="mt-5 w-full py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book This Corridor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Available Fleet Showcase */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Our Modern Transport Fleet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered for safety, passenger comfort, and zero environmental disruption
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-950">
              <img src={coachImage} alt="Volvo B11R Luxury Coach" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">Intercity Fleet</span>
                <h3 className="text-base font-bold text-white mt-1">Volvo B11R Grand Cruiser</h3>
                <p className="text-xs text-slate-400 mt-1">
                  45 reclining leather seats, individual USB ports, high-speed onboard 4G Wi-Fi, and dual-zone climate control.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
                <span>Capacity: 45 Seats</span>
                <span className="text-teal-300">Air Suspension</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-950">
              <img src={vanImage} alt="Executive Passenger Van" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Executive Shuttles</span>
                <h3 className="text-base font-bold text-white mt-1">Toyota HiAce High-Roof Commuter</h3>
                <p className="text-xs text-slate-400 mt-1">
                  14 captain seats, extra luggage hold, dedicated for corporate employee commute and airport transfers.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
                <span>Capacity: 14 Seats</span>
                <span className="text-blue-300">Expressway Fast</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-950">
              <img src={coachImage} alt="BYD Electric Express" className="w-full h-full object-cover" />
            </div>
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Green Mobility</span>
                <h3 className="text-base font-bold text-white mt-1">BYD K9 100% Electric Express</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Zero tailpipe emissions, silent electric powertrain, regenerative braking, reducing carbon footprint.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
                <span>Capacity: 40 Seats</span>
                <span className="text-emerald-300">Zero Emission</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SmartMove */}
      <section className="p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Commuters & Corporates Trust SmartMove
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Setting the highest benchmark for passenger transport in Sri Lanka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">98.2% On-Time Record</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict adherence to timetables with real-time GPS telemetry and corridor tracking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">NTC Certified Captains</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experienced commercial drivers with continuous safety scoring and defensive driving audits.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
              <Wifi className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Digital Boarding Passes</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant QR e-tickets on your smartphone, automated seat selection, and zero station queueing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Transparent LKR Pricing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fixed government-approved fares with student subsidies and corporate monthly invoicing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
