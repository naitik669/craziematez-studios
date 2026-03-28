import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials } from "@/hooks/use-dashboard";
import { ArrowLeft, Clock, CheckCircle2, Star } from "lucide-react";
import { HealthGraph } from "@/enhancements/EnhancedModals";

// ── global state so EnhancedModals can push a member id ────────────────────
let _memberId: number | null = null;
let _listeners: Array<() => void> = [];

export function setProfileMemberId(id: number) {
  _memberId = id;
  _listeners.forEach(fn => fn());
  (window as any).__studioNavigate("member-profile");
}

// ── colour helpers ──────────────────────────────────────────────────────────
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
const STATUS_COLOR: Record<string, string> = {
  completed: "#22C55E", "in progress": "#F97316",
  "in review": "#3B82F6", approved: "#8B5CF6", todo: "#444",
};

function StatBox({ label, value, color, delay = 0 }: { label: string; value: number | string; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl p-4 text-center"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "#555" }}>{label}</p>
    </motion.div>
  );
}

export default function MemberProfile() {
  const { data } = useDashboard();
  const [memberId, setMemberId] = useState<number | null>(_memberId);

  useEffect(() => {
    const fn = () => setMemberId(_memberId);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  if (!memberId) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
        <p className="text-4xl">👤</p>
        <p className="text-neutral-500 text-sm">No member selected.<br />Click a member card in the Team page.</p>
        <button
          onClick={() => (window as any).__studioNavigate("team")}
          className="mt-2 flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition px-4 py-2 rounded-xl border border-white/[0.06] hover:border-white/20"
        >
          <ArrowLeft size={13} /> Go to Team
        </button>
      </div>
    );
  }

  const m = data.members.find(x => x.member_id === memberId);
  if (!m) return <div className="p-6 text-neutral-500">Member not found.</div>;

  const rc = roleColor(m.role_desc || "");
  const tasks = data.member_tasks[String(m.member_id)] || [];
  const completed = tasks.filter(t => t.status === "completed").length;
  const active = tasks.filter(t => t.status === "in progress").length;
  const inReview = tasks.filter(t => t.status === "in review").length;
  const todo = tasks.filter(t => t.status === "todo").length;
  const delivery = data.deliveries.find(d => d.member_id === m.member_id);
  const onTimeRate = delivery ? Math.round((delivery.on_time / Math.max(delivery.count, 1)) * 100) : null;
  const isAbsent = data.absent_ids.includes(m.member_id);
  const absentInfo = data.absences.find(a => a.member_id === m.member_id);
  const joinDate = m.joined_at ? new Date(m.joined_at) : null;
  const daysActive = joinDate && !isNaN(joinDate.getTime())
    ? Math.round((Date.now() - joinDate.getTime()) / 86400000) : 0;
  const skills = m.skills?.split(/[,|]/).map(s => s.trim()).filter(Boolean) ?? [];
  const completionPct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const healthScore = Math.round((onTimeRate ?? completionPct) * 0.6 + completionPct * 0.4);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* back */}
      <button
        onClick={() => (window as any).__studioNavigate("team")}
        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition"
      >
        <ArrowLeft size={13} /> Back to Team
      </button>

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: "#111", border: `1px solid ${rc}25` }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 80% 0%, ${rc}18, transparent 65%)` }} />
        <div className="h-[3px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${rc}, transparent)` }} />

        <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 260, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black text-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${rc}, ${rc}bb)`, boxShadow: `0 12px 32px ${rc}50` }}
          >
            {initials(m.studio_name || m.display_name)}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-3xl text-white">
                {m.studio_name || m.display_name}
              </h1>
              {isAbsent && (
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#EAB30818", color: "#EAB308", border: "1px solid #EAB30830" }}>
                  ✈ Away until {absentInfo?.absent_until?.slice(0, 10)}
                </span>
              )}
              {!isAbsent && active > 0 && (
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
                  style={{ background: "#22C55E18", color: "#22C55E", border: "1px solid #22C55E30" }}>
                  ● Active
                </span>
              )}
            </div>
            <p className="text-neutral-500 text-sm mt-1">@{m.display_name}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {m.role_desc && (
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full font-mono-jet"
                  style={{ color: rc, background: `${rc}18`, border: `1px solid ${rc}30` }}>
                  {m.role_desc}
                </span>
              )}
              {joinDate && !isNaN(joinDate.getTime()) && (
                <span className="text-[11px] text-neutral-600 flex items-center gap-1">
                  <Clock size={10} /> Joined {joinDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="font-display font-bold text-4xl text-white">{daysActive}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600">Days Active</p>
          </div>
        </div>
      </motion.div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Total Scenes" value={tasks.length} color={rc} delay={0.05} />
        <StatBox label="Completed" value={completed} color="#22C55E" delay={0.1} />
        <StatBox label="In Progress" value={active} color="#F97316" delay={0.15} />
        <StatBox label="In Review" value={inReview} color="#3B82F6" delay={0.2} />
      </div>

      {/* HEALTH + DELIVERY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-6 flex flex-col items-center gap-2"
          style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2">Member Health</p>
          <HealthGraph score={healthScore} animated size={160} />
        </motion.div>

        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">On-Time Rate</p>
              <p className="text-sm font-bold font-mono-jet" style={{ color: (onTimeRate ?? 0) >= 80 ? "#22C55E" : "#F97316" }}>
                {onTimeRate != null ? `${onTimeRate}%` : "—"}
              </p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                animate={{ width: `${onTimeRate ?? 0}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                style={{ background: (onTimeRate ?? 0) >= 80 ? "#22C55E" : "#F97316" }} />
            </div>
            {delivery && (
              <p className="text-[11px] text-neutral-700 mt-2 font-mono-jet">
                {delivery.on_time} on time · {delivery.late} late · {delivery.count} total
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between mb-3">
              <p className="text-[10px] uppercase tracking-widest text-neutral-600">Task Completion</p>
              <p className="text-sm font-bold font-mono-jet text-green-400">{completionPct}%</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.55 }}
                style={{ background: "linear-gradient(90deg, #22C55E80, #22C55E)" }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl p-4 grid grid-cols-2 gap-2"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Todo", count: todo, color: "#444" },
              { label: "Active", count: active, color: "#F97316" },
              { label: "Review", count: inReview, color: "#3B82F6" },
              { label: "Done", count: completed, color: "#22C55E" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[11px] text-neutral-500">{s.label}</span>
                <span className="ml-auto text-[11px] font-mono-jet font-semibold" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* SKILLS + BIO */}
      {(skills.length > 0 || m.experience || m.socials) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-6 space-y-4"
          style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          {skills.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 flex items-center gap-1">
                <Star size={10} /> Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    className="text-[11px] px-3 py-1 rounded-full text-neutral-300"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          {m.experience && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Experience</p>
              <p className="text-sm text-neutral-400 leading-relaxed">{m.experience}</p>
            </div>
          )}
          {m.socials && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Socials / Links</p>
              <p className="text-sm text-neutral-500 font-mono-jet">{m.socials}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* TASK LIST */}
      {tasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-6"
          style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-4 flex items-center gap-1">
            <CheckCircle2 size={10} /> All Scenes ({tasks.length})
          </p>
          <div className="space-y-2">
            {tasks.map((t, i) => {
              const sc = STATUS_COLOR[t.status] || "#444";
              return (
                <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.52 + i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sc }} />
                  <span className="flex-1 text-sm text-neutral-300 font-mono-jet truncate">{t.scene}</span>
                  {t.days_left != null && (
                    <span className="text-[10px] font-mono-jet flex-shrink-0"
                      style={{ color: t.days_left < 0 ? "#EF4444" : "#555" }}>
                      {t.days_left < 0 ? `${Math.abs(t.days_left)}d over` : `${t.days_left}d left`}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                    style={{ color: sc, background: `${sc}18`, border: `1px solid ${sc}30` }}>
                    {t.status}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
