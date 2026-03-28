/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           CRAZIEMATEZ STUDIOS — ENHANCEMENTS                 ║
 * ║  Drop-in animated modals + health graph for every section.   ║
 * ║  Import { useEnhancedModals, EnhancedModalProvider,          ║
 * ║           RevisionModal, MemberModal, MeetingModal,          ║
 * ║           NoteModal, TaskModal, HealthGraph }                ║
 * ║  from "@/enhancements/EnhancedModals"                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * USAGE — wrap your app (or any page) once:
 *   <EnhancedModalProvider>
 *     <YourPage />
 *   </EnhancedModalProvider>
 *
 * Then anywhere inside call hooks:
 *   const { openRevision, openMember, openMeeting, openNote, openTask } = useEnhancedModals();
 *   <div onClick={() => openRevision(revisionObject)}> … </div>
 *
 * Or use standalone components directly:
 *   <RevisionModal revision={r} open={open} onClose={() => setOpen(false)} />
 *   <HealthGraph score={76} animated />
 */

import React, {
  createContext, useContext, useState, useCallback,
  useEffect, useRef, type ReactNode,
} from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import type { Revision, Member, Meeting, Note, Task, Delivery } from "@/hooks/use-dashboard";

// ─── types ──────────────────────────────────────────────────────────────────

type ModalKind = "revision" | "member" | "meeting" | "note" | "task" | null;

interface ModalState {
  kind: ModalKind;
  payload: unknown;
}

interface EnhancedCtx {
  openRevision: (r: Revision) => void;
  openMember:   (m: Member, extra?: MemberExtra) => void;
  openMeeting:  (m: Meeting) => void;
  openNote:     (n: Note) => void;
  openTask:     (t: Task) => void;
  closeAll:     () => void;
}

interface MemberExtra {
  tasks?: Task[];
  delivery?: Delivery;
  isAbsent?: boolean;
  absentUntil?: string;
}

// ─── context ────────────────────────────────────────────────────────────────

const Ctx = createContext<EnhancedCtx | null>(null);

export function useEnhancedModals(): EnhancedCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEnhancedModals must be inside <EnhancedModalProvider>");
  return c;
}

// ─── colours ────────────────────────────────────────────────────────────────

const PRIORITY: Record<string, string> = { high: "#EF4444", medium: "#F97316", low: "#737373" };
const STATUS:   Record<string, string> = {
  completed: "#22C55E", "in progress": "#F97316",
  "in review": "#3B82F6", approved: "#8B5CF6", todo: "#555",
};
const ROLE: Record<string, string> = {
  animator: "#F97316", editor: "#3B82F6", director: "#8B5CF6",
  writer: "#22C55E", composer: "#EAB308", designer: "#EC4899",
  artist: "#F97316", background: "#3B82F6",
};
function roleColor(role = "") {
  const r = role.toLowerCase();
  for (const [k, v] of Object.entries(ROLE)) if (r.includes(k)) return v;
  return "#F97316";
}
function initials(name = "") {
  return name.split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}

// ─── animated number ────────────────────────────────────────────────────────

function AnimNum({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const duration = 800;
    function tick(ts: number) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [to]);
  return <>{val}{suffix}</>;
}

// ─── backdrop ───────────────────────────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
    />
  );
}

// ─── modal shell ────────────────────────────────────────────────────────────

