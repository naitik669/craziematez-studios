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


const MILESTONES = [
  { label: "Kickoff",    date: "Mar 19", dt: new Date("2026-03-19") },
  { label: "Style Lock", date: "Apr 1",  dt: new Date("2026-04-01") },
  { label: "Mid-Prod",   date: "Apr 15", dt: new Date("2026-04-15") },
  { label: "Anim Done",  date: "May 10", dt: new Date("2026-05-10") },
  { label: "Edit Lock",  date: "May 20", dt: new Date("2026-05-20") },
  { label: "🚀 Ship",    date: "May 31", dt: new Date("2026-05-31") },
];

const ACTIVITY_COLORS: Record<string, string> = {
  completed: "#22C55E", assigned: "#F97316", revision: "#EF4444",
  upload: "#3B82F6", member: "#8B5CF6", project: "#EAB308", styleguide: "#EC4899",
};

function NotifPanel({ notifications, data }: { notifications: any[]; data: any }) {
  const [tab, setTab] = useState<"alerts" | "activity" | "milestones">("alerts");
  const now = new Date();

  const nextMilestone = MILESTONES.find(m => m.dt > now);
  const daysToNext = nextMilestone
    ? Math.ceil((nextMilestone.dt.getTime() - now.getTime()) / 86400000)
    : null;

  const tabs = [
    { id: "alerts" as const,     label: "Alerts",      badge: notifications.length },
    { id: "activity" as const,   label: "Activity",    badge: 0 },
    { id: "milestones" as const, label: "Milestones",  badge: daysToNext !== null && daysToNext <= 3 ? 1 : 0 },
  ];

  return (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              tab === t.id ? "text-orange-400" : "text-neutral-600 hover:text-neutral-400"
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="ml-1 text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-mono-jet">
                {t.badge}
              </span>
            )}
            {tab === t.id && (
              <motion.div
                layoutId="notif-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-px bg-orange-500"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Alerts tab */}
      <AnimatePresence mode="wait">
        {tab === "alerts" && (
          <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-2xl mb-2">✅</p>
                <p className="text-[12px] text-neutral-600">All caught up!</p>
              </div>
            ) : notifications.map((n: any, i: number) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex gap-3 p-3 hover:bg-white/[0.03] transition-colors">
                <span className="text-base mt-0.5 flex-shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-neutral-300 leading-snug">{n.text}</p>
                  {n.sub && <p className="text-[10px] text-neutral-600 font-mono-jet mt-0.5">{n.sub}</p>}
                </div>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Activity tab */}
        {tab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
            {!data?.activity?.length ? (
              <div className="p-6 text-center">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-[12px] text-neutral-600">No recent activity</p>
              </div>
            ) : data.activity.slice(0, 12).map((a: any, i: number) => {
              const color = ACTIVITY_COLORS[a.type] || "#555";
              const relDate = a.date
                ? (() => {
                    const diff = Math.floor((now.getTime() - new Date(a.date).getTime()) / 60000);
                    if (diff < 1) return "just now";
                    if (diff < 60) return `${diff}m ago`;
                    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
                    return `${Math.floor(diff / 1440)}d ago`;
                  })()
                : "";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex gap-3 p-3 hover:bg-white/[0.03] transition-colors">
                  <span className="text-sm mt-0.5 flex-shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-neutral-300 leading-snug">{a.text}</p>
                    {relDate && <p className="text-[10px] text-neutral-600 font-mono-jet mt-0.5">{relDate}</p>}
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Milestones tab */}
        {tab === "milestones" && (
          <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {MILESTONES.map((m, i) => {
              const passed = now > m.dt;
              const isCurrent = !passed && (i === 0 || now > MILESTONES[i - 1].dt);
              const days = Math.ceil((m.dt.getTime() - now.getTime()) / 86400000);
              return (
                <motion.div key={m.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    isCurrent ? "bg-orange-500/10 border border-orange-500/20" : "bg-white/[0.02] border border-white/[0.04]"
                  }`}>
                  {/* dot */}
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    passed ? "bg-green-500" : isCurrent ? "bg-orange-400 animate-pulse" : "bg-neutral-700"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-semibold ${passed ? "text-neutral-600 line-through" : isCurrent ? "text-orange-300" : "text-neutral-300"}`}>
                      {m.label}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-mono-jet">{m.date}</p>
                  </div>
                  <span className={`text-[10px] font-mono-jet font-semibold flex-shrink-0 ${
                    passed ? "text-green-600" : isCurrent ? "text-orange-400" : "text-neutral-600"
                  }`}>
                    {passed ? "✓ done" : isCurrent ? `${days}d left` : `in ${days}d`}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface Props { active: Tab; onNavigate: (tab: Tab) => void }

export default function Sidebar({ active, onNavigate }: Props) {
  const { data, isLoading } = useDashboard();

  const [isHovered, setIsHovered] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    for (const g of GROUPS) if (g.items.some(i => i.id === active)) return g.id;
    return "main";
  });
  const [notifOpen, setNotifOpen] = useState(false);

  const toggleGroup = useCallback((id: string) => {
    setOpenGroup(prev => prev === id ? null : id);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    // Auto-open the group that contains the active tab if none is open
    setOpenGroup(prev => {
      if (prev) return prev;
      for (const g of GROUPS) {
        if (g.items.some(i => i.id === active)) return g.id;
      }
      return "main";
    });
  }, [active]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const isExpanded = isHovered;

  const overdueCount = data
    ? data.tasks.filter(t => t.urgency === "overdue" && t.status !== "completed").length
    : 0;

  const notifications = [
    ...((data?.reminders ?? []).filter(r => !r.sent).map(r => ({
      icon: "🔔", text: r.message, sub: r.remind_at?.slice(0, 10), color: "#F97316", id: `r-${r.id}`,
    }))),
    ...((data?.tasks ?? [])
      .filter(t => t.urgency === "overdue" && t.status !== "completed")
      .slice(0, 5)
      .map(t => ({
        icon: "⚠️", text: `Overdue: ${t.scene}`, sub: t.member_name, color: "#EF4444", id: `t-${t.id}`,
      }))),
    ...((data?.meetings ?? [])
      .filter(m => {
        const dt = new Date(m.meeting_datetime);
        return !m.cancelled && dt > new Date() && (dt.getTime() - Date.now()) < 86400000 * 2;
      })
      .map(m => ({
        icon: "📅", text: `Soon: ${m.title}`,
        sub: new Date(m.meeting_datetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        color: "#3B82F6", id: `m-${m.id}`,
      }))),
  ];
  const unread = notifications.length;

  return (
    <motion.aside
      animate={{ width: isExpanded ? 200 : 64 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col h-screen bg-[#0D0D0D] border-r border-white/[0.06] z-10 flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3.5 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
          <Zap size={16} className="text-black" fill="black" />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p className="font-display font-bold text-sm text-white leading-tight whitespace-nowrap">Craziematez</p>
              <p className="text-[10px] text-orange-500 font-mono-jet whitespace-nowrap">STUDIOS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Groups */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroup === group.id;
          const groupActive = group.items.some(i => i.id === active);
          const groupBadge = group.id === "main" ? overdueCount : 0;

          return (
            <div key={group.id}>
              {/* Group trigger */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`relative flex items-center gap-3 w-full h-10 px-2.5 rounded-xl transition-all duration-150 ${
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
                <GroupIcon size={17} className="relative z-10 flex-shrink-0" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.13 }}
                      className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap relative z-10"
                    >
                      {group.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {groupBadge > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

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
                        const badge = item.id === "pipeline" ? overdueCount : 0;

                        return (
                          <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`relative flex items-center gap-3 w-full h-9 px-2.5 rounded-xl transition-all duration-150 ${
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
                            <Icon size={15} className="relative z-10 flex-shrink-0 ml-1" />
                            <AnimatePresence>
                              {isExpanded && (
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
                            {badge > 0 && (
                              <AnimatePresence>
                                {isExpanded ? (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono-jet relative z-10"
                                  >
                                    {badge}
                                  </motion.span>
                                ) : (
                                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                                )}
                              </AnimatePresence>
                            )}
                          </button>
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
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="relative flex items-center gap-3 w-full h-10 px-2.5 rounded-xl text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04] transition-all"
        >
          <Bell size={17} className="flex-shrink-0" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between flex-1"
              >
                <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
                {unread > 0 && (
                  <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono-jet">
                    {unread}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notif panel */}
        <AnimatePresence>
          {notifOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-[998]"
                onClick={() => setNotifOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.97 }}
                className="fixed left-16 bottom-4 w-80 rounded-2xl overflow-hidden z-[999]"
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                }}
              >
                {/* Header */}
                <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Notifications</p>
                  {unread > 0 && (
                    <span className="text-[10px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-mono-jet">
                      {unread} new
                    </span>
                  )}
                </div>

                {/* Tabs */}
                <NotifPanel notifications={notifications} data={data} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Live status */}
      <div className="px-2 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl">
          <div className="relative flex-shrink-0">
            <Wifi size={15} className={isLoading ? "text-neutral-600" : "text-green-500"} />
            {!isLoading && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[11px] text-neutral-400 whitespace-nowrap">
                  {isLoading ? "Loading..." : "Live · Supabase"}
                </p>
                {data && (
                  <p className="text-[10px] text-neutral-600 font-mono-jet whitespace-nowrap">
                    {data.stats.members} members · {data.stats.percent ?? 0}% done
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
