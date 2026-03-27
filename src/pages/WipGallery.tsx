import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard, initials } from "@/hooks/use-dashboard";
import { Image, Film, Music, FileText, File, ExternalLink, Search, X, Grid, List } from "lucide-react";

function FileIcon({ type, size = 18 }: { type: string | null; size?: number }) {
  const t = type?.toLowerCase() || "";
  if (t.includes("image") || t.includes("png") || t.includes("jpg") || t.includes("gif") || t.includes("webp"))
    return <Image size={size} className="text-blue-400" />;
  if (t.includes("video") || t.includes("mp4") || t.includes("mov") || t.includes("avi"))
    return <Film size={size} className="text-purple-400" />;
  if (t.includes("audio") || t.includes("mp3") || t.includes("wav"))
    return <Music size={size} className="text-green-400" />;
  if (t.includes("text") || t.includes("doc") || t.includes("pdf"))
    return <FileText size={size} className="text-yellow-400" />;
  return <File size={size} className="text-neutral-500" />;
}

function typeColor(type: string | null) {
  const t = type?.toLowerCase() || "";
  if (t.includes("image") || t.includes("png") || t.includes("jpg")) return "#3B82F6";
  if (t.includes("video") || t.includes("mp4")) return "#8B5CF6";
  if (t.includes("audio") || t.includes("mp3")) return "#22C55E";
  if (t.includes("text") || t.includes("doc") || t.includes("pdf")) return "#EAB308";
  return "#555";
}

const ROLE_COLORS: Record<string, string> = {
  animator: "#F97316", editor: "#3B82F6", director: "#8B5CF6",
  writer: "#22C55E", composer: "#EAB308", designer: "#EC4899",
  artist: "#F97316", background: "#3B82F6", manager: "#8B5CF6",
};
function roleColor(role = "") {
  const r = role.toLowerCase();
  for (const [k, v] of Object.entries(ROLE_COLORS)) if (r.includes(k)) return v;
  return "#F97316";
}

