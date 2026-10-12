import React, { useState, useEffect } from 'react';
import {
  MessagesSquare,
  Plus,
  Heart,
  MessageCircle,
  Search,
  Tag,
  User,
  Send,
  Compass,
  Sparkles,
} from 'lucide-react';
import { communityService } from '../../services';
import { CommunityPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const CommunityForumPage: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('ALL');

  // New post modal
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRouteTag, setNewRouteTag] = useState('Colombo ↔ Kandy');

  // Reply inline states
  const [replyPostId, setReplyPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    const data = await communityService.getAll();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    await communityService.create({
      authorName: user?.name || 'Kasun Perera',
      authorRole: role,
      routeTag: newRouteTag,
      title: newTitle,
      content: newContent,
    });

    showToast('Your question has been posted to the commuter forum!', 'success');
    setIsNewPostModalOpen(false);
    setNewTitle('');
    setNewContent('');
    loadPosts();
  };

  const handleLike = async (post: CommunityPost) => {
    await communityService.updateLikes(post.id, post.likesCount + 1);
    loadPosts();
  };

  const handleAddReply = async (postId: string) => {
    if (!replyContent.trim()) return;

    await communityService.addReply(postId, {
      authorName: user?.name || 'SmartMove Commuter',
      authorRole: role,
      content: replyContent.trim(),
    });

    showToast('Reply added to thread.', 'success');
    setReplyContent('');
    setReplyPostId(null);
    loadPosts();
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = tagFilter === 'ALL' || p.routeTag === tagFilter;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessagesSquare className="w-7 h-7 text-teal-400" />
            <span>Commuter Hub & Interactive Travel Forum</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Community tips, expressway traffic discussions, lost & found, and student commute advice
          </p>
        </div>

        <button
          onClick={() => setIsNewPostModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Discussion</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions by topic, travel route, or keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
        </div>

        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
        >
          <option value="ALL">All Travel Corridors</option>
          <option value="Colombo ↔ Kandy">Colombo ↔ Kandy</option>
          <option value="Colombo ↔ Galle">Colombo ↔ Galle</option>
          <option value="Colombo ↔ Jaffna">Colombo ↔ Jaffna</option>
          <option value="Airport Shuttle">Airport Shuttle</option>
        </select>
      </div>

      {/* Posts Feed */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-400 text-xs">
            No discussions found matching your search.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl hover:border-slate-700 transition-colors"
            >
              {/* Post Author & Tag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{post.authorName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-teal-300">
                        {post.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                {post.routeTag && (
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>{post.routeTag}</span>
                  </span>
                )}
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-white tracking-tight">{post.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {post.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => handleLike(post)}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer group"
                >
                  <Heart className="w-4 h-4 group-hover:fill-red-400" />
                  <span className="font-mono font-bold">{post.likesCount} Helpful</span>
                </button>

                <button
                  onClick={() => setReplyPostId(replyPostId === post.id ? null : post.id)}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-mono">{post.replies?.length || 0} Replies</span>
                </button>
              </div>

              {/* Threaded Replies */}
              {post.replies && post.replies.length > 0 && (
                <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-slate-800 pt-2">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{reply.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Box */}
              {replyPostId === post.id && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a helpful response for fellow commuters..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                  <button
                    onClick={() => handleAddReply(post.id)}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Post Modal */}
      <Modal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        title="Start Commuter Discussion"
        size="md"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Discussion Topic</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Best morning departure time from Kandy to avoid Kadawatha rush?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Related Corridor Tag</label>
              <select
                value={newRouteTag}
                onChange={(e) => setNewRouteTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Colombo ↔ Kandy">Colombo ↔ Kandy</option>
                <option value="Colombo ↔ Galle">Colombo ↔ Galle</option>
                <option value="Colombo ↔ Jaffna">Colombo ↔ Jaffna</option>
                <option value="Airport Shuttle">Airport Shuttle</option>
                <option value="General Advice">General Advice</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Message Details</label>
              <textarea
                rows={4}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your experience or ask fellow commuters..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-xs font-bold text-slate-950 cursor-pointer"
            >
              Post Discussion
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
