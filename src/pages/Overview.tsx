import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useDashboard, initials, statusColor, statusLabel } from "@/hooks/use-dashboard";
import CountUp from "@/components/CountUp";
import StatCard from "@/components/StatCard";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import {
  Activity, Clock, Users, CheckCircle2, AlertTriangle,
  TrendingUp, Zap, RefreshCw, Upload as UploadIcon
} from "lucide-react";

function HealthRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#22C55E" : score >= 50 ? "#F97316" : "#EF4444";
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1C1C1C" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl text-white leading-none">
          <CountUp to={score} duration={1000} />
        </span>
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 mt-0.5">Health</span>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#22C55E", "in progress": "#F97316",
  "in review": "#3B82F6", approved: "#8B5CF6", todo: "#333333"
};
const MILESTONES = [
  { label: "Kickoff", date: "Mar 19", dt: new Date("2026-03-19") },
  { label: "Style Lock", date: "Apr 1",  dt: new Date("2026-04-01") },
  { label: "Mid-Prod",  date: "Apr 15", dt: new Date("2026-04-15") },
  { label: "Anim Done", date: "May 10", dt: new Date("2026-05-10") },
  { label: "Edit Lock", date: "May 20", dt: new Date("2026-05-20") },
  { label: "🚀 Ship",   date: "May 31", dt: new Date("2026-05-31") },
];

