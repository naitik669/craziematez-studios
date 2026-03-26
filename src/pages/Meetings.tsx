import { useDashboard } from "@/hooks/use-dashboard";
import { motion } from "framer-motion";
import { Calendar, Clock, FileText } from "lucide-react";
const { openMeeting } = useEnhancedModals();
// on MeetingCard div: onClick={() => openMeeting(m)}

export default function Meetings() {
  const { data } = useDashboard();
  if (!data) return <div className="p-6 text-neutral-600">Loading...</div>;

  const now = new Date();
  const upcoming = data.meetings.filter(m => !m.cancelled && new Date(m.meeting_datetime) >= now).sort((a, b) => new Date(a.meeting_datetime).getTime() - new Date(b.meeting_datetime).getTime());
  const past = data.meetings.filter(m => !m.cancelled && new Date(m.meeting_datetime) < now).sort((a, b) => new Date(b.meeting_datetime).getTime() - new Date(a.meeting_datetime).getTime());
  const cancelled = data.meetings.filter(m => m.cancelled);

  function MeetingCard({ m, i, dim }: { m: typeof data.meetings[0]; i: number; dim?: boolean }) {
    const dt = new Date(m.meeting_datetime);
    const soon = !dim && (dt.getTime() - now.getTime()) < 86400000 * 2;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i * 0.05, 0.3) }}
        className={`bg-[#111] border rounded-2xl p-4 hover:border-white/[0.1] transition-colors ${
          dim ? "opacity-50 border-white/[0.04]" : soon ? "border-orange-500/30" : "border-white/[0.06]"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dim ? "bg-white/[0.04]" : "bg-orange-500/10"}`}>
            <Calendar size={16} className={dim ? "text-neutral-600" : "text-orange-400"} />
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${dim ? "text-neutral-600" : "text-white"} leading-tight`}>{m.title}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono-jet">
                <Calendar size={10} />
                {dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-mono-jet">
                <Clock size={10} />
                {dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {soon && <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full font-semibold">SOON</span>}
            </div>
            {m.agenda && (
              <div className="mt-2 flex gap-1.5">
                <FileText size={11} className="text-neutral-600 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-neutral-500 leading-relaxed">{m.agenda}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Meetings</h1>
        <p className="text-neutral-500 text-sm mt-0.5">{data.stats.upcoming_meetings} upcoming</p>
      </div>
      {upcoming.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-neutral-600 font-semibold mb-3">Upcoming</p>
          <div className="space-y-3">{upcoming.map((m, i) => <MeetingCard key={m.id} m={m} i={i} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest text-neutral-600 font-semibold mb-3">Past</p>
          <div className="space-y-3">{past.slice(0, 5).map((m, i) => <MeetingCard key={m.id} m={m} i={i} dim />)}</div>
        </div>
      )}
      {data.meetings.length === 0 && (
        <div className="text-center py-20 text-neutral-600">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No meetings scheduled</p>
        </div>
      )}
    </div>
  );
}
