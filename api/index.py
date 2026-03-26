import os
import psycopg2
import psycopg2.extras
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Vercel needs this named exactly "app" at module level — already done above

def get_conn():
    url = os.environ.get("DATABASE_URL") or os.environ.get("SUPABASE_DATABASE_URL")
    if not url:
        return None
    try:
        conn = psycopg2.connect(url, sslmode="require")
        return conn
    except Exception as e:
        print(f"DB connection error: {e}")
        return None

@app.route("/api/debug")
def debug():
    return jsonify({
        "DATABASE_URL": "SET" if os.environ.get("DATABASE_URL") else "NOT SET",
        "status": "python backend running"
    })

@app.route("/api/healthz")
def healthz():
    conn = get_conn()
    if not conn:
        return jsonify({"status": "error", "error": "DATABASE_URL not set"}), 500
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.close()
        return jsonify({"status": "ok", "db": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route("/api/data")
def data():
    conn = get_conn()
    if not conn:
        return jsonify({"error": "DATABASE_URL not set"}), 500
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM tasks")
        tasks = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM members")
        members = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM deliveries")
        deliveries = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM uploads ORDER BY id DESC LIMIT 40")
        uploads = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM absences")
        absences = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM styleguide")
        styleguide = {r["key"]: r["value"] for r in cur.fetchall()}
        cur.execute("SELECT * FROM revisions")
        revisions = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM meetings")
        meetings = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM reminders WHERE sent = false")
        reminders = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM notes ORDER BY id DESC LIMIT 40")
        notes = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM projects WHERE archived = false")
        projects = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM delivery_log ORDER BY id DESC LIMIT 50")
        delivery_log = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()

        from datetime import datetime, timezone

        total = len(tasks)
        completed = sum(1 for t in tasks if t.get("status") == "completed")
        active = sum(1 for t in tasks if t.get("status") == "in progress")
        in_review = sum(1 for t in tasks if t.get("status") == "in review")
        todo = sum(1 for t in tasks if t.get("status") == "todo")
        approved = sum(1 for t in tasks if t.get("status") == "approved")
        percent = round((completed / total) * 100) if total > 0 else 0

        total_on_time = sum(d.get("on_time") or 0 for d in deliveries)
        total_late = sum(d.get("late") or 0 for d in deliveries)
        on_time_rate = round((total_on_time / (total_on_time + total_late)) * 100) if (total_on_time + total_late) > 0 else 0

        absent_ids = [int(a["member_id"]) for a in absences]
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        active_project = next((p for p in projects if p.get("deadline")), None)
        deadline_str = active_project["deadline"] if active_project else "2026-05-31"
        try:
            deadline_dt = datetime.fromisoformat(deadline_str).replace(tzinfo=timezone.utc)
            days_left = (deadline_dt - today).days
            weeks_left = round((days_left / 7) * 10) / 10
        except:
            days_left = None
            weeks_left = None

        serialized_tasks = []
        for t in tasks:
            days = None
            urgency = "ok"
            if t.get("deadline"):
                try:
                    dl = datetime.fromisoformat(str(t["deadline"])).replace(tzinfo=timezone.utc)
                    dl = dl.replace(hour=0, minute=0, second=0, microsecond=0)
                    days = (dl - today).days
                    status = t.get("status", "")
                    if status not in ("completed", "approved"):
                        if days <= 0: urgency = "overdue"
                        elif days <= 2: urgency = "critical"
                        elif days <= 5: urgency = "warning"
                except:
                    pass
            serialized_tasks.append({
                "id": str(t.get("task_id", "")),
                "task_id": str(t.get("task_id", "")),
                "member_id": int(t["member_id"]) if t.get("member_id") else 0,
                "member_name": t.get("member_name", ""),
                "scene": t.get("scene", ""),
                "status": t.get("status", ""),
                "task_type": t.get("task_type"),
                "deadline": str(t.get("deadline") or ""),
                "assigned_at": str(t.get("assigned_at") or ""),
                "assigned_by": t.get("assigned_by"),
                "completed_at": str(t.get("completed_at") or ""),
                "revisions": t.get("revisions") or 0,
                "wip_last_posted": t.get("wip_last_posted"),
                "project_id": t.get("project_id"),
                "days_left": days,
                "urgency": urgency,
            })

        urgency_order = {"overdue": 0, "critical": 1, "warning": 2, "ok": 3}
        serialized_tasks.sort(key=lambda t: urgency_order.get(t["urgency"], 4))

        member_tasks = {}
        for t in serialized_tasks:
            mid = str(t["member_id"])
            if mid not in member_tasks:
                member_tasks[mid] = []
            member_tasks[mid].append(t)

        revision_counts = {}
        for r in revisions:
            scene = r.get("scene", "")
            revision_counts[scene] = revision_counts.get(scene, 0) + 1

        now_ts = datetime.now(timezone.utc)
        upcoming_meetings = [m for m in meetings if not m.get("cancelled") and m.get("meeting_datetime") and datetime.fromisoformat(str(m["meeting_datetime"])).replace(tzinfo=timezone.utc) >= now_ts] if meetings else []

        overdue_count = sum(1 for t in serialized_tasks if t["urgency"] == "overdue")
        avail = (len(members) - len(absent_ids)) / len(members) if members else 1
        rev_rate = len(revisions) / total if total > 0 and revisions else 0
        health_score = 0
        if styleguide.get("locked") == "true": health_score += 20
        health_score += round((on_time_rate / 100) * 30)
        health_score += round((percent / 100) * 20)
        health_score += max(0, 15 - overdue_count * 5)
        health_score += round(avail * 10)
        health_score += 5 if rev_rate < 0.3 else 3 if rev_rate < 0.6 else 1
        if projects: health_score += 5
        health_score = min(100, max(0, health_score))

        return jsonify({
            "stats": {
                "total": total, "completed": completed, "active": active,
                "in_review": in_review, "todo": todo, "approved": approved,
                "percent": percent, "members": len(members),
                "days_left": days_left, "weeks_left": weeks_left,
                "total_on_time": total_on_time, "total_late": total_late,
                "on_time_rate": on_time_rate, "total_revisions": len(revisions),
                "total_uploads": len(uploads), "upcoming_meetings": len(upcoming_meetings),
                "pending_reminders": len(reminders), "absent_count": len(absent_ids),
                "health_score": health_score, "total_projects": len(projects),
                "active_projects": len(projects),
            },
            "tasks": serialized_tasks,
            "members": [{"member_id": int(m["member_id"]), "display_name": m.get("display_name",""), "studio_name": m.get("studio_name"), "role_desc": m.get("role_desc"), "skills": m.get("skills"), "experience": m.get("experience"), "socials": m.get("socials"), "joined_at": str(m.get("joined_at") or "")} for m in members],
            "deliveries": [{"member_id": int(d["member_id"]), "member_name": d.get("member_name",""), "on_time": d.get("on_time") or 0, "late": d.get("late") or 0, "count": d.get("count") or 0} for d in deliveries],
            "delivery_log": [{"id": d["id"], "member_id": int(d["member_id"]) if d.get("member_id") else 0, "scene": d.get("scene"), "on_time": d.get("on_time"), "date": str(d.get("date") or "")} for d in delivery_log],
            "uploads": [{"id": u["id"], "member_id": int(u["member_id"]) if u.get("member_id") else 0, "member_name": u.get("member_name",""), "scene": u.get("scene",""), "file_type": u.get("file_type"), "file_url": u.get("link"), "link": u.get("link"), "notes": u.get("notes"), "uploaded_at": str(u.get("uploaded_at") or "")} for u in uploads],
            "absences": [{"member_id": int(a["member_id"]), "member_name": a.get("member_name",""), "absent_until": str(a.get("absent_until") or ""), "reason": a.get("reason")} for a in absences],
            "absent_ids": absent_ids,
            "styleguide": styleguide,
            "revisions": [{"id": str(r.get("revision_id","")), "revision_id": str(r.get("revision_id","")), "member_id": int(r["member_id"]) if r.get("member_id") else 0, "member_name": r.get("member_name"), "scene": r.get("scene",""), "notes": r.get("reason"), "reason": r.get("reason"), "priority": r.get("priority","medium"), "sent_by": r.get("sent_by"), "date": str(r.get("date") or ""), "revision_number": r.get("revision_number")} for r in revisions],
            "meetings": [{"id": str(m.get("meeting_id","")), "meeting_id": str(m.get("meeting_id","")), "title": m.get("title",""), "date": m.get("date"), "time": m.get("time"), "meeting_datetime": str(m.get("meeting_datetime") or ""), "agenda": m.get("agenda"), "scheduled_by": m.get("scheduled_by"), "cancelled": m.get("cancelled") or False} for m in meetings],
            "reminders": [{"id": r["id"], "message": r.get("message",""), "remind_at": str(r.get("remind_at") or ""), "sent": r.get("sent") or False, "target_name": r.get("target_name"), "created_by_name": r.get("created_by_name")} for r in reminders],
            "notes": [{"id": n["id"], "member_id": int(n["member_id"]) if n.get("member_id") else 0, "member_name": n.get("member_name"), "scene": n.get("scene"), "note_text": n.get("note",""), "note": n.get("note",""), "created_at": str(n.get("created_at") or "")} for n in notes],
            "projects": [{"project_id": p.get("project_id"), "name": p.get("name",""), "stage": p.get("stage"), "deadline": str(p.get("deadline") or ""), "description": p.get("description"), "created_by": p.get("created_by"), "created_at": str(p.get("created_at") or ""), "archived": p.get("archived") or False} for p in projects],
            "member_tasks": member_tasks,
            "revision_counts": revision_counts,
            "activity":
            "activity": sorted([
    *[{"type": "assigned", "text": f"{t['member_name']} assigned to {t['scene']}", "date": t["assigned_at"], "icon": "🎯", "color": "amber"} for t in serialized_tasks[:20] if t.get("assigned_at")],
    *[{"type": "completed", "text": f"{t['member_name']} completed {t['scene']}", "date": t["completed_at"], "icon": "✅", "color": "green"} for t in serialized_tasks[:20] if t.get("status") == "completed" and t.get("completed_at")],
    *[{"type": "revision", "text": f"Revision on {r.get('scene')} — {r.get('priority','medium')} priority", "date": str(r.get("date") or ""), "icon": "🔄", "color": "red"} for r in revisions[:10]],
    *[{"type": "upload", "text": f"{u.get('member_name')} uploaded {u.get('file_type') or 'file'} for {u.get('scene')}", "date": str(u.get("uploaded_at") or ""), "icon": "📎", "color": "blue"} for u in uploads[:10]],
    *[{"type": "member", "text": f"{m.get('studio_name') or m.get('display_name')} joined the studio", "date": str(m.get("joined_at") or ""), "icon": "👤", "color": "green"} for m in members if m.get("joined_at")],
    *[{"type": "project", "text": f"Project \"{p.get('name')}\" created", "date": str(p.get("created_at") or ""), "icon": "🎬", "color": "amber"} for p in projects if p.get("created_at")],
    *([{"type": "styleguide", "text": "Styleguide locked 🔒", "date": "", "icon": "🔒", "color": "purple"}] if styleguide.get("locked") == "true" else []),
], key=lambda x: x["date"], reverse=True)[:25],
        })

    except Exception as e:
        import traceback
        print(f"❌ /api/data error: {e}\n{traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500