function SearchBar() {
  const { data } = useDashboard();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = q.length >= 2 && data ? [
    ...data.tasks.filter(t => t.scene.toLowerCase().includes(q.toLowerCase()) || t.member_name.toLowerCase().includes(q.toLowerCase())).slice(0, 4).map(t => ({ icon: "🎬", title: t.scene, sub: `${t.member_name} · ${statusLabel(t.status)}` })),
    ...data.members.filter(m => (m.studio_name || m.display_name).toLowerCase().includes(q.toLowerCase())).slice(0, 3).map(m => ({ icon: "👤", title: m.studio_name || m.display_name, sub: `@${m.display_name} · ${m.role_desc || ""}` })),
  ] : [];

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <div className={`flex items-center gap-2 bg-[#111] border rounded-xl px-3 py-2 transition-all ${open ? "border-orange-500/40 shadow-[0_0_0_3px_rgba(249,115,22,0.08)]" : "border-white/[0.06]"}`}>
        <svg className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search scenes, members..."
          className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none flex-1"
        />
        <kbd className="text-[10px] text-neutral-700 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] font-mono-jet hidden sm:block">⌘K</kbd>
      </div>
      {open && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-1.5 left-0 right-0 bg-[#151515] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-50"
        >
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] cursor-pointer transition-colors border-b border-white/[0.04] last:border-0">
              <span className="text-base">{r.icon}</span>
              <div>
                <p className="text-sm text-white font-medium leading-none mb-0.5">{r.title}</p>
                <p className="text-[11px] text-neutral-500 font-mono-jet">{r.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function Overview() {
  const { data, isLoading, error, refetch } = useDashboard();
  const now = new Date();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-semibold text-white text-lg">Loading Studio</p>
          <p className="text-neutral-600 text-sm mt-1 font-mono-jet">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <p className="font-display font-bold text-lg text-white mb-2">Database Error</p>
          <p className="text-neutral-500 text-sm mb-4 font-mono-jet break-all">{error.message}</p>
          <button onClick={() => refetch()} className="bg-orange-500 hover:bg-orange-600 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const s = data.stats;

  // Pie chart data
  const pieData = [
    { name: "Completed", value: s.completed, color: "#22C55E" },
    { name: "In Progress", value: s.active, color: "#F97316" },
    { name: "In Review", value: s.in_review, color: "#3B82F6" },
    { name: "Todo", value: s.todo, color: "#333" },
  ].filter(d => d.value > 0);

  // Bar chart data - deliveries by member
  const barData = data.deliveries.slice(0, 8).map(d => ({
    name: d.member_name.split(" ")[0],
    onTime: d.on_time,
    late: d.late,
  }));

  // Timeline progress
  const start = new Date("2026-03-19");
  const end = new Date("2026-05-31");
  const tlPct = Math.min(100, Math.max(0, ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100));

  return (
    <div className="p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Overview</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar />
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-orange-500 transition-colors px-3 py-2 rounded-xl bg-[#111] border border-white/[0.06] hover:border-orange-500/20"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-[#111111]"
        style={{ minHeight: 200 }}
      >
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.06] blur-3xl" style={{ background: "#F97316", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-[0.04] blur-3xl" style={{ background: "#F97316", transform: "translate(-20%, 30%)" }} />

        <div className="relative z-10 p-8 flex items-center gap-8 flex-wrap">
          {/* Big percentage */}
          <div className="flex-shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-600 mb-1">Overall Completion</p>
            <div className="flex items-end gap-1">
              <span className="font-display font-extrabold leading-none" style={{ fontSize: "clamp(56px, 8vw, 96px)", color: "#F97316", textShadow: "0 0 40px rgba(249,115,22,0.3)" }}>
                <CountUp to={s.percent} duration={1200} suffix="%" />
              </span>
            </div>
            <p className="text-neutral-500 text-sm mt-2">{s.completed}/{s.total} scenes finalized</p>
            {/* Progress bar */}
            <div className="mt-3 w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #F97316, #FB923C)" }}
                initial={{ width: 0 }}
                animate={{ width: `${s.percent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-24 bg-white/[0.06] hidden md:block" />

          {/* Health ring */}
          <HealthRing score={s.health_score} />

          {/* Divider */}
          <div className="w-px h-24 bg-white/[0.06] hidden md:block" />

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-w-[200px]">
            {[
              { label: "Days Left", value: s.days_left ?? "—", accent: s.days_left != null && s.days_left < 30 ? "#EF4444" : "#F97316" },
              { label: "On-Time Rate", value: `${s.on_time_rate}%`, accent: s.on_time_rate >= 80 ? "#22C55E" : "#F97316" },
              { label: "Active", value: s.active, accent: "#F97316" },
              { label: "In Review", value: s.in_review, accent: "#3B82F6" },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-[10px] uppercase tracking-widest text-neutral-600 mb-0.5">{item.label}</p>
                <p className="font-display font-bold text-xl" style={{ color: item.accent }}>
                  {typeof item.value === "number" ? <CountUp to={item.value} duration={900} delay={i * 100} /> : item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Status badges */}
          <div className="flex flex-col gap-2 ml-auto hidden lg:flex">
            {[
              { label: "Style Guide", val: data.styleguide["locked"] === "true" ? "Locked ✓" : "Unlocked", ok: data.styleguide["locked"] === "true" },
              { label: "Production", val: s.active > 0 ? "Active" : "Standby", ok: s.active > 0 },
              { label: "Team", val: `${s.members - s.absent_count}/${s.members} avail.`, ok: true },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.ok ? "bg-green-500" : "bg-orange-500"}`} />
                <span className="text-[11px] text-neutral-500">{b.label}</span>
                <span className={`text-[11px] font-semibold font-mono-jet ml-auto ${b.ok ? "text-green-400" : "text-orange-400"}`}>{b.val}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Scenes" value={s.total} sub="All time" accent="#F97316" delay={0.05} icon={<Layers />} />
        <StatCard label="Completed" value={s.completed} sub={`${s.percent}% done`} accent="#22C55E" delay={0.1} icon={<CheckCircle2 size={16} />} />
        <StatCard label="Team Members" value={s.members} sub={`${s.absent_count} away`} accent="#3B82F6" delay={0.15} icon={<Users size={16} />} />
        <StatCard label="Revisions" value={s.total_revisions} sub="Total sent" accent="#8B5CF6" delay={0.2} icon={<RefreshCw size={16} />} />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col: charts */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pie + Bar charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Donut */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
            >
              <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-4 font-semibold">Status Breakdown</p>
              {s.total > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value" isAnimationActive>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 flex-1">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-[11px] text-neutral-400 flex-1">{d.name}</span>
                        <span className="text-[11px] font-mono-jet text-neutral-300">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-neutral-700 text-sm text-center py-8">No data yet</p>
              )}
            </motion.div>

            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
            >
              <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-4 font-semibold">Deliveries</p>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={barData} barGap={2} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke="#1C1C1C" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "#151515", border: "1px solid #222", borderRadius: 10, fontSize: 11, color: "#ccc" }}
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="onTime" name="On-Time" fill="#F97316" radius={[4,4,0,0]} isAnimationActive />
                    <Bar dataKey="late" name="Late" fill="#333" radius={[4,4,0,0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-neutral-700 text-sm text-center py-8">No deliveries yet</p>
              )}
            </motion.div>
          </div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">Production Timeline</p>
              <span className="text-[11px] text-orange-500 font-mono-jet bg-orange-500/10 px-2 py-0.5 rounded-full">
                {s.days_left != null ? `${s.days_left}d left` : "—"}
              </span>
            </div>
            <div className="relative">
              {/* Track */}
              <div className="absolute top-[18px] left-3 right-3 h-px bg-white/[0.06]" />
              <motion.div
                className="absolute top-[18px] left-3 h-px"
                style={{ background: "linear-gradient(90deg, #F97316, #FB923C)" }}
                initial={{ width: 0 }}
                animate={{ width: `${tlPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              />
              <div className="flex justify-between relative z-10">
                {MILESTONES.map((m, i) => {
                  const done = now > m.dt;
                  const cur = i > 0 && now > MILESTONES[i - 1].dt && now <= m.dt;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-[14px] h-[14px] rounded-full border-2 transition-all duration-500 ${
                          done ? "bg-orange-500 border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                            : cur ? "bg-orange-400/50 border-orange-500 milestone-current"
                            : "bg-[#111] border-white/[0.1]"
                        }`}
                      />
                      <span className="text-[10px] text-neutral-600 font-medium text-center leading-tight">{m.label}</span>
                      <span className="text-[9px] text-neutral-700 font-mono-jet">{m.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-4 font-semibold">Scene Heatmap <span className="text-neutral-700">({data.tasks.length} scenes)</span></p>
            {data.tasks.length > 0 ? (
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(data.tasks.length * 1.5))}, 1fr)` }}
              >
                {data.tasks.map((t) => {
                  const bg = t.urgency === "overdue" && t.status !== "completed" ? "#EF4444" : statusColor(t.status);
                  return (
                    <div
                      key={t.id}
                      title={`${t.scene} · ${t.member_name}`}
                      className="aspect-square rounded-sm transition-transform hover:scale-150 hover:z-10 relative cursor-default"
                      style={{ background: bg }}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-700 text-sm text-center py-6">No scenes yet</p>
            )}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { label: "Done", color: "#22C55E" },
                { label: "Active", color: "#F97316" },
                { label: "Review", color: "#3B82F6" },
                { label: "Todo", color: "#333" },
                { label: "Overdue", color: "#EF4444" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                  <span className="text-[10px] text-neutral-600">{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right col: activity + urgent + leaderboard */}
        <div className="space-y-5">
          {/* Urgent tasks */}
          {(() => {
            const urgent = data.tasks.filter(t => t.status !== "completed" && (t.urgency === "overdue" || t.urgency === "critical")).sort((a, b) => (a.days_left ?? 999) - (b.days_left ?? 999));
            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold">Needs Attention</p>
                  {urgent.length > 0 && (
                    <span className="text-[11px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-mono-jet border border-red-500/20">{urgent.length}</span>
                  )}
                </div>
                {urgent.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-2xl mb-1.5">🎉</p>
                    <p className="text-sm text-neutral-600">No urgent tasks!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {urgent.slice(0, 6).map((t, i) => (
                      <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-red-500/20 transition-colors">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: t.urgency === "overdue" ? "#EF4444" : "#F97316" }}
                        />
                        <span className="text-[12px] text-neutral-300 font-mono-jet flex-1 truncate">{t.scene}</span>
                        <span
                          className="text-[11px] font-semibold font-mono-jet"
                          style={{ color: t.urgency === "overdue" ? "#EF4444" : "#F97316" }}
                        >
                          {t.days_left == null ? "—" : t.days_left < 0 ? `${Math.abs(t.days_left)}d over` : `${t.days_left}d`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-4 font-semibold">Top Performers</p>
            {data.deliveries.length === 0 ? (
              <p className="text-neutral-700 text-sm text-center py-4">No deliveries yet</p>
            ) : (
              <div className="space-y-2">
                {[...data.deliveries].sort((a, b) => b.on_time - a.on_time).slice(0, 5).map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-base w-5 text-center">{["🥇","🥈","🥉","",""][i] || String(i+1)}</span>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                      {initials(d.member_name)}
                    </div>
                    <span className="text-sm text-neutral-300 flex-1 truncate">{d.member_name}</span>
                    <span className="text-[11px] text-green-400 font-mono-jet">{d.on_time}✓</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-4 font-semibold">Recent Activity</p>
            {data.activity.length === 0 ? (
              <p className="text-neutral-700 text-sm text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {data.activity.slice(0, 8).map((a, i) => {
                  const bg = { amber: "rgba(249,115,22,.1)", green: "rgba(34,197,94,.1)", red: "rgba(239,68,68,.1)", blue: "rgba(59,130,246,.1)" }[a.color] || "rgba(255,255,255,.04)";
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: bg }}>{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-neutral-400 leading-snug">{a.text}</p>
                        <p className="text-[10px] text-neutral-700 font-mono-jet mt-0.5">{a.date?.slice(0, 10)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Layers({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
