import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import { StickyNote, Search, User, Film } from "lucide-react";
import { useEnhancedModals } from "@/enhancements/EnhancedModals";

export default function NotesPage() {
  const { data } = useDashboard();
  const { openNote } = useEnhancedModals(); // ✅ added
  const [q, setQ] = useState("");

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const filtered = data.notes.filter(n => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return (
      (n.note || n.note_text || "").toLowerCase().includes(ql) ||
      (n.scene || "").toLowerCase().includes(ql) ||
      (n.member_name || "").toLowerCase().includes(ql)
    );
  });

  const noteColors = ["#F97316", "#3B82F6", "#22C55E", "#8B5CF6", "#EAB308", "#EC4899"];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Notes</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {data.notes.length} notes
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2">
          <Search size={13} className="text-neutral-600" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search notes..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <StickyNote size={40} className="mx-auto mb-3 opacity-30" />
          <p>No notes found</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((n, i) => {
            const accent = noteColors[i % noteColors.length];

            return (
              <motion.div
                key={n.id}
                onClick={() => openNote(n)} // ✅ added
                style={{ cursor: "pointer" }} // ✅ added
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 break-inside-avoid hover:border-white/[0.1] transition-colors"
                style={{
                  borderTopColor: `${accent}40`,
                  borderTopWidth: 2,
                  cursor: "pointer",
                }}
              >
                <p className="text-[13px] text-neutral-300 leading-relaxed mb-3">
                  {n.note || n.note_text}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  {n.scene && (
                    <span className="flex items-center gap-1 text-[10px] text-neutral-600 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.04]">
                      <Film size={9} />
                      {n.scene}
                    </span>
                  )}

                  {n.member_name && (
                    <span className="flex items-center gap-1 text-[10px] text-neutral-600">
                      <User size={9} />
                      {n.member_name}
                    </span>
                  )}

                  <span className="text-[10px] text-neutral-700 font-mono-jet ml-auto">
                    {n.created_at?.slice(0, 10)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
