import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Bus,
  User,
  ShieldCheck,
} from 'lucide-react';
import { feedbackService } from '../../services';
import { FeedbackReview } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { FeedbackFormModal } from './FeedbackFormModal';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/formatters';

export const FeedbackListPage: React.FC = () => {
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    const data = await feedbackService.getAll();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleCreateReview = async (formData: any) => {
    await feedbackService.create(formData);
    showToast('Thank you! Your journey review has been recorded.', 'success');
    loadReviews();
  };

  const handleUpdateStatus = async (id: string, newStatus: FeedbackReview['status']) => {
    await feedbackService.updateStatus(id, newStatus);
    showToast(`Feedback status updated to ${newStatus}`, 'success');
    loadReviews();
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.tripName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.feedbackComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating =
      ratingFilter === 'ALL' || Math.floor(r.overallRating) === Number(ratingFilter);
    const matchesCategory =
      categoryFilter === 'ALL' || r.complaintCategory === categoryFilter;
    return matchesSearch && matchesRating && matchesCategory;
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const complaintsCount = reviews.filter((r) => r.complaintCategory && r.complaintCategory !== 'None').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-teal-400" />
            <span>Passenger Reviews & Quality Assurance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time commuter satisfaction, vehicle comfort audits, driver behavior ratings, and issue resolution
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Review</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Fleet Satisfaction Score</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">{avgRating}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400">Based on {reviews.length} authenticated commuter reviews</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Verified Reviews</span>
          <span className="text-3xl font-black text-white font-mono">{reviews.length}</span>
          <p className="text-[10px] text-slate-400">Submitted post-trip</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Quality Concerns / Complaints</span>
          <span className="text-3xl font-black text-teal-400 font-mono">{complaintsCount}</span>
          <p className="text-[10px] text-slate-400">Addressed by transport control room</p>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search reviews by keyword, passenger, driver, or route..."
        filters={[
          {
            label: 'Star Rating',
            value: ratingFilter,
            options: [
              { label: 'All Ratings', value: 'ALL' },
              { label: '5 Stars Only', value: '5' },
              { label: '4 Stars', value: '4' },
              { label: '3 Stars', value: '3' },
              { label: '1-2 Stars', value: '2' },
            ],
            onChange: setRatingFilter,
          },
          {
            label: 'Category',
            value: categoryFilter,
            options: [
              { label: 'All Feedback', value: 'ALL' },
              { label: 'Compliments / None', value: 'None' },
              { label: 'Delay', value: 'Delay' },
              { label: 'AC / Comfort', value: 'AC / Comfort' },
              { label: 'Driver Behavior', value: 'Driver Behavior' },
              { label: 'Cleanliness', value: 'Cleanliness' },
            ],
            onChange: setCategoryFilter,
          },
        ]}
      />

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-400 text-xs">
            No passenger feedback matches the selected filters.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{r.passengerName}</span>
                    <span className="text-xs text-slate-500 font-mono">·</span>
                    <span className="text-xs text-slate-400 font-mono">{formatDate(r.reviewDate)}</span>
                    <StatusBadge status={r.status} />
                    {r.complaintCategory && r.complaintCategory !== 'None' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {r.complaintCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-teal-300 font-semibold">{r.tripName}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-mono font-black text-white text-base">
                        {r.overallRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Vehicle: {r.vehicleRating}★</span>
                      <span>·</span>
                      <span>Captain: {r.driverRating}★</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                "{r.feedbackComment}"
              </p>

              {/* Footer specs & Moderation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-teal-400" />
                    <span>Asset: <strong className="text-slate-300">{r.vehicleReg}</strong></span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Captain: <strong className="text-slate-300">{r.driverName}</strong></span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {r.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Resolved')}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {r.status !== 'Published' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Published')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FeedbackFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateReview}
      />
    </div>
  );
};
