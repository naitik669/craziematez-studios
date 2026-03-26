import { motion } from "framer-motion";
import CountUp from "./CountUp";

interface Props {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
  delay?: number;
  animate?: boolean;
}

export default function StatCard({ label, value, sub, accent = "#F97316", icon, delay = 0, animate: doAnimate = true }: Props) {
  const numVal = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const suffix = typeof value === "string" && value.includes("%") ? "%" : "";

  return (
    <motion.div
      initial={doAnimate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden group cursor-default"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 80% 20%, ${accent}10, transparent 60%)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">{label}</span>
        {icon && (
          <span className="text-neutral-700 group-hover:text-neutral-500 transition-colors">{icon}</span>
        )}
      </div>
      <div className="font-display font-bold text-3xl" style={{ color: accent }}>
        {doAnimate ? <CountUp to={numVal} suffix={suffix} duration={800} /> : value}
      </div>
      {sub && <p className="text-[12px] text-neutral-600 mt-1.5">{sub}</p>}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
    </motion.div>
  );
}
