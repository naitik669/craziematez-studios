import { useDashboard } from "@/hooks/use-dashboard";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare } from "lucide-react";
import { useEnhancedModals } from "@/enhancements/EnhancedModals";



const PRIORITY_COLOR: Record<string, string> = { high: "#EF4444", medium: "#F97316", low: "#737373" };

export default function Revisions() {
  const { data } = useDashboard();
  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const sorted = [...data.revisions].sort((a, b) => {
    const p = ["high","medium","low"];
    return p.indexOf(a.priority) - p.indexOf(b.priority);
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Revisions</h1>
        <p className="text-neutral-500 text-sm mt-0.5">{data.stats.total_revisions} total revision requests</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(["high","medium","low"] as const).map((p, i) => {
          const count = data.revisions.filter(r => r.priority === p).length;
          return (
            <div key={p} className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="font-display font-bold text-2xl" style={{ color: PRIORITY_COLOR[p] }}>{count}</p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1 capitalize">{p} Priority</p>
            </div>
          );
        })}
      </div>
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <p className="text-4xl mb-3">✅</p>
          <p>No revisions needed!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r, i) => {
            const pc = PRIORITY_COLOR[r.priority] || "#737373";
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 flex gap-4 items-start hover:border-white/[0.1] transition-colors"
                style={{ borderLeftColor: `${pc}40`, borderLeftWidth: 2 }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${pc}15` }}>
                  <MessageSquare size={15} style={{ color: pc }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-mono-jet text-sm font-semibold text-white">{r.scene}</span>
                      {r.member_name && <span className="text-[12px] text-neutral-500 ml-2">by {r.member_name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize font-mono-jet"
                        style={{ color: pc, background: `${pc}15`, border: `1px solid ${pc}30` }}>
                        {r.priority}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-mono-jet">{r.date?.slice(0, 10)}</span>
                    </div>
                  </div>
                  {r.notes && <p className="text-[13px] text-neutral-400 mt-2 leading-relaxed">{r.notes}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
