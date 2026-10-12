import React, { useState } from 'react';
import { MONGO_DEMO_QUERIES } from '../data/mongoQueries';
import {
  MONGO_VEHICLE_DOCS,
  MONGO_DYNAMIC_REVIEWS,
  MONGO_ANNOUNCEMENTS,
  MONGO_COMMUNITY_POSTS,
  MONGO_TRIP_TELEMETRY,
} from '../data/seedData';
import { MongoCommunityPost } from '../data/relationalTypes';
import {
  Database,
  Code2,
  Play,
  FileText,
  Search,
  MessageSquare,
  Radio,
  FileCheck,
  ShieldCheck,
  ThumbsUp,
  Send,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const MongoDbHubView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'DEMO_QUERIES' | 'VEHICLE_DOCS' | 'ANNOUNCEMENTS' | 'COMMUNITY_FORUM' | 'RAW_DOCUMENTS'>('DEMO_QUERIES');
  const [selectedQueryId, setSelectedQueryId] = useState<string>('mongo_query_1_route_reviews');
  const [queryState, setQueryState] = useState<Record<string, any>>({});
  const [queryResult, setQueryResult] = useState<any>(null);
  const [hasRun, setHasRun] = useState<boolean>(false);

  // Community Forum State
  const [posts, setPosts] = useState<MongoCommunityPost[]>(MONGO_COMMUNITY_POSTS);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [activeForumCategory, setActiveForumCategory] = useState<string>('ALL');

  // Raw collection selector
  const [selectedCollection, setSelectedCollection] = useState<string>('passenger_reviews_dynamic');

  const currentQuery = MONGO_DEMO_QUERIES.find((q) => q.id === selectedQueryId) || MONGO_DEMO_QUERIES[0];

  // Initialize query parameters on query switch
  const handleSelectQuery = (id: string) => {
    setSelectedQueryId(id);
    const q = MONGO_DEMO_QUERIES.find((item) => item.id === id);
    const initialParams: Record<string, any> = {};
    q?.paramInputs?.forEach((input) => {
      initialParams[input.name] = input.defaultValue;
    });
    setQueryState(initialParams);
    setQueryResult(q ? q.execute(initialParams) : null);
    setHasRun(true);
  };

  const handleRunQuery = () => {
    const res = currentQuery.execute(queryState);
    setQueryResult(res);
    setHasRun(true);
  };

  const handleLikePost = (postId: any) => {
    setPosts((prev) =>
      prev.map((p) => (String(p.post_id || p._id) === String(postId) ? { ...p, likes_count: p.likes_count + 1 } : p))
    );
  };

  const handleAddComment = (postId: any) => {
    const text = newCommentText[String(postId)]?.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (String(p.post_id || p._id) === String(postId)) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                comment_id: `c_${Date.now()}`,
                author: 'Campus Commuter (You)',
                role: 'Student',
                comment: text,
                created_at: new Date().toISOString(),
              },
            ],
          };
        }
        return p;
      })
    );

    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* MongoDB Architecture Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              MongoDB NoSQL Complementary Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Schema-flexible document store for vehicle compliance multimedia, real-time bulletins, and dynamic community forums.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg flex-wrap">
          <button
            onClick={() => {
              setActiveSection('DEMO_QUERIES');
              if (!hasRun) handleSelectQuery(selectedQueryId);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSection === 'DEMO_QUERIES'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4 Demo MQL Queries
          </button>
          <button
            onClick={() => setActiveSection('VEHICLE_DOCS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSection === 'VEHICLE_DOCS'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vehicle Documents & Media
          </button>
          <button
            onClick={() => setActiveSection('ANNOUNCEMENTS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSection === 'ANNOUNCEMENTS'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Travel Announcements
          </button>
          <button
            onClick={() => setActiveSection('COMMUNITY_FORUM')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSection === 'COMMUNITY_FORUM'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student & Instructor Forum
          </button>
          <button
            onClick={() => setActiveSection('RAW_DOCUMENTS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSection === 'RAW_DOCUMENTS'
                ? 'bg-slate-800 text-teal-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BSON Inspector
          </button>
        </div>
      </div>

      {/* SECTION 1: THE 4 MANDATORY DEMO QUERIES */}
      {activeSection === 'DEMO_QUERIES' && (
        <div className="space-y-6">
          {/* Query Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {MONGO_DEMO_QUERIES.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuery(q.id)}
                className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                  selectedQueryId === q.id
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  MQL QUERY 0{idx + 1}
                </div>
                <div className="text-xs font-semibold text-white line-clamp-1">{q.title.split(': ')[1]}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">coll: {q.targetCollection}</div>
              </button>
            ))}
          </div>

          {/* Query Interactive Execution Frame */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{currentQuery.title}</h3>
                <p className="text-xs text-slate-400">{currentQuery.description}</p>
              </div>
              <button
                onClick={handleRunQuery}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute MQL Query</span>
              </button>
            </div>

            {/* Parameter Inputs Strip */}
            {currentQuery.paramInputs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuery.paramInputs.map((input) => (
                  <div key={input.name} className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">{input.label}</label>
                    {input.type === 'select' ? (
                      <select
                        value={queryState[input.name] ?? input.defaultValue}
                        onChange={(e) => setQueryState({ ...queryState, [input.name]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                      >
                        {input.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={queryState[input.name] ?? input.defaultValue}
                        onChange={(e) => setQueryState({ ...queryState, [input.name]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* MQL Code Block */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                MongoDB Query Language (MQL) Pipeline:
              </span>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {currentQuery.mqlCode}
              </pre>
            </div>
          </div>

          {/* Results Presentation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">
                Query Results ({Array.isArray(queryResult) ? queryResult.length : 1} Documents Matched)
              </span>
              <span className="font-mono text-emerald-400 text-[11px]">Execution Latency: 2.4ms (Indexed Scan)</span>
            </div>

            {/* Query 1 Specific Results (Reviews) */}
            {selectedQueryId === 'mongo_query_1_route_reviews' && Array.isArray(queryResult) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {queryResult.map((rev: any) => (
                  <div key={rev._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{rev.passenger_name}</span>
                        <span className="text-[10px] text-teal-400 font-mono">{rev.passenger_tier}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold font-mono text-sm">★ {rev.overall_rating}</span>
                        <span className="text-[10px] text-slate-500 block">{rev.timestamp.split('T')[0]}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.feedback_text}"</p>

                    {/* Unstructured Sentiment Tags */}
                    <div className="flex flex-wrap gap-1">
                      {rev.sentiment_tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Operator response if available */}
                    {rev.operator_response && (
                      <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px]">
                        <span className="font-semibold text-teal-400 block">{rev.operator_response.responded_by}:</span>
                        <span className="text-slate-300">{rev.operator_response.message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Query 2 Specific Results (Aggregated Ratings) */}
            {selectedQueryId === 'mongo_query_2_highest_rated' && Array.isArray(queryResult) && (
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                    <tr>
                      <th className="p-3">RANK</th>
                      <th className="p-3">ENTITY TARGET</th>
                      <th className="p-3 text-right">AVG OVERALL SCORE</th>
                      <th className="p-3 text-right">CLEANLINESS</th>
                      <th className="p-3 text-right">PUNCTUALITY</th>
                      <th className="p-3 text-right">REVIEWS COUNT</th>
                      <th className="p-3 text-right">UPVOTES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {queryResult.map((item: any, idx: number) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                        <td className="p-3 text-white font-semibold">{item.target_name}</td>
                        <td className="p-3 text-right font-mono text-amber-400 font-bold tabular-nums">
                          ★ {item.avg_overall_rating.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono text-teal-300 tabular-nums">{item.avg_cleanliness.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-emerald-300 tabular-nums">{item.avg_punctuality.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-slate-300 tabular-nums">{item.total_reviews}</td>
                        <td className="p-3 text-right font-mono text-indigo-400 font-bold tabular-nums">+{item.community_upvotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Query 3 Specific Results (Complaints & Keyword Search) */}
            {selectedQueryId === 'mongo_query_3_keyword_search' && Array.isArray(queryResult) && (
              <div className="space-y-3">
                {queryResult.map((item: any) => (
                  <div key={item._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.passenger_name}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          item.complaint_status === 'IN_PROGRESS'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {item.complaint_status || 'NOMINAL'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{item.feedback_text}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span>Sentiment: <strong className="text-teal-400">{item.sentiment_tags.join(', ')}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Query 4 Specific Results (Vehicle Docs & Multimedia) */}
            {selectedQueryId === 'mongo_query_4_vehicle_documents' && Array.isArray(queryResult) && (
              <div className="space-y-4">
                {queryResult.map((doc: any) => (
                  <div key={doc._id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-xs text-slate-400 block font-mono">BSON ID: {doc._id}</span>
                        <h4 className="text-sm font-bold text-white">{doc.registration_no} Fleet Compliance Dossier</h4>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Fully Certified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Insurance Policy */}
                      <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                        <span className="text-slate-400 font-semibold block">Commercial Insurance Policy</span>
                        <div className="text-white font-bold">{doc.compliance_docs.insurance_policy.provider}</div>
                        <div className="font-mono text-slate-400 text-[11px]">
                          Policy #{doc.compliance_docs.insurance_policy.policy_no}
                        </div>
                        <div className="text-[11px] text-teal-400">
                          Valid Through: {doc.compliance_docs.insurance_policy.expiry_date}
                        </div>
                      </div>

                      {/* Roadworthiness Cert */}
                      <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                        <span className="text-slate-400 font-semibold block">Roadworthiness Certificate</span>
                        <div className="text-white font-bold">{doc.compliance_docs.roadworthiness_cert.inspection_station}</div>
                        <div className="font-mono text-slate-400 text-[11px]">
                          Cert #{doc.compliance_docs.roadworthiness_cert.cert_number}
                        </div>
                        <div className="text-[11px] text-teal-400">
                          Emissions Passed: {doc.compliance_docs.roadworthiness_cert.emissions_passed ? 'YES (Level 1)' : 'PENDING'}
                        </div>
                      </div>
                    </div>

                    {/* Sensor Telemetry Dump */}
                    {doc.inspection_history && doc.inspection_history[0] && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-slate-400">Latest Inspection Sensor Dump:</span>
                        <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto">
                          {JSON.stringify(doc.inspection_history[0].sensor_telemetry_dump, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: VEHICLE DOCUMENTS & MEDIA GALLERY */}
      {activeSection === 'VEHICLE_DOCS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MONGO_VEHICLE_DOCS.map((doc) => (
            <div key={doc._id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white">{doc.registration_no}</h4>
                  <span className="text-[10px] font-mono text-slate-400">Vehicle ID #{doc.vehicle_id}</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  VERIFIED
                </span>
              </div>

              {/* Vehicle Photo Slot */}
              <div className="relative rounded-lg overflow-hidden h-44 bg-slate-950 border border-slate-800">
                <img
                  src={doc.multimedia_gallery.exterior_360_url}
                  alt={doc.registration_no}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-slate-200">
                  360° Inspection Ready
                </div>
              </div>

              {/* Compliance Badges */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
                  <span className="text-slate-400">Insurance Carrier:</span>
                  <span className="text-white font-medium">{doc.compliance_docs.insurance_policy.provider}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
                  <span className="text-slate-400">Inspection Station:</span>
                  <span className="text-white font-medium">{doc.compliance_docs.roadworthiness_cert.inspection_station}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 3: TRAVEL ANNOUNCEMENTS & NOTIFICATIONS */}
      {activeSection === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          {MONGO_ANNOUNCEMENTS.map((ann) => (
            <div
              key={ann._id}
              className={`p-5 rounded-xl border space-y-3 ${
                ann.priority === 'URGENT'
                  ? 'bg-rose-950/30 border-rose-800/70'
                  : ann.priority === 'HIGH'
                  ? 'bg-amber-950/30 border-amber-800/70'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ann.priority === 'URGENT' ? (
                    <Flame className="w-4 h-4 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-slate-300">
                  {ann.category.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Affected Routes: <strong className="text-teal-400 font-mono">{(ann.affected_routes || []).join(', ')}</strong></span>
                <span>Published by {ann.author} · {new Date(ann.published_at || ann.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: STUDENT & INSTRUCTOR COMMUNITY FORUM */}
      {activeSection === 'COMMUNITY_FORUM' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Campus & Commuter Community Forums</h3>
              <p className="text-xs text-slate-400">
                Interactive real-time discussion boards for students, faculty instructors, and daily commuters.
              </p>
            </div>
            <div className="flex gap-1.5 text-xs">
              {['ALL', 'CAMPUS_TRANSIT', 'LOST_AND_FOUND', 'CARPOOL_COORDINATION'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveForumCategory(cat)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    activeForumCategory === cat
                      ? 'bg-teal-400 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts
              .filter((p) => activeForumCategory === 'ALL' || p.category === activeForumCategory)
              .map((post) => (
                <div key={post.post_id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider block">
                        {post.category.replace(/_/g, ' ')} {post.route_code && `· Corridor ${post.route_code}`}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{post.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {post.author_role}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>

                  {/* Likes and stats */}
                  <div className="flex items-center gap-3 text-xs border-t border-slate-800 pt-3">
                    <button
                      onClick={() => handleLikePost(post.post_id)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-mono">{post.likes_count} Helpful</span>
                    </button>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">{post.comments.length} Comments</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">By {post.author_name}</span>
                  </div>

                  {/* Comments Thread */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                      {post.comments.map((comment: any) => (
                        <div key={comment.comment_id} className="text-xs space-y-0.5 border-b border-slate-900 last:border-0 pb-1.5 last:pb-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{comment.author} <span className="text-[10px] text-slate-500">({comment.role})</span></span>
                            <span className="text-[10px] text-slate-600 font-mono">
                              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Box */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Reply to this thread as a student or commuter..."
                      value={newCommentText[post.post_id] || ''}
                      onChange={(e) => setNewCommentText({ ...newCommentText, [post.post_id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.post_id);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                    <button
                      onClick={() => handleAddComment(post.post_id)}
                      className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 5: BSON DOCUMENT INSPECTOR */}
      {activeSection === 'RAW_DOCUMENTS' && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">MongoDB Collection BSON Document Inspector</h3>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
            >
              <option value="passenger_reviews_dynamic">db.passenger_reviews_dynamic (6 docs)</option>
              <option value="vehicle_documents_media">db.vehicle_documents_media (4 docs)</option>
              <option value="travel_announcements">db.travel_announcements (3 docs)</option>
              <option value="community_forums">db.community_forums (3 docs)</option>
              <option value="trip_telemetry">db.trip_telemetry (2 docs)</option>
            </select>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px]">
            {JSON.stringify(
              selectedCollection === 'passenger_reviews_dynamic'
                ? MONGO_DYNAMIC_REVIEWS
                : selectedCollection === 'vehicle_documents_media'
                ? MONGO_VEHICLE_DOCS
                : selectedCollection === 'travel_announcements'
                ? MONGO_ANNOUNCEMENTS
                : selectedCollection === 'community_forums'
                ? posts
                : MONGO_TRIP_TELEMETRY,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
