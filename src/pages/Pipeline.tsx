import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard, initials, urgencyColor, statusColor, statusLabel } from "@/hooks/use-dashboard";
import { useEnhancedModals } from "@/hooks/use-enhanced-modals";
import { ChevronDown, Search } from "lucide-react";

export default function Pipeline() {
  const { data } = useDashboard();
  const { openTask } = useEnhancedModals();

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
      <h1 className="font-display font-bold text-2xl text-white">Pipeline</h1>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p>No scenes match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t, i) => {
            const isExpanded = expanded === t.id;

            return (
              <motion.div
                key={t.id}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 cursor-pointer"
                onClick={() => {
                  setExpanded(isExpanded ? null : t.id);
                  openTask(t); // ✅ working
                }}
              >
                <p className="text-white">{t.scene}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
