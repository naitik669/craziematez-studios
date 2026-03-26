import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials } from "@/hooks/use-dashboard";
import { useQuery } from "@tanstack/react-query";
import { useEnhancedModals } from "@/enhancements/EnhancedModals";
import { Search, ChevronRight } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  animator: "#F97316",
  editor: "#3B82F6",
  director: "#8B5CF6",
  writer: "#22C55E",
  composer: "#EAB308",
  designer: "#EC4899",
  artist: "#F97316",
  background: "#3B82F6",
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
  const { openMember } = useEnhancedModals();

  const [q, setQ] = useState("");

  const { data: leftData } = useQuery({
    queryKey: ["left-members"],
    queryFn: () => fetch("/api/left-members").then(r => r.json()),
  });

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const filtered = data.members.filter(m => {
    const ql = q.toLowerCase();
    return (
      !q ||
      (m.studio_name || m.display_name).toLowerCase().includes(ql) ||
      m.display_name.toLowerCase().includes(ql)
    );
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Team</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {data.stats.members} members
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2">
          <Search size={13} className="text-neutral-600" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search members..."
            className="bg-transparent text-sm text-neutral-300 outline-none"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m, i) => {
          const rc = roleColor(m.role_desc || "");
          const tasks = data.member_tasks[String(m.member_id)] || [];
          const isAbsent = data.absent_ids.includes(m.member_id);
          const delivery = data.deliveries.find(
            d => d.member_id === m.member_id
          );

          return (
            <motion.div
              key={m.member_id ?? i}
              onClick={() =>
                openMember(m, {
                  tasks,
                  delivery,
                  isAbsent,
                  absentUntil: data.absences.find(
                    a => a.member_id === m.member_id
                  )?.absent_until,
                })
              }
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              whileHover={{ y: -4, scale: 1.015 }}
              className="group relative bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.12]"
              style={{ cursor: "pointer" }}
            >
              {/* Top gradient strip */}
              <div
                className="h-[2px] w-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${rc}, transparent)`
                }}
              />

              <div className="p-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black"
                    style={{
                      background: `linear-gradient(135deg, ${rc}, ${rc}aa, ${rc})`,
                      boxShadow: `0 6px 18px ${rc}40`,
                    }}
                  >
                    {initials(m.studio_name || m.display_name)}
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-neutral-700 mt-1 transition-transform group-hover:translate-x-1"
                  />
                </div>

                <p className="font-semibold text-white text-sm">
                  {m.studio_name || m.display_name}
                </p>

                <p className="text-[11px] text-neutral-600">
                  @{m.display_name}
                </p>
              </div>

              {/* Glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${rc}25, transparent 65%)`
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
