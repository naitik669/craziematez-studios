import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard, initials, urgencyColor, statusColor, statusLabel } from "@/hooks/use-dashboard";
import { ChevronDown, Search, Filter } from "lucide-react";
const { openTask } = useEnhancedModals();
// on each row: onClick={() => openTask(t)}

export default function Pipeline() {
  const { data } = useDashboard();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const types = [...new Set(data.tasks.map(t => t.task_type).filter(Boolean))] as string[];
  const filtered = data.tasks
    .filter(t => {
      const ql = q.toLowerCase();
      if (q && !t.scene.toLowerCase().includes(ql) && !t.member_name.toLowerCase().includes(ql)) return false;
      if (status !== "all" && t.status !== status) return false;
      if (type !== "all" && t.task_type !== type) return false;
      return true;
    })
    .sort((a, b) => {
      const order = ["in review", "in progress", "todo", "approved", "completed"];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });

  const overdue = data.tasks.filter(t => t.urgency === "overdue" && t.status !== "completed").length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Pipeline</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{filtered.length} scenes{overdue > 0 && <span className="text-red-400 ml-1">· {overdue} overdue</span>}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: data.stats.total, color: "#F97316" },
          { label: "In Progress", value: data.stats.active, color: "#F97316" },
          { label: "In Review", value: data.stats.in_review, color: "#3B82F6" },
          { label: "Completed", value: data.stats.completed, color: "#22C55E" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 text-center"
          >
            <p className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={13} className="text-neutral-600" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search scenes or members..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none flex-1"
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-neutral-400 outline-none"
        >
          <option value="all">All Status</option>
          {["todo","in progress","in review","approved","completed"].map(s => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        {types.length > 0 && (
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-neutral-400 outline-none"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Scene grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p className="text-4xl mb-3">🎬</p>
          <p>No scenes match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t, i) => {
            const isExpanded = expanded === t.id;
            const isOverdue = t.urgency === "overdue" && t.status !== "completed";
            const uc = urgencyColor(t.urgency);
            const sc = statusColor(t.status);
            const revs = data.revision_counts[t.scene] || 0;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className={`bg-[#111] border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.12] ${
                  isOverdue ? "border-red-500/30 overdue-pulse" :
                  t.status === "completed" ? "border-green-500/15" :
                  isExpanded ? "border-orange-500/30" : "border-white/[0.06]"
                }`}
                onClick={() => setExpanded(isExpanded ? null : t.id)}
                whileHover={{ y: -2 }}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono-jet text-[13px] font-semibold text-white leading-tight">{t.scene}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono-jet"
                        style={{ color: sc, background: `${sc}15`, borderColor: `${sc}30` }}>
                        {statusLabel(t.status)}
                      </span>
                    </div>
                  </div>

                  {/* Member */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0">
                      {initials(t.member_name)}
                    </div>
                    <span className="text-[12px] text-neutral-400">{t.member_name}</span>
                    {t.task_type && (
                      <span className="ml-auto text-[10px] text-neutral-600 bg-white/[0.04] px-2 py-0.5 rounded-full font-mono-jet">{t.task_type}</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono-jet flex items-center gap-1" style={{ color: uc }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: uc }} />
                      {t.deadline?.slice(0, 10) || "—"}
                      {t.days_left != null && t.status !== "completed" && (
                        <span className="ml-0.5">
                          ({t.days_left < 0 ? `${Math.abs(t.days_left)}d over` : `${t.days_left}d`})
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {revs > 0 && <span className="text-neutral-600">🔄 {revs}</span>}
                      <ChevronDown size={13} className={`text-neutral-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/[0.06] bg-white/[0.02] overflow-hidden"
                    >
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {[
                          { label: "Assigned By", val: t.assigned_by || "—" },
                          { label: "Assigned On", val: t.assigned_at?.slice(0, 10) || "—" },
                          { label: "Revisions", val: String(t.revisions ?? 0) },
                          { label: "Urgency", val: t.urgency },
                          ...(t.completed_at ? [{ label: "Completed", val: t.completed_at.slice(0, 10) }] : []),
                        ].map(item => (
                          <div key={item.label} className="bg-[#111] rounded-xl p-3 border border-white/[0.04]">
                            <p className="text-[9px] uppercase tracking-widest text-neutral-600 mb-1">{item.label}</p>
                            <p className="text-[12px] font-mono-jet text-neutral-300">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