function ModalShell({
  children, onClose, accent = "#F97316", width = 520,
}: {
  children: ReactNode; onClose: () => void; accent?: string; width?: number;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none"
      initial={false}
    >
      <motion.div
        className="relative pointer-events-auto rounded-3xl overflow-hidden"
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          background: "#0f0f0f",
          border: `1px solid ${accent}25`,
          boxShadow: `0 0 80px ${accent}15, 0 24px 64px rgba(0,0,0,0.7)`,
          overflowY: "auto",
        }}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 10%, ${accent}18, transparent 70%)`,
          }}
        />
        {/* close btn */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.06)", color: "#666" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── field row ──────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>{label}</p>
      {children}
    </div>
  );
}

// ─── pill ───────────────────────────────────────────────────────────────────

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
      color, background: `${color}18`, border: `1px solid ${color}30`,
      fontFamily: "monospace", textTransform: "capitalize",
    }}>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH GRAPH — exported standalone
// ═══════════════════════════════════════════════════════════════════════════

export function HealthGraph({
  score, label = "Health Score", animated = true, size = 200,
}: {
  score: number; label?: string; animated?: boolean; size?: number;
}) {
  const color = score >= 75 ? "#22C55E" : score >= 50 ? "#F97316" : "#EF4444";
  const r = 42;
  const circ = 2 * Math.PI * r;
  const [ready, setReady] = useState(!animated);

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setReady(true), 120);
      return () => clearTimeout(t);
    }
  }, [animated]);

  const bars = Array.from({ length: 20 }, (_, i) => {
    const threshold = (i + 1) / 20;
    const active = score / 100 >= threshold;
    const h = 6 + Math.round(Math.abs(Math.sin(i * 0.8)) * 18);
    return { h, active };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Ring */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
          {/* track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1a1a1a" strokeWidth="7" />
          {/* tick marks */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
            const r1 = 48; const r2 = 50;
            return (
              <line
                key={i}
                x1={50 + r1 * Math.cos(angle)} y1={50 + r1 * Math.sin(angle)}
                x2={50 + r2 * Math.cos(angle)} y2={50 + r2 * Math.sin(angle)}
                stroke="#222" strokeWidth="1"
              />
            );
          })}
          {/* progress arc */}
          <motion.circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: ready ? circ - (score / 100) * circ : circ }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}70)` }}
          />
          {/* glow outer */}
          <motion.circle
            cx="50" cy="50" r={r + 2} fill="none"
            stroke={color} strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={circ}
            opacity={0.25}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: ready ? circ - (score / 100) * circ : circ }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.25 }}
          />
        </svg>

        {/* centre text */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontWeight: 800, fontSize: size * 0.22, color, lineHeight: 1, letterSpacing: "-2px" }}>
            {ready ? <AnimNum to={score} /> : 0}
          </span>
          <span style={{ fontSize: size * 0.065, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 2 }}>
            {label}
          </span>
        </div>
      </div>

      {/* bar equalizer */}
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32 }}>
        {bars.map((b, i) => (
          <motion.div
            key={i}
            style={{
              width: 6, borderRadius: 3,
              background: b.active ? color : "#1e1e1e",
              boxShadow: b.active ? `0 0 6px ${color}60` : "none",
            }}
            initial={{ height: 4, opacity: 0 }}
            animate={{ height: ready ? b.h : 4, opacity: ready ? 1 : 0 }}
            transition={{ delay: ready ? i * 0.03 : 0, duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* status label */}
      <Pill
        label={score >= 75 ? "● Healthy" : score >= 50 ? "◐ Moderate" : "○ At Risk"}
        color={color}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVISION MODAL
// ═══════════════════════════════════════════════════════════════════════════

export function RevisionModal({
  revision: r, open, onClose,
}: {
  revision: Revision | null; open: boolean; onClose: () => void;
}) {
  if (!r) return null;
  const pc = PRIORITY[r.priority] || "#737373";

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <ModalShell onClose={onClose} accent={pc}>
            <div style={{ padding: "32px 28px 28px" }}>
              {/* header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${pc}18`, border: `1px solid ${pc}30`,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={pc} strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1, paddingRight: 32 }}>
                  <p style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Revision Request</p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{r.scene}</h2>
                  {r.member_name && (
                    <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>by {r.member_name}</p>
                  )}
                </div>
              </div>

              {/* badges row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                <Pill label={`${r.priority} priority`} color={pc} />
                {r.revision_number && <Pill label={`Rev #${r.revision_number}`} color="#888" />}
                {r.date && (
                  <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace", alignSelf: "center" }}>
                    {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>

              {/* fields */}
              <div style={{ display: "grid", gap: 10 }}>
                {r.notes && (
                  <Field label="Notes">
                    <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.6 }}>{r.notes}</p>
                  </Field>
                )}
                {r.reason && (
                  <Field label="Reason">
                    <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.6 }}>{r.reason}</p>
                  </Field>
                )}
                {r.sent_by && (
                  <Field label="Sent By">
                    <p style={{ fontSize: 14, color: "#ccc" }}>{r.sent_by}</p>
                  </Field>
                )}

                {/* priority bar */}
                <div style={{ padding: "12px 16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>Priority Indicator</span>
                    <span style={{ fontSize: 11, color: pc, fontFamily: "monospace", fontWeight: 600, textTransform: "capitalize" }}>{r.priority}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "#1a1a1a", overflow: "hidden" }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${pc}80, ${pc})` }}
                      initial={{ width: 0 }}
                      animate={{ width: r.priority === "high" ? "100%" : r.priority === "medium" ? "55%" : "25%" }}
                      transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ModalShell>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER MODAL
// ═══════════════════════════════════════════════════════════════════════════

export function MemberModal({
  member: m, extra = {}, open, onClose,
}: {
  member: Member | null; extra?: MemberExtra; open: boolean; onClose: () => void;
}) {
  if (!m) return null;
  const rc = roleColor(m.role_desc || "");
  const tasks = extra.tasks ?? [];
  const completed = tasks.filter(t => t.status === "completed").length;
  const active = tasks.filter(t => t.status === "in progress").length;
  const inReview = tasks.filter(t => t.status === "in review").length;
  const onTimeRate = extra.delivery
    ? Math.round((extra.delivery.on_time / Math.max(extra.delivery.count, 1)) * 100)
    : null;
  const joinDate = m.joined_at ? new Date(m.joined_at) : null;
  const daysActive = joinDate && !isNaN(joinDate.getTime())
    ? Math.round((Date.now() - joinDate.getTime()) / 86400000)
    : 0;

  const skills = m.skills?.split(/[,|]/).map(s => s.trim()).filter(Boolean) ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <ModalShell onClose={onClose} accent={rc} width={560}>
            {/* hero */}
            <div style={{
              padding: "32px 28px 24px",
              background: `linear-gradient(160deg, ${rc}12, transparent 60%)`,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 18, stiffness: 280 }}
                  style={{
                    width: 64, height: 64, borderRadius: 22, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 22, color: "#000",
                    background: `linear-gradient(135deg, ${rc}, ${rc}bb)`,
                    boxShadow: `0 8px 24px ${rc}40`,
                  }}
                >
                  {initials(m.studio_name || m.display_name)}
                </motion.div>
                <div style={{ flex: 1, paddingRight: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                    {m.studio_name || m.display_name}
                  </h2>
                  <p style={{ fontSize: 13, color: "#666", marginTop: 3 }}>@{m.display_name}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {m.role_desc && <Pill label={m.role_desc} color={rc} />}
                    {extra.isAbsent && <Pill label={`Away until ${extra.absentUntil?.slice(0,10)}`} color="#EAB308" />}
                    {!extra.isAbsent && active > 0 && <Pill label="● Active" color="#22C55E" />}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 28px 28px", display: "grid", gap: 12 }}>
              {/* stat row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { label: "Scenes", value: tasks.length, color: "#F97316" },
                  { label: "Done", value: completed, color: "#22C55E" },
                  { label: "Active", value: active, color: "#F97316" },
                  { label: "Review", value: inReview, color: "#3B82F6" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    style={{ borderRadius: 16, padding: "12px 8px", textAlign: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                      <AnimNum to={s.value} />
                    </p>
                    <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555", marginTop: 4 }}>{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* on-time + days */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Field label="On-Time Rate">
                  <p style={{ fontSize: 24, fontWeight: 800, color: onTimeRate != null && onTimeRate >= 80 ? "#22C55E" : "#F97316" }}>
                    {onTimeRate != null ? <AnimNum to={onTimeRate} suffix="%" /> : "—"}
                  </p>
                </Field>
                <Field label="Days Active">
                  <p style={{ fontSize: 24, fontWeight: 800, color: "#F97316" }}>
                    <AnimNum to={daysActive} suffix="d" />
                  </p>
                </Field>
              </div>

              {/* completion bar */}
              {tasks.length > 0 && (
                <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>Completion</span>
                    <span style={{ fontSize: 12, color: "#22C55E", fontFamily: "monospace", fontWeight: 600 }}>
                      {Math.round((completed / tasks.length) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: "#1a1a1a", overflow: "hidden" }}>
                    <motion.div
                      style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #22C55E80, #22C55E)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(completed / tasks.length) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                </div>
              )}

              {m.experience && (
                <Field label="Experience">
                  <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>{m.experience}</p>
                </Field>
              )}

              {skills.length > 0 && (
                <Field label="Skills">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {skills.map((s, i) => (
                      <motion.span
                        key={s}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + i * 0.04 }}
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 999,
                          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "#ccc",
                        }}
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </Field>
              )}

              {m.socials && (
                <Field label="Socials / Links">
                  <p style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>{m.socials}</p>
                </Field>
              )}

              {/* recent tasks */}
              {tasks.length > 0 && (
                <Field label={`Recent Tasks (${tasks.length})`}>
                  <div style={{ display: "grid", gap: 6 }}>
                    {tasks.slice(0, 5).map((t, i) => {
                      const sc = STATUS[t.status] || "#555";
                      return (
                        <motion.div
                          key={t.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 10px", borderRadius: 12,
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 12, color: "#ccc", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.scene}</span>
                          <span style={{ fontSize: 10, color: sc, fontFamily: "monospace", textTransform: "capitalize", whiteSpace: "nowrap" }}>{t.status}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </Field>
              )}

              {/* go to full profile */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  import("@/pages/MemberProfile").then(mod => {
                    mod.setProfileMemberId(m.member_id);
                  });
                  onClose();
                }}
                style={{
                  width: "100%", padding: "12px", borderRadius: 16,
                  background: `${rc}12`, border: `1px solid ${rc}30`,
                  color: rc, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${rc}22`)}
                onMouseLeave={e => (e.currentTarget.style.background = `${rc}12`)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Go to {m.studio_name || m.display_name}'s full profile
              </motion.button>
            </div>
          </ModalShell>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEETING MODAL
// ═══════════════════════════════════════════════════════════════════════════

export function MeetingModal({
  meeting: m, open, onClose,
}: {
  meeting: Meeting | null; open: boolean; onClose: () => void;
}) {
  if (!m) return null;
  const dt = new Date(m.meeting_datetime);
  const isPast = dt < new Date();
  const isSoon = !isPast && (dt.getTime() - Date.now()) < 86400000 * 2;
  const accent = m.cancelled ? "#555" : isSoon ? "#F97316" : isPast ? "#444" : "#3B82F6";

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <ModalShell onClose={onClose} accent={accent}>
            <div style={{ padding: "32px 28px 28px" }}>
              {/* icon + title */}
              <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" }}>
                <motion.div
                  initial={{ rotate: -15, scale: 0.7 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 16 }}
                  style={{
                    width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${accent}18`, border: `1px solid ${accent}30`,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </motion.div>
                <div style={{ flex: 1, paddingRight: 32 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    {m.cancelled && <Pill label="Cancelled" color="#EF4444" />}
                    {isSoon && <Pill label="Soon" color="#F97316" />}
                    {isPast && !m.cancelled && <Pill label="Past" color="#555" />}
                    {!isPast && !m.cancelled && !isSoon && <Pill label="Upcoming" color="#3B82F6" />}
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{m.title}</h2>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {/* date + time */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Field label="Date">
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                      {dt.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </Field>
                  <Field label="Time">
                    <p style={{ fontSize: 15, fontWeight: 700, color: accent }}>
                      {dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </Field>
                </div>

                {m.agenda && (
                  <Field label="Agenda">
                    <p style={{ fontSize: 14, color: "#bbb", lineHeight: 1.65 }}>{m.agenda}</p>
                  </Field>
                )}

                {m.scheduled_by && (
                  <Field label="Scheduled By">
                    <p style={{ fontSize: 14, color: "#ccc" }}>{m.scheduled_by}</p>
                  </Field>
                )}

                {/* countdown */}
                {!isPast && !m.cancelled && (
                  <div style={{ padding: "14px 16px", borderRadius: 16, background: `${accent}0a`, border: `1px solid ${accent}20` }}>
                    <p style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Time Until Meeting</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: accent, fontFamily: "monospace" }}>
                      {(() => {
                        const diff = dt.getTime() - Date.now();
                        const d = Math.floor(diff / 86400000);
                        const h = Math.floor((diff % 86400000) / 3600000);
                        const min = Math.floor((diff % 3600000) / 60000);
                        return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${min}m` : `${min}m`;
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ModalShell>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTE MODAL
// ═══════════════════════════════════════════════════════════════════════════

export function NoteModal({
  note: n, open, onClose, colorAccent = "#F97316",
}: {
  note: Note | null; open: boolean; onClose: () => void; colorAccent?: string;
}) {
  if (!n) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <ModalShell onClose={onClose} accent={colorAccent}>
            <div style={{ padding: "32px 28px 28px" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${colorAccent}18`, border: `1px solid ${colorAccent}30`, fontSize: 20,
                }}>📝</div>
                <div style={{ flex: 1, paddingRight: 32 }}>
                  <p style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Note</p>
                  {n.scene && (
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{n.scene}</h2>
                  )}
                  {n.member_name && (
                    <p style={{ fontSize: 13, color: "#666", marginTop: 2 }}>by {n.member_name}</p>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <Field label="Content">
                  <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7 }}>
                    {n.note_text || n.note || "—"}
                  </p>
                </Field>

                {n.created_at && (
                  <Field label="Created">
                    <p style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>
                      {new Date(n.created_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </Field>
                )}
              </div>
            </div>
          </ModalShell>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK MODAL
// ═══════════════════════════════════════════════════════════════════════════

export function TaskModal({
  task: t, open, onClose,
}: {
  task: Task | null; open: boolean; onClose: () => void;
}) {
  if (!t) return null;
  const sc = STATUS[t.status] || "#555";
  const uc = t.urgency === "overdue" ? "#EF4444" : t.urgency === "critical" ? "#F97316" : "#555";

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <ModalShell onClose={onClose} accent={sc}>
            <div style={{ padding: "32px 28px 28px" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "flex-start" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${sc}18`, border: `1px solid ${sc}30`, fontSize: 20,
                }}>🎬</div>
                <div style={{ flex: 1, paddingRight: 32 }}>
                  <p style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Scene / Task</p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{t.scene}</h2>
                  <p style={{ fontSize: 13, color: "#666", marginTop: 3 }}>Assigned to {t.member_name}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <Pill label={t.status} color={sc} />
                {t.urgency !== "normal" && <Pill label={t.urgency} color={uc} />}
                {t.task_type && <Pill label={t.task_type} color="#888" />}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {t.deadline && (
                    <Field label="Deadline">
                      <p style={{ fontSize: 14, fontWeight: 700, color: t.urgency === "overdue" ? "#EF4444" : "#fff" }}>
                        {new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </Field>
                  )}
                  <Field label="Days Left">
                    <p style={{ fontSize: 22, fontWeight: 800, color: t.days_left != null && t.days_left < 0 ? "#EF4444" : "#F97316", fontFamily: "monospace" }}>
                      {t.days_left == null ? "—" : t.days_left < 0 ? `${Math.abs(t.days_left)}d over` : `${t.days_left}d`}
                    </p>
                  </Field>
                </div>

                {t.revisions > 0 && (
                  <Field label="Revisions">
                    <p style={{ fontSize: 14, color: "#EF4444", fontWeight: 700, fontFamily: "monospace" }}>
                      {t.revisions} revision{t.revisions !== 1 ? "s" : ""}
                    </p>
                  </Field>
                )}

                {t.assigned_by && (
                  <Field label="Assigned By">
                    <p style={{ fontSize: 14, color: "#ccc" }}>{t.assigned_by}</p>
                  </Field>
                )}

                {t.assigned_at && (
                  <Field label="Assigned">
                    <p style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>
                      {new Date(t.assigned_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </Field>
                )}

                {t.completed_at && t.status === "completed" && (
                  <Field label="Completed">
                    <p style={{ fontSize: 13, color: "#22C55E", fontFamily: "monospace" }}>
                      {new Date(t.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </Field>
                )}

                {t.wip_last_posted && (
                  <Field label="WIP Last Posted">
                    <p style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>
                      {new Date(t.wip_last_posted).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </Field>
                )}
              </div>
            </div>
          </ModalShell>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER — wraps app, listens to global openXxx() calls
// ═══════════════════════════════════════════════════════════════════════════

export function EnhancedModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>({ kind: null, payload: null });
  const [memberExtra, setMemberExtra] = useState<MemberExtra>({});

  const close = useCallback(() => setState({ kind: null, payload: null }), []);

  const ctx: EnhancedCtx = {
    openRevision: r  => setState({ kind: "revision", payload: r }),
    openMember:  (m, extra = {}) => { setMemberExtra(extra); setState({ kind: "member", payload: m }); },
    openMeeting:  m => setState({ kind: "meeting", payload: m }),
    openNote:     n => setState({ kind: "note", payload: n }),
    openTask:     t => setState({ kind: "task", payload: t }),
    closeAll: close,
  };

  return (
    <Ctx.Provider value={ctx}>
      {children}

      <RevisionModal
        revision={state.kind === "revision" ? (state.payload as Revision) : null}
        open={state.kind === "revision"}
        onClose={close}
      />
      <MemberModal
        member={state.kind === "member" ? (state.payload as Member) : null}
        extra={memberExtra}
        open={state.kind === "member"}
        onClose={close}
      />
      <MeetingModal
        meeting={state.kind === "meeting" ? (state.payload as Meeting) : null}
        open={state.kind === "meeting"}
        onClose={close}
      />
      <NoteModal
        note={state.kind === "note" ? (state.payload as Note) : null}
        open={state.kind === "note"}
        onClose={close}
      />
      <TaskModal
        task={state.kind === "task" ? (state.payload as Task) : null}
        open={state.kind === "task"}
        onClose={close}
      />
    </Ctx.Provider>
  );
}
