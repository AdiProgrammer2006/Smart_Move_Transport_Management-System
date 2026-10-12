import React, { useState } from 'react';
import { Vehicle, Driver, TransportRoute } from '../data/relationalTypes';
import { Bus, User, MapPin, Gauge, Shield, Wrench, Fuel, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fleetCoachImg, fleetVanImg } from '../data/seedData';

interface FleetManagementViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: TransportRoute[];
}

export const FleetManagementView: React.FC<FleetManagementViewProps> = ({
  vehicles,
  drivers,
  routes,
}) => {
  const [subTab, setSubTab] = useState<'VEHICLES' | 'DRIVERS' | 'ROUTES'>('VEHICLES');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [selectedRouteId, setSelectedRouteId] = useState<number>(routes[0]?.route_id || 301);

  const filteredVehicles = vehicleFilter === 'ALL'
    ? vehicles
    : vehicles.filter((v) => v.vehicle_type === vehicleFilter);

  const selectedRoute = routes.find((r) => r.route_id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fleet, Captains & Corridor Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational registry of transportation assets, licensed commercial drivers, and timetabled stops.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setSubTab('VEHICLES')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              subTab === 'VEHICLES'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fleet Assets ({vehicles.length})
          </button>
          <button
            onClick={() => setSubTab('DRIVERS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              subTab === 'DRIVERS'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Driver Captains ({drivers.length})
          </button>
          <button
            onClick={() => setSubTab('ROUTES')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              subTab === 'ROUTES'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transit Routes & Stops ({routes.length})
          </button>
        </div>
      </div>

      {/* 1. VEHICLES TAB */}
      {subTab === 'VEHICLES' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {[
                { id: 'ALL', label: 'All Fleet Assets' },
                { id: 'LUXURY_COACH', label: 'Luxury Coaches' },
                { id: 'ELECTRIC_EXPRESS', label: '100% Electric' },
                { id: 'EXECUTIVE_VAN', label: 'Executive Vans' },
                { id: 'DOUBLE_DECKER', label: 'Double Decker' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setVehicleFilter(filter.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    vehicleFilter === filter.id
                      ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-400">{filteredVehicles.length} Vehicles Displayed</span>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map((vehicle) => {
              const nextKm = vehicle.next_service_mileage_km || 100000;
              const kmToService = nextKm - vehicle.current_mileage_km;
              const isOverdue = vehicle.current_mileage_km >= nextKm;
              const assignedCaptain = drivers.find((d) => d.driver_id === vehicle.primary_driver_id);

              return (
                <div
                  key={vehicle.vehicle_id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  {/* Photo Banner */}
                  <div className="relative h-40 bg-slate-950 overflow-hidden">
                    <img
                      src={vehicle.image_url}
                      alt={vehicle.model_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold ${
                          vehicle.status === 'ACTIVE'
                            ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                            : vehicle.status === 'MAINTENANCE'
                            ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white">
                      {vehicle.registration_no}
                    </div>
                  </div>

                  {/* Vehicle Body Specs */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{vehicle.model_name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {vehicle.vehicle_type.replace('_', ' ')} · {vehicle.manufacture_year} Build
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">SEATING</span>
                        <span className="text-white font-bold">{vehicle.seating_capacity} Seats</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">POWERTRAIN</span>
                        <span className="text-teal-400 font-bold">{vehicle.fuel_type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">ODOMETER</span>
                        <span className="text-slate-200">{vehicle.current_mileage_km.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">NEXT SERVICE</span>
                        <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {isOverdue ? 'OVERDUE' : `${kmToService.toLocaleString()} km`}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Assigned Captain:</span>
                      <span className="text-white font-medium">{assignedCaptain?.full_name || 'Standby'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DRIVERS TAB */}
      {subTab === 'DRIVERS' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-3.5">CAPTAIN NAME</th>
                  <th className="p-3.5">LICENSE & CLASS</th>
                  <th className="p-3.5">CONTACT INFO</th>
                  <th className="p-3.5 text-right">EXPERIENCE</th>
                  <th className="p-3.5 text-right">SAFETY INDEX</th>
                  <th className="p-3.5 text-right">PASSENGER RATING</th>
                  <th className="p-3.5 text-right">TOTAL TRIPS</th>
                  <th className="p-3.5 text-center">DUTY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                {drivers.map((d) => (
                  <tr key={d.driver_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-white font-sans block">{d.full_name}</span>
                      <span className="text-[10px] text-slate-500">ID #{d.driver_id}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-teal-300 font-bold block">{d.license_number}</span>
                      <span className="text-[10px] text-slate-400">{d.license_class.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className="text-slate-300 block">{d.phone_number}</span>
                      <span className="text-[11px] text-slate-500">{d.email}</span>
                    </td>
                    <td className="p-3.5 text-right text-slate-300 tabular-nums">{d.years_experience} yrs</td>
                    <td className="p-3.5 text-right text-emerald-400 font-bold tabular-nums">{d.safety_score}/100</td>
                    <td className="p-3.5 text-right text-amber-400 font-bold tabular-nums">★ {d.rating.toFixed(2)}</td>
                    <td className="p-3.5 text-right text-white tabular-nums">{d.total_trips_completed}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          d.status === 'ON_DUTY'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : d.status === 'IN_TRANSIT'
                            ? 'bg-teal-950 text-teal-300 border border-teal-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ROUTES & STOPS TAB */}
      {subTab === 'ROUTES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Route selector list (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {routes.map((route) => (
              <button
                key={route.route_id}
                onClick={() => setSelectedRouteId(route.route_id)}
                className={`w-full p-4 text-left rounded-xl border transition-all cursor-pointer ${
                  selectedRouteId === route.route_id
                    ? 'bg-slate-900 border-teal-400 shadow-md ring-1 ring-teal-400/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="font-bold text-teal-400">{route.route_code}</span>
                  <span className="text-slate-400">{route.category.replace('_', ' ')}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{route.route_name}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
                  <span>Distance: {route.total_distance_km} km</span>
                  <span>Duration: {route.estimated_duration_mins} min</span>
                  <span className="text-emerald-400 font-bold">${route.base_fare.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Stops Itinerary Detail (7 cols) */}
          <div className="lg:col-span-7 p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="font-mono text-xs text-teal-400 font-bold">{selectedRoute.route_code} Itinerary</span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedRoute.route_name}</h3>
              <p className="text-xs text-slate-400">
                {selectedRoute.origin_city} → {selectedRoute.destination_city}
              </p>
            </div>

            <div className="space-y-3">
              {selectedRoute.stops.map((stop, idx) => (
                <div key={stop.stop_id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center font-mono text-[10px] font-bold text-teal-300">
                      {stop.stop_sequence}
                    </div>
                    {idx < selectedRoute.stops.length - 1 && (
                      <div className="w-0.5 h-10 bg-slate-800"></div>
                    )}
                  </div>

                  <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{stop.stop_name}</span>
                      <span className="font-mono text-[11px] text-teal-400">+{stop.duration_offset_mins} min</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Landmark: {stop.landmark} · {stop.distance_from_origin_km} km from origin
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
