import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">SmartMove</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sri Lanka's leading passenger transportation management platform providing scheduled intercity coaches, expressway transit, and corporate employee mobility.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>NTC Approved & ISO 9001 Certified</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mobility Solutions</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="hover:text-teal-300 transition-colors">Daily Commuter Shuttles</Link></li>
              <li><Link to="/services" className="hover:text-teal-300 transition-colors">Corporate Employee Transit</Link></li>
              <li><Link to="/services" className="hover:text-teal-300 transition-colors">Special Event Charters</Link></li>
              <li><Link to="/search-trips" className="hover:text-teal-300 transition-colors">Expressway Fast Travel</Link></li>
              <li><Link to="/services" className="hover:text-teal-300 transition-colors">Airport Express Shuttles</Link></li>
            </ul>
          </div>

          {/* Col 3: Key Sri Lankan Routes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Popular Corridors</h4>
            <ul className="space-y-2">
              <li><Link to="/search-trips?origin=Colombo&destination=Kandy" className="hover:text-teal-300 transition-colors">Colombo ↔ Kandy (E02/A1)</Link></li>
              <li><Link to="/search-trips?origin=Colombo&destination=Galle" className="hover:text-teal-300 transition-colors">Colombo ↔ Galle (E01)</Link></li>
              <li><Link to="/search-trips?origin=Colombo&destination=Negombo" className="hover:text-teal-300 transition-colors">Colombo ↔ BIA Airport (E03)</Link></li>
              <li><Link to="/search-trips?origin=Colombo&destination=Matara" className="hover:text-teal-300 transition-colors">Colombo ↔ Matara (E01)</Link></li>
              <li><Link to="/search-trips?origin=Colombo&destination=Jaffna" className="hover:text-teal-300 transition-colors">Colombo ↔ Jaffna Intercity</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Terminals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Terminals</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Bastian Mawatha Terminal & Makumbura Hub, Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+94 11 234 5678 / +94 77 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@smartmove.lk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} SmartMove Transport Solutions (Pvt) Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link to="/about" className="hover:text-slate-300">Privacy Policy</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-slate-300">Terms of Transport</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-slate-300">Passenger Charter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
