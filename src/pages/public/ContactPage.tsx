import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Thank you ${name}! Your inquiry regarding "${subject}" has been submitted. Our team will get back to you shortly.`, 'success');
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-6">
        <span className="text-xs font-mono uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full font-bold">
          24/7 Operations Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Get in Touch with SmartMove
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Need assistance with a ticket booking, corporate charter, lost baggage, or terminal directions? Our support coordinators are on duty around the clock.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info & Terminals (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
            <h3 className="text-base font-bold text-white">Central Operations Hotline</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">24/7 RESERVATIONS & DISPATCH</span>
                  <div className="text-white font-bold text-sm">+94 11 234 5678</div>
                  <div className="text-slate-400">+94 77 123 4567 (WhatsApp Dispatch)</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">EMAIL INQUIRIES</span>
                  <div className="text-white font-bold">support@smartmove.lk</div>
                  <div className="text-slate-400">corporate@smartmove.lk</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px]">TERMINAL HOURS</span>
                  <div className="text-white font-bold">04:30 AM – 11:30 PM (Daily)</div>
                  <div className="text-slate-400">Night coaches operated 24 hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Terminal Hubs in Sri Lanka */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sri Lankan Terminal Hubs</h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Colombo Bastian Mawatha Terminal</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Counter #04 & Express Bay A3/A4, Pettah, Colombo 11</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Makumbura Multimodal Transport Hub</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Platform Bay 7, Southern Expressway Interchange, Kottawa</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Kandy Goods Shed Terminal</div>
                <div className="text-slate-400 text-[11px] mt-0.5">SmartMove Lounge, Goods Shed Road, Kandy Central</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-400 mt-1">We respond to passenger messages within 1-2 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ruwan Weerasinghe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ruwan@example.lk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 000 0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">Subject / Inquiry Type</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Colombo to Galle Ticket Reschedule"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Your Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question, booking reference number, or feedback..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
