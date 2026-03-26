import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDashboard, initials, statusColor, statusLabel } from "@/hooks/use-dashboard";
import CountUp from "@/components/CountUp";
import StatCard from "@/components/StatCard";
import { HealthGraph } from "@/enhancements/EnhancedModals"; // ✅ added

import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

import {
  Users, CheckCircle2, AlertTriangle,
  RefreshCw
} from "lucide-react";

// ❌ HealthRing removed (no longer needed)

export default function Overview() {
  const { data, isLoading, error, refetch } = useDashboard();
  const now = new Date();

  if (isLoading) {
    return <div className="p-10 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="p-10 text-red-400">Error: {error.message}</div>;
  }

  if (!data) return null;
  const s = data.stats;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-white text-2xl font-bold">Overview</h1>

      {/* HERO */}
      <div className="bg-[#111] rounded-2xl p-6 flex items-center gap-8">

        {/* Completion */}
        <div>
          <p className="text-neutral-500 text-sm">Completion</p>
          <p className="text-orange-500 text-5xl font-bold">
            <CountUp to={s.percent} />%
          </p>
        </div>

        {/* ✅ NEW HEALTH GRAPH */}
        <HealthGraph score={s.health_score} animated size={180} />

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={s.total} accent="#F97316" />
        <StatCard label="Completed" value={s.completed} accent="#22C55E" />
        <StatCard label="Members" value={s.members} accent="#3B82F6" />
        <StatCard label="Revisions" value={s.total_revisions} accent="#8B5CF6" />
      </div>
    </div>
  );
}
