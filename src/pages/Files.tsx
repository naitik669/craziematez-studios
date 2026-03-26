import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import { FolderOpen, ExternalLink, Image, Film, Music, FileText, File } from "lucide-react";

function FileIcon({ type }: { type: string | null }) {
  const t = type?.toLowerCase() || "";
  if (t.includes("image") || t.includes("png") || t.includes("jpg") || t.includes("gif")) return <Image size={18} className="text-blue-400" />;
  if (t.includes("video") || t.includes("mp4") || t.includes("mov")) return <Film size={18} className="text-purple-400" />;
  if (t.includes("audio") || t.includes("mp3") || t.includes("wav")) return <Music size={18} className="text-green-400" />;
  if (t.includes("text") || t.includes("doc")) return <FileText size={18} className="text-yellow-400" />;
  return <File size={18} className="text-neutral-500" />;
}

export default function Files() {
  const { data } = useDashboard();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const fileTypes = [...new Set(data.uploads.map(u => u.file_type?.split("/")[0] || "other"))];
  const filtered = data.uploads.filter(u => {
    if (q && !u.scene.toLowerCase().includes(q.toLowerCase()) && !u.member_name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter !== "all" && !(u.file_type || "").toLowerCase().includes(filter)) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Files</h1>
        <p className="text-neutral-500 text-sm mt-0.5">{data.stats.total_uploads} uploads total</p>
      </div>

      {/* Type filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2 mr-2">
          <svg className="w-3.5 h-3.5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-32" />
        </div>
        {["all", ...fileTypes].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-[12px] px-3 py-1.5 rounded-xl border capitalize transition-all font-medium ${
              filter === t
                ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                : "bg-[#111] border-white/[0.06] text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No files yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 flex gap-3 items-start hover:border-white/[0.1] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 border border-white/[0.05]">
                <FileIcon type={u.file_type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono-jet text-sm font-semibold text-white truncate">{u.scene}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{u.member_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  {u.file_type && (
                    <span className="text-[10px] text-neutral-600 bg-white/[0.04] px-2 py-0.5 rounded-full">{u.file_type}</span>
                  )}
                  <span className="text-[10px] text-neutral-700 font-mono-jet">{u.uploaded_at?.slice(0, 10)}</span>
                </div>
              </div>
              {u.file_url && (
                <a href={u.file_url} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-orange-400 p-1.5 rounded-lg hover:bg-orange-500/10"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
