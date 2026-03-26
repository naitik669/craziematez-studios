import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials } from "@/hooks/use-dashboard";
import { useQuery } from "@tanstack/react-query";
import { useEnhancedModals } from "@/enhancements/EnhancedModals";
import { Search, ChevronRight, ExternalLink, UserMinus } from "lucide-react";

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
  const { openMember } = useEnhancedModals(); // ✅ FIXED (inside component)

  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: leftData } = useQuery<{ left_members: LeftMember[] }>({
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

  const leftMembers = leftData?.left_members ?? [];
  const now = new Date();

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Team</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {data.stats.members} members
            {data.stats.absent_count > 0 && (
              <span className="text-yellow-500 ml-1">
                · {data.stats.absent_count} away
              </span>
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

      {/* Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m, i) => {
          const rc = roleColor(m.role_desc || "");
          const tasks = data.member_tasks[String(m.member_id)] || [];
          const completed = tasks.filter(t => t.status === "completed").length;
          const active = tasks.filter(t => t.status === "in progress").length;
          const isAbsent = data.absent_ids.includes(m.member_id);
          const delivery = data.deliveries.find(d => d.member_id === m.member_id);
          const joinDate = m.joined_at ? new Date(m.joined_at) : null;
          const days =
            joinDate && !isNaN(joinDate.getTime())
              ? Math.round((now.getTime() - joinDate.getTime()) / 86400000)
              : 0;

          return (
            <motion.div
              key={m.member_id}
              onClick={() =>
                openMember(m, {
                  tasks,
                  delivery,
                  isAbsent,
                  absentUntil: data.absences.find(
                    a => a.member_id === m.member_id
                  )?.absent_until,
                })
              } // ✅ FIXED (moved inside JSX)
              style={{ cursor: "pointer" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              whileHover={{ y: -3 }}
              className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-all"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black"
                    style={{
                      background: `linear-gradient(135deg, ${rc}, ${rc}cc)`,
                    }}
                  >
                    {initials(m.studio_name || m.display_name)}
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-neutral-700 mt-1"
                  />
                </div>

                <p className="font-semibold text-white text-sm">
                  {m.studio_name || m.display_name}
                </p>
                <p className="text-[11px] text-neutral-600">
                  @{m.display_name}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
