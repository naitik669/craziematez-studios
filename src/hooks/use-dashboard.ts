import { useQuery } from "@tanstack/react-query";

export interface Stats {
  total: number; completed: number; active: number; in_review: number;
  todo: number; approved: number; percent: number; members: number;
  days_left: number | null; weeks_left: number | null;
  total_on_time: number; total_late: number; on_time_rate: number;
  total_revisions: number; total_uploads: number; upcoming_meetings: number;
  pending_reminders: number; absent_count: number; health_score: number;
  total_projects: number; active_projects: number;
}
export interface Task {
  id: string; task_id: string; member_id: number; member_name: string;
  scene: string; status: string; task_type: string | null;
  deadline: string; assigned_at: string; assigned_by: string | null;
  completed_at: string; revisions: number; wip_last_posted: string | null;
  project_id: string | null; days_left: number | null; urgency: string;
}
export interface Member {
  member_id: number; display_name: string; studio_name: string | null;
  role_desc: string | null; skills: string | null; experience: string | null;
  socials: string | null; joined_at: string;
}
export interface Delivery { member_id: number; member_name: string; on_time: number; late: number; count: number; }
export interface Upload {
  id: number; member_id: number; member_name: string; scene: string;
  file_type: string | null; file_url: string | null; link: string | null;
  notes: string | null; uploaded_at: string;
}
export interface Absence { member_id: number; member_name: string; absent_until: string; reason: string | null; }
export interface Revision {
  id: string; revision_id: string; member_id: number; member_name: string | null;
  scene: string; notes: string | null; reason: string | null;
  priority: string; sent_by: string | null; date: string; revision_number: number | null;
}
export interface Meeting {
  id: string; meeting_id: string; title: string; date: string | null;
  time: string | null; meeting_datetime: string; agenda: string | null;
  scheduled_by: string | null; cancelled: boolean;
}
export interface Note {
  id: number; member_id: number; member_name: string | null; scene: string | null;
  note_text: string; note: string; created_at: string;
}
export interface Project {
  project_id: number; name: string; stage: string | null; deadline: string;
  description: string | null; created_by: string | null; created_at: string;
  archived: boolean;
}
export interface ActivityItem { type: string; text: string; date: string; icon: string; color: string; }

export interface DashboardData {
  stats: Stats; tasks: Task[]; members: Member[]; deliveries: Delivery[];
  delivery_log: { id: number; member_id: number; scene: string | null; on_time: boolean | null; date: string }[];
  uploads: Upload[]; absences: Absence[]; absent_ids: number[];
  styleguide: Record<string, string>; revisions: Revision[]; meetings: Meeting[];
  reminders: { id: number; message: string; remind_at: string; sent: boolean; target_name: string | null }[];
  notes: Note[]; projects: Project[];
  member_tasks: Record<string, Task[]>; revision_counts: Record<string, number>;
  activity: ActivityItem[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/data");
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<DashboardData>;
}

export function useDashboard() {
  return useQuery<DashboardData, Error>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 3,
    retryDelay: (n: number) => Math.min(1000 * 2 ** n, 10000),
  });
}

export function initials(name: string) {
  return (name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}
export function urgencyColor(u: string) {
  if (u === "overdue") return "#EF4444";
  if (u === "critical") return "#F97316";
  if (u === "warning") return "#EAB308";
  return "#737373";
}
export function statusColor(s: string) {
  const m: Record<string, string> = {
    completed: "#22C55E", "in progress": "#F97316",
    "in review": "#3B82F6", approved: "#8B5CF6", todo: "#525252"
  };
  return m[s] || "#525252";
}
export function statusLabel(s: string) {
  const m: Record<string, string> = {
    completed: "Completed", "in progress": "In Progress",
    "in review": "In Review", approved: "Approved", todo: "Todo"
  };
  return m[s] || s;
}
