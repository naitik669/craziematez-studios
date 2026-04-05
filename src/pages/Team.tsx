import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials } from "@/hooks/use-dashboard";
import { useQuery } from "@tanstack/react-query";
import { useEnhancedModals } from "@/enhancements/EnhancedModals";
import { Search, ChevronRight, UserMinus } from "lucide-react";
import { setProfileMemberId } from "@/pages/MemberProfile";

const ROLE_COLORS: Record<string, string> = {
  animator: "#F97316",
  editor: "#3B82F6",
  director: "#8B5CF6",
  writer: "#22C55E",
  composer: "#EAB308",
  designer: "#EC4899",
  artist: "#F97316",
  background: "#3B82F6",
  manager: "#8B5CF6",
};

function roleColor(role: string) {
  const r = role?.toLowerCase() || "";
  for (const [k, v] of Object.entries(ROLE_COLORS)) {
    if (r.includes(k)) return v;
  }
  return "#F97316";
}

export default function Team() {
  const { data } = useDashboard();

  const [q, setQ] = useState("");

  const { data: leftRaw } = useQuery({
    queryKey: ["left-members"],
    queryFn: () => fetch("/api/left-members").then(r => r.json()),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 3,
    retryDelay: (n: number) => Math.min(1000 * 2 ** n, 10000),
  });

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  // handle both { left_members: [...] } and plain array shapes
  const leftMembers: any[] = leftRaw?.left_members ?? (Array.isArray(leftRaw) ? leftRaw : []);

  const filtered = data.members.filter(m => {
    const ql = q.toLowerCase();
    return (
      !q ||
      (m.studio_name || m.display_name).toLowerCase().includes(ql) ||
      m.display_name.toLowerCase().includes(ql)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Team</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {data.stats.members} members
            {data.stats.absent_count > 0 && (
              <span className="text-yellow-500 ml-1">· {data.stats.absent_count} away</span>
            )}
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

      {/* ───── CURRENT TEAM ───── */}
      <div>
        <h2 className="text-sm text-neutral-500 uppercase tracking-wider mb-3">
          Current Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m, i) => {
            const rc = roleColor(m.role_desc || "");
            const tasks = data.member_tasks[String(m.member_id)] || [];
            const norm = (s: string) => (s || "").trim().toLowerCase();
            const completed = tasks.filter(t => norm(t.status) === "completed" || norm(t.status) === "approved").length;
            const active = tasks.filter(t => norm(t.status) === "in progress").length;
            const inReview = tasks.filter(t => norm(t.status) === "in review").length;
            const isAbsent = data.absent_ids.includes(m.member_id);
            const delivery = data.deliveries.find(d => d.member_id === m.member_id);
            const onTimeRate = delivery
              ? Math.round((delivery.on_time / Math.max(delivery.count, 1)) * 100)
              : null;

            return (
              <motion.div
                key={m.member_id ?? i}
                onClick={() => setProfileMemberId(m.member_id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                whileHover={{ y: -4, scale: 1.015 }}
                className="group relative bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.12] cursor-pointer"
              >
                {/* Gradient strip */}
                <div
                  className="h-[2px] w-full opacity-60 group-hover:opacity-100 transition"
                  style={{ background: `linear-gradient(90deg, transparent, ${rc}, transparent)` }}
                />

                <div className="p-4">
                  {/* Avatar row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black"
                        style={{
                          background: `linear-gradient(135deg, ${rc}, ${rc}aa, ${rc})`,
                          boxShadow: `0 6px 18px ${rc}40`,
                        }}
                      >
                        {initials(m.studio_name || m.display_name)}
                      </div>
                      {/* Live dot */}
                      {!isAbsent && (active + inReview) > 0 && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111]" />
                      )}
                      {/* Away dot */}
                      {isAbsent && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px]">✈</span>
                      )}
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-neutral-700 mt-1 group-hover:translate-x-1 transition"
                    />
                  </div>

                  {/* Name */}
                  <p className="font-semibold text-white text-sm leading-tight">
                    {m.studio_name || m.display_name}
                  </p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">@{m.display_name}</p>

                  {/* Role badge — always visible */}
                  {m.role_desc && (
                    <span
                      className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono-jet"
                      style={{ color: rc, background: `${rc}18`, border: `1px solid ${rc}30` }}
                    >
                      {m.role_desc}
                    </span>
                  )}
                </div>

                {/* Stats row — always visible */}
                <div className="grid grid-cols-3 border-t border-white/[0.05]">
                  {[
                    { v: tasks.length, l: "Scenes" },
                    { v: completed, l: "Done" },
                    { v: active + inReview, l: "Active" },
                  ].map((s, j) => (
                    <div key={j} className={`py-2.5 text-center ${j < 2 ? "border-r border-white/[0.05]" : ""}`}>
                      <p className="font-display font-bold text-base text-white">{s.v}</p>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-600">{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* On-time rate bar — shows only if there's delivery data */}
                {onTimeRate !== null && (
                  <div className="px-4 py-2.5 border-t border-white/[0.05]">
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px] uppercase tracking-widest text-neutral-600">On-Time</span>
                      <span
                        className="text-[10px] font-mono-jet font-semibold"
                        style={{ color: onTimeRate >= 80 ? "#22C55E" : "#F97316" }}
                      >
                        {onTimeRate}%
                      </span>
                    </div>
                    <div className="h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${onTimeRate}%`,
                          background: onTimeRate >= 80 ? "#22C55E" : "#F97316",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${rc}20, transparent 65%)` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ───── FORMER MEMBERS ───── */}
      {leftMembers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <UserMinus size={14} className="text-neutral-600" />
            <h2 className="text-sm text-neutral-500 uppercase tracking-wider">
              Former Members
            </h2>
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono-jet">
              {leftMembers.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leftMembers.map((m: any, i: number) => {
              const rc = roleColor(m.role_desc || "");

              return (
                <motion.div
                  key={m.id ?? m.member_id ?? i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.5) }}
                  className="relative bg-[#0f0f0f] border border-red-500/15 rounded-2xl overflow-hidden opacity-70 hover:opacity-90 transition-opacity"
                >
                  {/* Red strip */}
                  <div
                    className="h-[2px] w-full"
                    style={{ background: "linear-gradient(90deg, transparent, #EF4444, transparent)" }}
                  />

                  <div className="p-4">
                    {/* Avatar */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black grayscale"
                        style={{ background: `linear-gradient(135deg, ${rc}, ${rc}aa, ${rc})` }}
                      >
                        {initials(m.studio_name || m.display_name)}
                      </div>
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono-jet flex-shrink-0">
                        Left
                      </span>
                    </div>

                    {/* Name */}
                    <p className="font-semibold text-neutral-400 text-sm leading-tight">
                      {m.studio_name || m.display_name}
                    </p>
                    <p className="text-[11px] text-neutral-700 mt-0.5">@{m.display_name}</p>

                    {/* Role badge */}
                    {m.role_desc && (
                      <span
                        className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono-jet"
                        style={{ color: rc, background: `${rc}10`, border: `1px solid ${rc}20` }}
                      >
                        {m.role_desc}
                      </span>
                    )}
                  </div>

                  {/* Left date + reason */}
                  <div className="grid grid-cols-2 border-t border-white/[0.04] px-4 py-2.5 gap-2">
                    <div>
                      <p className="text-[9px] text-neutral-700 uppercase tracking-widest mb-0.5">Left</p>
                      <p className="text-[11px] text-red-400/70 font-mono-jet">
                        {m.left_at
                          ? new Date(m.left_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    {m.reason && (
                      <div>
                        <p className="text-[9px] text-neutral-700 uppercase tracking-widest mb-0.5">Reason</p>
                        <p className="text-[11px] text-neutral-600 truncate">{m.reason}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
