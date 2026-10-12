import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  Trash2,
  Edit2,
  ShieldAlert,
} from 'lucide-react';
import { announcementService } from '../../services';
import { Announcement } from '../../types';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AnnouncementFormModal } from './AnnouncementFormModal';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AnnouncementListPage: React.FC = () => {
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    setLoading(true);
    const data = await announcementService.getAll();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    if (editingAnnouncement) {
      await announcementService.update(editingAnnouncement.id, formData);
      showToast('Announcement bulletin updated successfully.', 'success');
    } else {
      await announcementService.create(formData);
      showToast('New travel announcement broadcasted across channels!', 'success');
    }
    setEditingAnnouncement(null);
    loadAnnouncements();
  };

  const handleToggleActive = async (announcement: Announcement) => {
    await announcementService.update(announcement.id, { active: !announcement.active });
    showToast(`Bulletin status set to ${!announcement.active ? 'Active' : 'Archived'}`, 'success');
    loadAnnouncements();
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await announcementService.delete(deleteId);
    showToast('Travel notice removed.', 'success');
    setDeleteId(null);
    loadAnnouncements();
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.affectedRoutes.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const urgentAlerts = announcements.filter((a) => a.active && a.priority === 'Urgent');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-teal-400" />
            <span>Travel Notices & Operational Bulletins</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish real-time traffic advisories, expressway delay warnings, and terminal boarding changes
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAnnouncement(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Bulletin</span>
        </button>
      </div>

      {/* Urgent Advisory Banner if any */}
      {urgentAlerts.length > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-2xl flex items-start gap-3 text-xs shadow-lg">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-300 uppercase tracking-wider block">
              Urgent Transit Advisory: {urgentAlerts[0].title}
            </span>
            <p className="text-slate-300 leading-relaxed">{urgentAlerts[0].message}</p>
            <p className="text-[10px] text-red-400 font-mono">
              Affected Corridors: {urgentAlerts[0].affectedRoutes.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search bulletins by title, message, or corridor..."
        filters={[
          {
            label: 'Priority',
            value: priorityFilter,
            options: [
              { label: 'All Priorities', value: 'ALL' },
              { label: 'Urgent Only', value: 'Urgent' },
              { label: 'High Priority', value: 'High' },
              { label: 'Normal Notices', value: 'Normal' },
            ],
            onChange: setPriorityFilter,
          },
        ]}
      />

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-400 text-xs">
            No bulletins found matching current filters.
          </div>
        ) : (
          filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`p-6 bg-slate-900 rounded-3xl border transition-colors space-y-4 shadow-xl ${
                !a.active
                  ? 'border-slate-800 opacity-60'
                  : a.priority === 'Urgent'
                  ? 'border-red-800/60'
                  : a.priority === 'High'
                  ? 'border-amber-800/60'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        a.priority === 'Urgent'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : a.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {a.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{a.category}</span>
                    <span className="text-slate-500 font-mono">·</span>
                    <span className="text-xs text-slate-400 font-mono">{formatDate(a.publishedDate)}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{a.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(a)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      a.active
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {a.active ? 'Active & Broadcasted' : 'Archived'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingAnnouncement(a);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer"
                    title="Edit Bulletin"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(a.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 cursor-pointer"
                    title="Delete Bulletin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {a.message}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>Affected Routes: <strong className="text-slate-300">{a.affectedRoutes.join(', ')}</strong></span>
                </div>
                <div className="font-mono text-[11px]">
                  Valid Until: {formatDate(a.validUntil)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnnouncementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingAnnouncement}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Travel Notice"
        message="Are you sure you want to permanently delete this broadcast bulletin?"
      />
    </div>
  );
};
