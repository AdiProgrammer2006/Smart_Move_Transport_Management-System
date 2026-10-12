import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { Modal } from '../../components/common/Modal';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Announcement | null;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Announcement['category']>('Important Transport Notice');
  const [priority, setPriority] = useState<Announcement['priority']>('Normal');
  const [affectedRoutesStr, setAffectedRoutesStr] = useState('Colombo ↔ Kandy (E02)');
  const [message, setMessage] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setPriority(initialData.priority);
      setAffectedRoutesStr(initialData.affectedRoutes.join(', '));
      setMessage(initialData.message);
      setValidUntil(initialData.validUntil);
    } else {
      setTitle('');
      setCategory('Important Transport Notice');
      setPriority('Normal');
      setAffectedRoutesStr('All Corridors');
      setMessage('');
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setValidUntil(d.toISOString().slice(0, 10));
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const routesList = affectedRoutesStr
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      await onSubmit({
        title,
        category,
        priority,
        affectedRoutes: routesList,
        message,
        validUntil,
        active: true,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Travel Bulletin' : 'Broadcast Passenger Travel Notice'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Bulletin Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Southern Expressway Resurfacing Advisory"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Important Transport Notice">Important Transport Notice</option>
                <option value="Trip Delay">Trip Delay</option>
                <option value="Service Cancellation">Service Cancellation</option>
                <option value="Expressway Update">Expressway Update</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Priority Alert Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Affected Corridors (comma-separated)</label>
            <input
              type="text"
              required
              value={affectedRoutesStr}
              onChange={(e) => setAffectedRoutesStr(e.target.value)}
              placeholder="Colombo ↔ Kandy, Colombo ↔ Galle"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Notice Content / Instructions</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide exact departure instructions or weather advisories for commuters..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Valid Until Date</label>
            <input
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-xs font-bold text-slate-950 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Broadcast Bulletin'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
