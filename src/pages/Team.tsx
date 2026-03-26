import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials } from "@/hooks/use-dashboard";
import { useQuery } from "@tanstack/react-query";




const ROLE_COLORS: Record<string, string> = {
  animator: "#F97316", editor: "#3B82F6", director: "#8B5CF6",
  writer: "#22C55E", composer: "#EAB308", designer: "#EC4899",
  artist: "#F97316", background: "#3B82F6",
};

function roleColor(role: string) {
  const r = role?.toLowerCase() || "";
  for (const [k, v] of Object.entries(ROLE_COLORS)) {
    if (r.includes(k)) return v;
  }
  return "#F97316";
}

interface LeftMember {
  id: number;
  member_id: number;
  display_name: string;
  studio_name: string | null;
  role_desc: string | null;
  skills: string | null;
  left_at: string;
  reason: string;
}

export default function Team() {
  const { data } = useDashboard();
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: leftData } = useQuery<{ left_members: LeftMember[] }>({
    queryKey: ["left-members"],
    queryFn: () => fetch("/api/left-members").then(r => r.json()),
  });

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const filtered = data.members.filter(m => {
    const ql = q.toLowerCase();
    return !q || (m.studio_name || m.display_name).toLowerCase().includes(ql) || m.display_name.toLowerCase().includes(ql);
  });

  const leftMembers = leftData?.left_members ?? [];
  const now = new Date();

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Team</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {data.stats.members} members
            {data.stats.absent_count > 0 && <span className="text-yellow-500 ml-1">· {data.stats.absent_count} away</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2">
          <Search size={13} className="text-neutral-600" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search members..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none"
          />
        </div>
      </div>

      {/* Absent alert */}
      {data.absences.length > 0 && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
          <p className="text-xs text-yellow-400 font-semibold mb-2">⚠ Currently Away</p>
          <div className="flex flex-wrap gap-2">
            {data.absences.map(a => (
              <div key={a.member_id} className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full">
                <span className="text-[12px] text-yellow-300 font-medium">{a.member_name}</span>
                <span className="text-[11px] text-yellow-600">until {a.absent_until?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m, i) => {
          const rc = roleColor(m.role_desc || "");
          const tasks = data.member_tasks[String(m.member_id)] || [];
          const completed = tasks.filter(t => t.status === "completed").length;
          const active = tasks.filter(t => t.status === "in progress").length;
          const isAbsent = data.absent_ids.includes(m.member_id);
          const delivery = data.deliveries.find(d => d.member_id === m.member_id);
          const joinDate = m.joined_at ? new Date(m.joined_at) : null;
          const days = joinDate && !isNaN(joinDate.getTime()) ? Math.round((now.getTime() - joinDate.getTime()) / 86400000) : 0;
          const isExpanded = expanded === m.member_id;

          return (
            <motion.div
              key={m.member_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              whileHover={{ y: -3 }}
              className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer hover:border-white/[0.1] transition-all"
              onClick={() => setExpanded(isExpanded ? null : m.member_id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${rc}, ${rc}cc)`, boxShadow: `0 4px 16px ${rc}30` }}
                    >
                      {initials(m.studio_name || m.display_name)}
                    </div>
                    {isAbsent && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px]" title="Away">✈</span>
                    )}
                    {!isAbsent && active > 0 && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111] animate-live-dot" />
                    )}
                  </div>
                  <ChevronRight size={14} className={`text-neutral-700 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>

                <p className="font-semibold text-white text-sm leading-tight">{m.studio_name || m.display_name}</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">@{m.display_name}</p>

                {m.role_desc && (
                  <span className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono-jet"
                    style={{ color: rc, background: `${rc}15`, borderColor: `${rc}30` }}>
                    {m.role_desc}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 border-t border-white/[0.05]">
                {[
                  { v: tasks.length, l: "Scenes" },
                  { v: completed, l: "Done" },
                  { v: active, l: "Active" },
                ].map((s, j) => (
                  <div key={j} className={`py-2.5 text-center ${j < 2 ? "border-r border-white/[0.05]" : ""}`}>
                    <p className="font-display font-bold text-base text-white">{s.v}</p>
                    <p className="text-[9px] uppercase tracking-widest text-neutral-600">{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-white/[0.05] bg-white/[0.02] p-4 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#111] rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1">On-Time</p>
                      <p className="text-sm font-bold font-mono-jet text-green-400">
                        {delivery ? `${Math.round(delivery.on_time / Math.max(delivery.count, 1) * 100)}%` : "—"}
                      </p>
                    </div>
                    <div className="bg-[#111] rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1">Days Active</p>
                      <p className="text-sm font-bold font-mono-jet text-orange-400">{days}d</p>
                    </div>
                  </div>

                  {m.experience && (
                    <div className="bg-[#111] rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1">Experience</p>
                      <p className="text-[12px] text-neutral-400 leading-relaxed">{m.experience}</p>
                    </div>
                  )}

                  {m.skills && (
                    <div className="bg-[#111] rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-1.5">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {m.skills.split(/[,|]/).map(s => s.trim()).filter(Boolean).map(s => (
                          <span key={s} className="text-[10px] text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.socials && (
                    <div className="flex items-center gap-2 px-1">
                      <ExternalLink size={11} className="text-neutral-600" />
                      <span className="text-[11px] text-neutral-500">{m.socials}</span>
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest px-1">Recent Tasks</p>
                      {tasks.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-2 px-1">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.status === "completed" ? "#22C55E" : "#F97316" }} />
                          <span className="text-[11px] text-neutral-500 font-mono-jet flex-1 truncate">{t.scene}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Former Members ─────────────────────────────────────────── */}
      {leftMembers.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <UserMinus size={14} className="text-neutral-600" />
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">Former Members</h2>
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">{leftMembers.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {leftMembers.map((m, i) => {
              const rc = roleColor(m.role_desc || "");
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="bg-[#0f0f0f] border border-white/[0.04] rounded-2xl p-4 opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black grayscale"
                      style={{ background: `linear-gradient(135deg, ${rc}, ${rc}cc)` }}
                    >
                      {initials(m.studio_name || m.display_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-400 truncate">{m.studio_name || m.display_name}</p>
                      <p className="text-[11px] text-neutral-600">@{m.display_name}</p>
                    </div>
                    <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full flex-shrink-0">Left</span>
                  </div>
                  {m.role_desc && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono-jet"
                      style={{ color: rc, background: `${rc}10`, borderColor: `${rc}20` }}>
                      {m.role_desc}
                    </span>
                  )}
                  {m.left_at && (
                    <p className="text-[10px] text-neutral-700 mt-2">
                      Left {new Date(m.left_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
