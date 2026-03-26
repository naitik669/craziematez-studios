import os
import psycopg2
import psycopg2.extras
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_conn():
    url = os.environ.get("DATABASE_URL")
    if not url:
        return None
    try:
        conn = psycopg2.connect(url, sslmode="require")
        return conn
    except Exception as e:
        print(f"DB connection error: {e}")
        return None

def query(sql, params=None):
    conn = get_conn()
    if not conn:
        return None
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or ())
            return [dict(r) for r in cur.fetchall()]
    except Exception as e:
        print(f"Query error: {e}")
        return None
    finally:
        conn.close()

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
        return jsonify({"status": "error", "error": "Database not initialised — check DATABASE_URL env var"}), 500
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.close()
        return jsonify({"status": "ok", "db": "connected ✅"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route("/api/data")
def data():
    conn = get_conn()
    if not conn:
        return jsonify({"error": "Database not initialised — check DATABASE_URL env var"}), 500

    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("SELECT * FROM tasks")
        tasks = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM members")
        members = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM deliveries")
        deliveries = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM uploads")
        uploads = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM absences")
        absences = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM styleguide")
        styleguide_rows = [dict(r) for r in cur.fetchall()]
        styleguide = {r["key"]: r["value"] for r in styleguide_rows}

        cur.execute("SELECT * FROM revisions")
        revisions = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM meetings")
        meetings = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM reminders WHERE sent = false")
        reminders = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM notes")
        notes = [dict(r) for r in cur.fetchall()]

        cur.execute("SELECT * FROM projects WHERE archived = false")
        projects = [dict(r) for r in cur.fetchall()]

        cur.close()
        conn.close()

       return jsonify({
    "stats": {
        "total_tasks": len(tasks),
        "members": len(members),
        "projects": len(projects),
        "completed": 0,
        "active": 0,
        "in_review": 0,
        "todo": 0,
        "approved": 0,
        "percent": 0,
        "days_left": None,
        "weeks_left": None,
        "total_on_time": 0,
        "total_late": 0,
        "on_time_rate": 0,
        "total_revisions": len(revisions),
        "total_uploads": len(uploads),
        "upcoming_meetings": len(meetings),
        "pending_reminders": len(reminders),
        "absent_count": len(absences),
        "health_score": 100,
        "total_projects": len(projects),
        "active_projects": len(projects),
    },
    "tasks": tasks,
    "members": [{**m, "member_id": str(m["member_id"])} for m in members],
    "deliveries": deliveries,
    "delivery_log": [],
    "uploads": uploads,
    "absences": absences,
    "absent_ids": [],
    "styleguide": styleguide,
    "revisions": revisions,
    "meetings": meetings,
    "reminders": reminders,
    "notes": notes,
    "projects": projects,
    "member_tasks": {},
    "revision_counts": {},
    "activity": [],
})
