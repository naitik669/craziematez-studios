import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  LayoutDashboard, Layers, Bell, Wifi, Zap,
  Users, UserMinus, RefreshCw, Image, FolderOpen, FileText,
  Calendar, Palette, Megaphone, Grid2x2, Clapperboard, Settings2,
} from "lucide-react";

type Tab = "overview" | "pipeline" | "team" | "revisions" | "files" | "meetings" | "notes" | "styleguide" | "left-members" | "wip" | "announcements" | "member-profile";

interface NavItem {
  id: Tab;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
}

interface Group {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: NavItem[];
}

const GROUPS: Group[] = [
  {
    id: "main", label: "Main", icon: Grid2x2,
    items: [
      { id: "overview",      icon: LayoutDashboard, label: "Overview" },
      { id: "pipeline",      icon: Layers,          label: "Pipeline" },
      { id: "announcements", icon: Megaphone,        label: "Announcements" },
    ],
  },
  {
    id: "team", label: "Team", icon: Users,
    items: [
      { id: "team",         icon: Users,     label: "Team" },
      { id: "left-members", icon: UserMinus, label: "Left Members" },
    ],
  },
  {
    id: "work", label: "Work", icon: Clapperboard,
    items: [
      { id: "revisions", icon: RefreshCw,  label: "Revisions" },
      { id: "wip",       icon: Image,      label: "WIP Gallery" },
      { id: "files",     icon: FolderOpen, label: "Files" },
      { id: "notes",     icon: FileText,   label: "Notes" },
    ],
  },
  {
    id: "admin", label: "Admin", icon: Settings2,
    items: [
      { id: "meetings",   icon: Calendar, label: "Meetings" },
      { id: "styleguide", icon: Palette,  label: "Style Guide" },
    ],
  },
];

interface Props { active: Tab; onNavigate: (tab: Tab) => void }

export default function Sidebar({ active, onNavigate }: Props) {
  const { data, isLoading } = useDashboard();
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    for (const g of GROUPS) if (g.items.some(i => i.id === active)) return g.id;
    return "main";
  });
  const [notifOpen, setNotifOpen] = useState(false);

  const toggleGroup = useCallback((id: string) => {
    setOpenGroup(prev => prev === id ? null : id);
  }, []);

  const overdueCount = data ? data.tasks.filter(t => t.urgency === "overdue" && t.status !== "completed").length : 0;

  const notifications = [
    ...((data?.reminders ?? []).filter(r => !r.sent).map(r => ({
      icon: "🔔", text: r.message, sub: r.remind_at?.slice(0, 10), color: "#F97316", id: `r-${r.id}`,
    }))),
    ...((data?.tasks ?? []).filter(t => t.urgency === "overdue" && t.status !== "completed").slice(0, 5).map(t => ({
      icon: "⚠️", text: `Overdue: ${t.scene}`, sub: t.member_name, color: "#EF4444", id: `t-${t.id}`,
    }))),
    ...((data?.meetings ?? []).filter(m => {
      const dt = new Date(m.meeting_datetime);
      return !m.cancelled && dt > new Date() && (dt.getTime() - Date.now()) < 86400000 * 2;
    }).map(m => ({
      icon: "📅", text: `Soon: ${m.title}`,
      sub: new Date(m.meeting_datetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      color: "#3B82F6", id: `m-${m.id}`,
    }))),
  ];
  const unread = notifications.length;

  return (
    <aside className="relative flex flex-col h-screen bg-[#0D0D0D] border-r border-white/[0.06] z-10 flex-shrink-0 w-16">

      {/* Logo */}
      <div className="flex items-center justify-center py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Zap size={16} className="text-black" fill="black" />
        </div>
      </div>

      {/* Groups */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-visible">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroup === group.id;
          const groupActive = group.items.some(i => i.id === active);
          const groupBadge = group.id === "main" ? overdueCount : 0;

          return (
            <div key={group.id}>
              {/* Group trigger */}
              <div className="relative group/trigger">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`relative flex items-center justify-center w-full h-10 rounded-xl transition-all duration-150 ${
                    isOpen || groupActive
                      ? "bg-orange-500/10 text-orange-400"
                      : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {(isOpen || groupActive) && (
                    <motion.div
                      layoutId={`group-bg-${group.id}`}
                      className="absolute inset-0 rounded-xl bg-orange-500/10 border border-orange-500/20"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <GroupIcon size={17} className="relative z-10" />
                  {groupBadge > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none z-50
                  opacity-0 group-hover/trigger:opacity-100 transition-opacity duration-150">
                  <div className="bg-[#1a1a1a] border border-white/10 text-neutral-300 text-xs font-medium
                    px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl">
                    {group.label}
                  </div>
                </div>
              </div>

              {/* Collapsible items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-1 flex flex-col gap-0.5 relative">
                      {/* accent line */}
                      <div className="absolute left-3 top-2 bottom-2 w-px bg-orange-500/20 rounded-full" />

                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = active === item.id;
                        const badge = item.id === "pipeline" ? overdueCount : undefined;

                        return (
                          <div key={item.id} className="relative group/item pl-1">
                            <button
                              onClick={() => onNavigate(item.id)}
                              className={`relative flex items-center justify-center w-full h-9 rounded-xl transition-all duration-150 ${
                                isActive
                                  ? "bg-orange-500/15 text-orange-400"
                                  : "text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04]"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="activeNav"
                                  className="absolute inset-0 rounded-xl bg-orange-500/15 border border-orange-500/25"
                                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                />
                              )}
                              <Icon size={15} className="relative z-10" />
                              {badge && badge > 0 && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                              )}
                            </button>

                            {/* Item tooltip */}
                            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none z-50
                              opacity-0 group-hover/item:opacity-100 transition-opacity duration-150">
                              <div className="bg-[#1a1a1a] border border-white/10 text-neutral-300 text-xs font-medium
                                px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
                                {item.label}
                                {badge && badge > 0 && (
                                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono-jet">
                                    {badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Notification bell */}
      <div className="relative px-2 mb-1">
        <div className="relative group/notif">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative flex items-center justify-center w-full h-10 rounded-xl text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04] transition-all"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </button>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none z-50
            opacity-0 group-hover/notif:opacity-100 transition-opacity duration-150">
            <div className="bg-[#1a1a1a] border border-white/10 text-neutral-300 text-xs font-medium
              px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
              Notifications
              {unread > 0 && (
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono-jet">{unread}</span>
              )}
            </div>
          </div>
        </div>

        {/* Notif panel */}
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

      {/* Live status */}
      <div className="px-2 py-3 border-t border-white/[0.06]">
        <div className="relative group/status">
          <div className="flex items-center justify-center w-full h-10 rounded-xl">
            <div className="relative">
              <Wifi size={15} className={isLoading ? "text-neutral-600" : "text-green-500"} />
              {!isLoading && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
          </div>
          <div className="absolute left-full ml-2 bottom-1 pointer-events-none z-50
            opacity-0 group-hover/status:opacity-100 transition-opacity duration-150">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
              <p className="text-[11px] text-neutral-400">{isLoading ? "Loading..." : "Live · Supabase"}</p>
              {data && <p className="text-[10px] text-neutral-600 font-mono-jet mt-0.5">{data.stats.members} members · {data.stats.percent ?? 0}% done</p>}
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
