import React, { useState } from 'react';
import { FeedbackReview } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Star } from 'lucide-react';

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [tripName, setTripName] = useState('Colombo ↔ Kandy Expressway Superline');
  const [passengerName, setPassengerName] = useState('Kasun Perera');
  const [vehicleReg, setVehicleReg] = useState('WP ND-4521');
  const [driverName, setDriverName] = useState('Bandara Jayasinghe');
  const [vehicleRating, setVehicleRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<FeedbackReview['complaintCategory']>('None');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const overallRating = Math.round(((vehicleRating + driverRating) / 2) * 10) / 10;
      await onSubmit({
        tripId: 'trp-101',
        tripName,
        passengerId: 'p-1',
        passengerName,
        vehicleId: 'veh-1',
        vehicleReg,
        driverId: 'drv-1',
        driverName,
        vehicleRating,
        driverRating,
        overallRating,
        feedbackComment,
        complaintCategory,
        status: 'Published',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Passenger Feedback & Review" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Trip Corridor</label>
            <input
              type="text"
              required
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Vehicle Comfort (1-5)</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setVehicleRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= vehicleRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Driver Behavior (1-5)</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDriverRating(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= driverRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Feedback Category / Concern</label>
            <select
              value={complaintCategory}
              onChange={(e) => setComplaintCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="None">None (Praise / General Experience)</option>
              <option value="Delay">Delay / Departure Timings</option>
              <option value="AC / Comfort">Air Conditioning / Cabin Temperature</option>
              <option value="Driver Behavior">Driver Behavior / Safety</option>
              <option value="Cleanliness">Cleanliness / Sanitization</option>
              <option value="Ticketing">Ticketing / QR Issue</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Passenger Review Comment</label>
            <textarea
              rows={3}
              required
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Describe your travel journey with SmartMove..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
            {isSubmitting ? 'Submitting...' : 'Post Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
