import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  LayoutDashboard, Layers, Users, RefreshCw, FolderOpen,
  Calendar, FileText, Palette, ChevronRight, Zap, Wifi
} from "lucide-react";

type Tab = "overview" | "pipeline" | "team" | "revisions" | "files" | "meetings" | "notes" | "styleguide";

interface NavItem { id: Tab; icon: React.ComponentType<{ size?: number; className?: string }>; label: string; badge?: number }

const NAV: NavItem[] = [
  { id: "overview",    icon: LayoutDashboard, label: "Overview" },
  { id: "pipeline",    icon: Layers,          label: "Pipeline" },
  { id: "team",        icon: Users,           label: "Team" },
  { id: "revisions",   icon: RefreshCw,       label: "Revisions" },
  { id: "files",       icon: FolderOpen,      label: "Files" },
  { id: "meetings",    icon: Calendar,        label: "Meetings" },
  { id: "notes",       icon: FileText,        label: "Notes" },
  { id: "styleguide",  icon: Palette,         label: "Style Guide" },
];

interface Props { active: Tab; onNavigate: (tab: Tab) => void }

export default function Sidebar({ active, onNavigate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useDashboard();

  // Inject overdue badge into pipeline
  const navItems = NAV.map((n) => {
    if (n.id === "pipeline" && data) {
      const overdue = data.tasks.filter((t) => t.urgency === "overdue" && t.status !== "completed").length;
      return { ...n, badge: overdue > 0 ? overdue : undefined };
    }
    return n;
  });

  return (
    <motion.aside
      animate={{ width: expanded ? 220 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-[#0D0D0D] border-r border-white/[0.06] z-10 overflow-hidden flex-shrink-0"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3.5 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
          <Zap size={16} className="text-black" fill="black" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="font-display font-bold text-sm text-white leading-tight whitespace-nowrap">Craziematez</p>
              <p className="text-[10px] text-orange-500 font-mono-jet whitespace-nowrap">STUDIOS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150 w-full text-left group ${
                isActive
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-orange-500/10 border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Icon size={17} className="flex-shrink-0 relative z-10" />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.13 }}
                    className="text-sm font-medium whitespace-nowrap relative z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && (
                <AnimatePresence>
                  {expanded ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono-jet relative z-10"
                    >
                      {item.badge}
                    </motion.span>
                  ) : (
                    <motion.span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </AnimatePresence>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-2 py-4 border-t border-white/[0.06]">
        <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${isLoading ? "" : "bg-green-500/5"}`}>
          <div className="relative flex-shrink-0">
            <Wifi size={15} className={isLoading ? "text-neutral-600" : "text-green-500"} />
            {!isLoading && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 animate-live-dot" />
            )}
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[11px] text-neutral-400 whitespace-nowrap">
                  {isLoading ? "Loading..." : "Live · Supabase"}
                </p>
                {data && (
                  <p className="text-[10px] text-neutral-600 font-mono-jet whitespace-nowrap">
                    {data.stats.members} members
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 mx-1"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-neutral-600">Completion</span>
                <span className="text-[10px] text-orange-500 font-mono-jet">{data?.stats.percent ?? 0}%</span>
              </div>
              <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${data?.stats.percent ?? 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand hint */}
      {!expanded && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
          <ChevronRight size={12} className="text-neutral-600" />
        </div>
      )}
    </motion.aside>
  );
}
