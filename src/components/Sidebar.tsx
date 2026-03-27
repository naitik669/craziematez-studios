import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  LayoutDashboard, Layers, Users, RefreshCw, FolderOpen,
  Calendar, FileText, Palette, ChevronRight, Zap, Wifi, Bell
} from "lucide-react";

type Tab = "overview" | "pipeline" | "team" | "revisions" | "files" | "meetings" | "notes" | "styleguide" | "wip" | "announcements";

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
  { id: "wip",           icon: Image,      label: "WIP Gallery" },
  { id: "announcements", icon: Megaphone,  label: "Announcements" },
];

interface Props { active: Tab; onNavigate: (tab: Tab) => void }

export default function Sidebar({ active, onNavigate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data, isLoading } = useDashboard();

  // Inject overdue badge into pipeline
  const navItems = NAV.map((n) => {
    if (n.id === "pipeline" && data) {
      const overdue = data.tasks.filter((t) => t.urgency === "overdue" && t.status !== "completed").length;
      return { ...n, badge: overdue > 0 ? overdue : undefined };
    }
    return n;
  });

  // Notifications
  const notifications = [
    ...((data?.reminders ?? []).filter(r => !r.sent).map(r => ({
      icon: "🔔", text: r.message, sub: r.remind_at?.slice(0,10), color: "#F97316", id: `r-${r.id}`
    }))),
    ...((data?.tasks ?? []).filter(t => t.urgency === "overdue" && t.status !== "completed").slice(0,5).map(t => ({
      icon: "⚠️", text: `Overdue: ${t.scene}`, sub: t.member_name, color: "#EF4444", id: `t-${t.id}`
    }))),
    ...((data?.meetings ?? []).filter(m => {
      const dt = new Date(m.meeting_datetime);
      return !m.cancelled && dt > new Date() && (dt.getTime() - Date.now()) < 86400000 * 2;
    }).map(m => ({
      icon: "📅", text: `Soon: ${m.title}`, sub: new Date(m.meeting_datetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), color: "#3B82F6", id: `m-${m.id}`
    }))),
  ];

  const unread = notifications.length;

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

      {/* Notification bell */}
      <div className="relative px-2 mb-1">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04] transition-all"
        >
          <Bell size={17} className="flex-shrink-0" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center justify-between flex-1">
                <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
                {unread > 0 && (
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono-jet">{unread}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Panel */}
        <AnimatePresence>
          {notifOpen && (
            <>
              <motion.div className="fixed inset-0 z-[998]" onClick={() => setNotifOpen(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.97 }}
                className="absolute left-full ml-2 bottom-0 w-72 rounded-2xl overflow-hidden z-[999]"
                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}
              >
                <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Notifications</p>
                  {unread > 0 && <span className="text-[10px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-mono-jet">{unread} new</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-[12px] text-neutral-600">All caught up!</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                    {notifications.map((n, i) => (
                      <motion.div key={n.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex gap-3 p-3 hover:bg-white/[0.03] transition-colors">
                        <span className="text-base mt-0.5 flex-shrink-0">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-neutral-300 leading-snug">{n.text}</p>
                          {n.sub && <p className="text-[10px] text-neutral-600 font-mono-jet mt-0.5">{n.sub}</p>}
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 mx-1">
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
