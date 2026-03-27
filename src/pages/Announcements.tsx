import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import { Megaphone, Pin, Trash2, Plus, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  pinned: boolean;
  color: string;
  createdAt: string;
}

const COLORS = [
  { label: "Orange", value: "#F97316" },
  { label: "Blue",   value: "#3B82F6" },
  { label: "Green",  value: "#22C55E" },
  { label: "Red",    value: "#EF4444" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Yellow", value: "#EAB308" },
];

const STORAGE_KEY = "craziematez_announcements";

function load(): Announcement[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function save(items: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function Announcements() {
  const { data } = useDashboard();
  const [items, setItems] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [color, setColor] = useState("#F97316");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { setItems(load()); }, []);

  const members = data?.members.map(m => m.studio_name || m.display_name) ?? [];

  function post() {
    if (!title.trim() || !body.trim()) return;
    const next: Announcement[] = [
      {
        id: Date.now().toString(),
        title: title.trim(),
        body: body.trim(),
        author: author || "Studio",
        pinned: false,
        color,
        createdAt: new Date().toISOString(),
      },
      ...items,
    ];
    setItems(next); save(next);
    setTitle(""); setBody(""); setAuthor(""); setColor("#F97316");
    setShowForm(false);
  }

  function togglePin(id: string) {
    const next = items.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a);
    setItems(next); save(next);
  }

  function remove(id: string) {
    const next = items.filter(a => a.id !== id);
    setItems(next); save(next); setDeleteConfirm(null);
  }

  const pinned = items.filter(a => a.pinned);
  const regular = items.filter(a => !a.pinned);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Announcements</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {items.length} posts · {pinned.length} pinned
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #F97316, #FB923C)", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}
        >
          <Plus size={15} />
          New Post
        </button>
      </div>

      {/* Post form modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-[999]"
              style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} />
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="pointer-events-auto w-full max-w-lg rounded-3xl overflow-hidden relative"
                style={{ background: "#0f0f0f", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 32px 64px rgba(0,0,0,0.8)" }}
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ type: "spring", damping: 22, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 w-64 h-48 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 80% 0%, rgba(249,115,22,0.1), transparent 65%)" }} />

                <div className="flex items-center justify-between p-6 pb-4 relative z-10">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">New Announcement</p>
                    <h2 className="text-xl font-bold text-white">Post to Studio</h2>
                  </div>
                  <button onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-500 hover:bg-white/[0.1] transition-all">
                    <X size={12} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-3 relative z-10">
                  {/* Title */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5">Title *</p>
                    <input
                      value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Style Guide Updated"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/40 transition-colors"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5">Message *</p>
                    <textarea
                      value={body} onChange={e => setBody(e.target.value)}
                      placeholder="Write your announcement here..."
                      rows={3}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/40 transition-colors resize-none"
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1.5">Posted By</p>
                    <select value={author} onChange={e => setAuthor(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-neutral-300 outline-none focus:border-orange-500/40 transition-colors">
                      <option value="">Studio</option>
                      {members.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Label Color</p>
                    <div className="flex gap-2">
                      {COLORS.map(c => (
                        <button key={c.value} onClick={() => setColor(c.value)}
                          className="w-7 h-7 rounded-full transition-all"
                          style={{
                            background: c.value,
                            boxShadow: color === c.value ? `0 0 0 2px #0f0f0f, 0 0 0 4px ${c.value}` : "none",
                            transform: color === c.value ? "scale(1.2)" : "scale(1)",
                          }} />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={post}
                    disabled={!title.trim() || !body.trim()}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #F97316, #FB923C)" }}
                  >
                    Post Announcement
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-24">
          <Megaphone size={40} className="mx-auto mb-4 text-neutral-700" />
          <p className="text-neutral-500 text-sm">No announcements yet.</p>
          <p className="text-neutral-700 text-xs mt-1">Hit "New Post" to broadcast to the studio.</p>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin size={13} className="text-orange-500" />
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">Pinned</p>
          </div>
          {pinned.map((a, i) => (
            <AnnouncementCard key={a.id} item={a} index={i}
              onPin={() => togglePin(a.id)}
              onDelete={() => setDeleteConfirm(a.id)} />
          ))}
        </div>
      )}

      {/* Regular */}
      {regular.length > 0 && (
        <div className="space-y-3">
          {pinned.length > 0 && (
            <p className="text-[11px] uppercase tracking-widest text-neutral-600 font-semibold">Recent</p>
          )}
          {regular.map((a, i) => (
            <AnnouncementCard key={a.id} item={a} index={i}
              onPin={() => togglePin(a.id)}
              onDelete={() => setDeleteConfirm(a.id)} />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div className="fixed inset-0 z-[999]"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)} />
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="pointer-events-auto w-full max-w-sm rounded-2xl p-6 text-center"
                style={{ background: "#111", border: "1px solid rgba(239,68,68,0.2)" }}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 22, stiffness: 300 }}
              >
                <p className="text-2xl mb-3">🗑️</p>
                <p className="text-white font-semibold mb-1">Delete this post?</p>
                <p className="text-neutral-500 text-sm mb-5">This can't be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-neutral-400 text-sm font-medium hover:bg-white/[0.04] transition-all">
                    Cancel
                  </button>
                  <button onClick={() => remove(deleteConfirm)}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all">
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnnouncementCard({ item, index, onPin, onDelete }: {
  item: Announcement; index: number; onPin: () => void; onDelete: () => void;
}) {
  const dt = new Date(item.createdAt);
  const age = Math.floor((Date.now() - dt.getTime()) / 60000);
  const ageLabel = age < 60 ? `${age}m ago` : age < 1440 ? `${Math.floor(age / 60)}h ago`
    : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden group hover:border-white/[0.1] transition-all"
      style={{ borderLeftColor: `${item.color}40`, borderLeftWidth: 3 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
              <Megaphone size={15} style={{ color: item.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                {item.pinned && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono-jet"
                    style={{ color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                    PINNED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-neutral-600">{item.author}</span>
                <span className="text-neutral-700">·</span>
                <span className="text-[11px] text-neutral-700 font-mono-jet">{ageLabel}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={onPin}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
              title={item.pinned ? "Unpin" : "Pin"}>
              <Pin size={13} className={item.pinned ? "text-orange-400" : "text-neutral-600"} />
            </button>
            <button onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all">
              <Trash2 size={13} className="text-neutral-600 hover:text-red-400" />
            </button>
          </div>
        </div>

        <p className="text-[13px] text-neutral-400 leading-relaxed mt-3 pl-12">{item.body}</p>
      </div>
    </motion.div>
  );
}
