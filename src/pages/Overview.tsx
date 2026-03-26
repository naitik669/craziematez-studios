import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials, statusColor, statusLabel } from "@/hooks/use-dashboard";
import CountUp from "@/components/CountUp";
import StatCard from "@/components/StatCard";
import { HealthGraph } from "@/enhancements/EnhancedModals";

import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

import {
  Users, CheckCircle2, AlertTriangle, RefreshCw
} from "lucide-react";

/* ---------- SEARCH ---------- */
function SearchBar() {
  const { data } = useDashboard();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results =
    q.length >= 2 && data
      ? [
          ...data.tasks
            .filter(
              t =>
                t.scene.toLowerCase().includes(q.toLowerCase()) ||
                t.member_name.toLowerCase().includes(q.toLowerCase())
            )
            .slice(0, 4)
            .map(t => ({
              icon: "🎬",
              title: t.scene,
              sub: `${t.member_name} · ${statusLabel(t.status)}`
            })),
          ...data.members
            .filter(m =>
              (m.studio_name || m.display_name)
                .toLowerCase()
                .includes(q.toLowerCase())
            )
            .slice(0, 3)
            .map(m => ({
              icon: "👤",
              title: m.studio_name || m.display_name,
              sub: `@${m.display_name}`
            }))
        ]
      : [];

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <input
        value={q}
        onChange={e => {
          setQ(e.target.value);
          setOpen(true);
        }}
        className="bg-[#111] border border-white/[0.06] rounded-xl px-3 py-2 w-full text-sm text-white"
        placeholder="Search..."
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#151515] border border-white/[0.08] rounded-xl z-50">
          {results.map((r, i) => (
            <div key={i} className="px-3 py-2 hover:bg-white/[0.04]">
              <p className="text-sm text-white">{r.title}</p>
              <p className="text-xs text-neutral-500">{r.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- MAIN ---------- */
export default function Overview() {
  const { data, isLoading, error, refetch } = useDashboard();
  const now = new Date();

  if (isLoading) return <div className="p-10 text-white">Loading...</div>;
  if (error) return <div className="p-10 text-red-400">{error.message}</div>;
  if (!data) return null;

  const s = data.stats;

  const pieData = [
    { name: "Completed", value: s.completed, color: "#22C55E" },
    { name: "Active", value: s.active, color: "#F97316" },
    { name: "Review", value: s.in_review, color: "#3B82F6" }
  ].filter(d => d.value > 0);

  const barData = data.deliveries.slice(0, 6).map(d => ({
    name: d.member_name.split(" ")[0],
    onTime: d.on_time,
    late: d.late
  }));

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Overview</h1>
        <div className="flex gap-3">
          <SearchBar />
          <button
            onClick={refetch}
            className="bg-[#111] px-3 py-2 rounded-xl text-sm text-neutral-400"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] rounded-3xl p-8 flex items-center gap-10"
      >
        {/* % */}
        <div>
          <p className="text-neutral-500 text-sm">Overall Completion</p>
          <p className="text-orange-500 text-6xl font-bold">
            <CountUp to={s.percent} />%
          </p>
        </div>

        {/* ✅ HEALTH GRAPH */}
        <HealthGraph score={s.health_score} animated size={180} />

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-neutral-500 text-xs">Days Left</p>
            <p className="text-orange-400 text-xl">{s.days_left}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-xs">Active</p>
            <p className="text-orange-400 text-xl">{s.active}</p>
          </div>
        </div>
      </motion.div>

      {/* CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={s.total} accent="#F97316" />
        <StatCard label="Completed" value={s.completed} accent="#22C55E" />
        <StatCard label="Members" value={s.members} accent="#3B82F6" />
        <StatCard label="Revisions" value={s.total_revisions} accent="#8B5CF6" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PIE */}
        <div className="bg-[#111] p-5 rounded-2xl">
          <p className="text-sm text-neutral-500 mb-3">Status</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} dataKey="value">
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="bg-[#111] p-5 rounded-2xl">
          <p className="text-sm text-neutral-500 mb-3">Deliveries</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="onTime" fill="#F97316" />
              <Bar dataKey="late" fill="#333" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