function WipCard({ upload: u, index, onClick }: { upload: any; index: number; onClick: () => void }) {
  const tc = typeColor(u.file_type);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={onClick}
      className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer hover:border-white/[0.1] transition-all group"
    >
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${tc}, transparent)` }} />
      <div className="h-28 flex items-center justify-center relative" style={{ background: `${tc}08` }}>
        <FileIcon type={u.file_type} size={36} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
          style={{ background: `radial-gradient(circle at 50% 50%, ${tc}15, transparent 70%)` }} />
        {(u.file_url || u.link) && (
          <a href={u.file_url || u.link} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-neutral-500 hover:text-orange-400"
            style={{ background: "rgba(0,0,0,0.5)" }}>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
      <div className="p-3">
        <p className="font-mono-jet text-sm font-semibold text-white truncate">{u.scene}</p>
        <p className="text-[11px] text-neutral-600 mt-0.5 truncate">{u.member_name}</p>
        <div className="flex items-center justify-between mt-2">
          {u.file_type && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono-jet capitalize"
              style={{ color: tc, background: `${tc}18`, border: `1px solid ${tc}25` }}>
              {u.file_type.split("/").pop() || u.file_type}
            </span>
          )}
          <span className="text-[9px] text-neutral-700 font-mono-jet">{u.uploaded_at?.slice(0, 10)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function WipGallery() {
  const { data } = useDashboard();
  const [q, setQ] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<any>(null);

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const members = [...new Set(data.uploads.map(u => u.member_name))].sort();
  const types = [...new Set(data.uploads.map(u => u.file_type?.split("/")[0] || "other"))];

  const filtered = data.uploads.filter(u => {
    const ql = q.toLowerCase();
    if (q && !u.scene.toLowerCase().includes(ql) && !u.member_name.toLowerCase().includes(ql) && !(u.notes || "").toLowerCase().includes(ql)) return false;
    if (memberFilter !== "all" && u.member_name !== memberFilter) return false;
    if (typeFilter !== "all" && !(u.file_type || "").toLowerCase().includes(typeFilter)) return false;
    return true;
  });

  const byMember = members.reduce((acc, m) => {
    const uploads = filtered.filter(u => u.member_name === m);
    if (uploads.length) acc[m] = uploads;
    return acc;
  }, {} as Record<string, typeof data.uploads>);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">WIP Gallery</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{data.uploads.length} uploads · {members.length} contributors</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView("grid")}
            className={`p-2 rounded-xl border transition-all ${view === "grid" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" : "bg-[#111] border-white/[0.06] text-neutral-600"}`}>
            <Grid size={14} />
          </button>
          <button onClick={() => setView("list")}
            className={`p-2 rounded-xl border transition-all ${view === "list" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" : "bg-[#111] border-white/[0.06] text-neutral-600"}`}>
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2">
          <Search size={13} className="text-neutral-600" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search scenes, members..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-44" />
          {q && <button onClick={() => setQ("")}><X size={12} className="text-neutral-600 hover:text-neutral-400" /></button>}
        </div>
        <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)}
          className="bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-neutral-400 outline-none">
          <option value="all">All Members</option>
          {members.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...types].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`text-[11px] px-3 py-1.5 rounded-xl border capitalize transition-all ${typeFilter === t
                ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                : "bg-[#111] border-white/[0.06] text-neutral-500 hover:text-neutral-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Uploads", value: data.uploads.length, color: "#F97316" },
          { label: "Filtered", value: filtered.length, color: "#3B82F6" },
          { label: "Contributors", value: Object.keys(byMember).length, color: "#8B5CF6" },
          { label: "File Types", value: types.length, color: "#22C55E" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p className="text-4xl mb-3">📂</p>
          <p>No uploads found</p>
        </div>
      ) : view === "grid" ? (
        <div className="space-y-6">
          {memberFilter === "all" ? Object.entries(byMember).map(([member, uploads]) => {
            const m = data.members.find(m => m.display_name === member || m.studio_name === member);
            const rc = roleColor(m?.role_desc || "");
            return (
              <div key={member}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${rc}, ${rc}aa)` }}>
                    {initials(member)}
                  </div>
                  <span className="text-sm font-semibold text-neutral-300">{member}</span>
                  {m?.role_desc && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono-jet"
                      style={{ color: rc, background: `${rc}18`, border: `1px solid ${rc}30` }}>{m.role_desc}</span>
                  )}
                  <span className="text-[11px] text-neutral-600 font-mono-jet">{uploads.length} files</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {uploads.map((u, i) => <WipCard key={u.id} upload={u} index={i} onClick={() => setSelected(u)} />)}
                </div>
              </div>
            );
          }) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((u, i) => <WipCard key={u.id} upload={u} index={i} onClick={() => setSelected(u)} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u, i) => {
            const tc = typeColor(u.file_type);
            return (
              <motion.div key={u.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                onClick={() => setSelected(u)}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 hover:border-white/[0.1] cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tc}15`, border: `1px solid ${tc}25` }}>
                  <FileIcon type={u.file_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono-jet text-sm font-semibold text-white truncate">{u.scene}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{u.member_name}</p>
                </div>
                {u.file_type && (
                  <span className="text-[10px] px-2 py-1 rounded-full font-mono-jet hidden sm:block"
                    style={{ color: tc, background: `${tc}15`, border: `1px solid ${tc}25` }}>
                    {u.file_type}
                  </span>
                )}
                <span className="text-[11px] text-neutral-700 font-mono-jet hidden md:block">{u.uploaded_at?.slice(0, 10)}</span>
                {u.file_url && (
                  <a href={u.file_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-orange-500/10 text-neutral-600 hover:text-orange-400">
                    <ExternalLink size={13} />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="fixed inset-0 z-[999]"
              style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} />
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="pointer-events-auto w-full max-w-lg rounded-3xl overflow-hidden relative"
                style={{ background: "#0f0f0f", border: `1px solid ${typeColor(selected.file_type)}25`, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 32px 64px rgba(0,0,0,0.8)" }}
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ type: "spring", damping: 22, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 right-0 w-64 h-48 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 80% 0%, ${typeColor(selected.file_type)}15, transparent 65%)` }} />
                <div className="flex items-center justify-between p-6 pb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${typeColor(selected.file_type)}15`, border: `1px solid ${typeColor(selected.file_type)}25` }}>
                      <FileIcon type={selected.file_type} size={22} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-0.5">WIP Upload</p>
                      <h2 className="text-lg font-bold text-white leading-tight">{selected.scene}</h2>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-500 hover:bg-white/[0.1] transition-all">
                    <X size={12} />
                  </button>
                </div>
                <div className="px-6 pb-6 space-y-3 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Member", value: selected.member_name, color: "#F97316" },
                      { label: "File Type", value: selected.file_type || "Unknown", color: typeColor(selected.file_type) },
                      { label: "Uploaded", value: selected.uploaded_at?.slice(0, 10) || "—", color: "#888" },
                      { label: "Scene", value: selected.scene, color: "#3B82F6" },
                    ].map(f => (
                      <div key={f.label} className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.05]">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">{f.label}</p>
                        <p className="text-sm font-semibold truncate" style={{ color: f.color }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  {selected.notes && (
                    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.05]">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Notes</p>
                      <p className="text-sm text-neutral-400 leading-relaxed">{selected.notes}</p>
                    </div>
                  )}
                  {(selected.file_url || selected.link) && (
                    <a href={selected.file_url || selected.link || "#"} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm transition-all"
                      style={{ background: `${typeColor(selected.file_type)}20`, border: `1px solid ${typeColor(selected.file_type)}30`, color: typeColor(selected.file_type) }}>
                      <ExternalLink size={14} />
                      Open File
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
