import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ReportDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Manager review state
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${id}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(action: "approved" | "requested_changes") {
    if (action === "requested_changes" && !reviewComment.trim()) {
      alert("Please enter a comment explaining what needs correction");
      return;
    }

    setReviewLoading(true);
    try {
      await api.put(`/reports/${id}/review`, { action, comment: reviewComment });
      alert(`Report ${action === "approved" ? "approved" : "sent back for correction"}!`);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) return <div style={styles.page}>Loading...</div>;
  if (error) return <div style={styles.page}><div style={styles.error}>{error}</div></div>;
  if (!data) return null;

  const { report, tasks, blockers, achievements, hoursBreakdown, versions, comments } = data;
  const isManager = user?.role === "manager";

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

      <div style={styles.headerCard}>
        <h1>Weekly Report</h1>
        <p><strong>Team Member:</strong> {report.user_name}</p>
        <p><strong>Week:</strong> {report.week_start?.slice(0, 10)} → {report.week_end?.slice(0, 10)}</p>
        <p><strong>Project:</strong> {report.project_name || "—"}</p>
        <p><strong>Status:</strong> <span style={styles.statusBadge}>{report.status.replace("_", " ")}</span></p>
      </div>

      {report.latest_comment && (
        <div style={styles.commentBox}>
          <strong>Latest Manager Comment:</strong>
          <p>{report.latest_comment}</p>
        </div>
      )}

      <div style={styles.section}>
        <h3>Tasks Completed</h3>
        {tasks.length === 0 ? (
          <p style={styles.muted}>No tasks added</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Task</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Planned %</th>
                <th style={styles.th}>Actual %</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Time (Planned/Spent)</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t: any) => (
                <tr key={t.id}>
                  <td style={styles.td}>{t.task_name}</td>
                  <td style={styles.td}>{t.priority}</td>
                  <td style={styles.td}>{t.planned_percent}%</td>
                  <td style={styles.td}>{t.actual_percent}%</td>
                  <td style={styles.td}>{t.status}</td>
                  <td style={styles.td}>{t.time_planned_hours}h / {t.time_spent_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.section}>
        <h3>Tasks Planned for Next Week</h3>
        <p>{report.tasks_planned_next_week || <span style={styles.muted}>None</span>}</p>
      </div>

      <div style={styles.section}>
        <h3>Blockers / Challenges</h3>
        {blockers.length === 0 ? (
          <p style={styles.muted}>No blockers reported</p>
        ) : (
          <ul>
            {blockers.map((b: any) => (
              <li key={b.id}>
                {b.description} {b.is_key_issue ? <strong>(Key Issue)</strong> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.section}>
        <h3>Achievements</h3>
        {achievements.length === 0 ? (
          <p style={styles.muted}>No achievements listed</p>
        ) : (
          <ul>
            {achievements.map((a: any) => (
              <li key={a.id}>
                {a.description} {a.is_key_achievement ? <strong>(Key Achievement)</strong> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {hoursBreakdown.length > 0 && (
        <div style={styles.section}>
          <h3>Hours by Task Type</h3>
          <ul>
            {hoursBreakdown.map((h: any) => (
              <li key={h.id}>{h.task_type}: {h.hours}h</li>
            ))}
          </ul>
        </div>
      )}

      {report.notes && (
        <div style={styles.section}>
          <h3>Notes</h3>
          <p>{report.notes}</p>
        </div>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <div style={styles.section}>
          <h3>Version History ({versions.length})</h3>
          <ul>
            {versions.map((v: any, idx: number) => (
              <li key={v.id}>
                Version {versions.length - idx} — submitted {new Date(v.submitted_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review comment history */}
      {comments.length > 0 && (
        <div style={styles.section}>
          <h3>Review History</h3>
          {comments.map((c: any) => (
            <div key={c.id} style={styles.reviewHistoryItem}>
              <strong>{c.manager_name}</strong> — {c.action.replace("_", " ")} on{" "}
              {new Date(c.created_at).toLocaleString()}
              <p>{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Manager review actions */}
      {isManager && report.status === "submitted" && (
        <div style={styles.reviewBox}>
          <h3>Review This Report</h3>
          <textarea
            placeholder="Comment (required if requesting changes)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            style={styles.textarea}
            rows={3}
          />
          <div style={styles.reviewActions}>
            <button
              onClick={() => handleReview("approved")}
              disabled={reviewLoading}
              style={styles.approveBtn}
            >
              Approve
            </button>
            <button
              onClick={() => handleReview("requested_changes")}
              disabled={reviewLoading}
              style={styles.rejectBtn}
            >
              Request Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: "800px", margin: "0 auto", padding: "2rem" },
  backBtn: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", marginBottom: "1rem" },
  headerCard: { background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "1rem" },
  statusBadge: { background: "#dbeafe", color: "#1e40af", padding: "0.2rem 0.6rem", borderRadius: "10px", fontSize: "0.85rem" },
  section: { background: "#fff", padding: "1.25rem", borderRadius: "8px", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.5rem", background: "#f9fafb", fontSize: "0.8rem" },
  td: { padding: "0.5rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.85rem" },
  muted: { color: "#999" },
  commentBox: { background: "#fef3c7", color: "#92400e", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" },
  reviewHistoryItem: { borderBottom: "1px solid #f0f0f0", padding: "0.5rem 0" },
  reviewBox: { background: "#f0f9ff", padding: "1.25rem", borderRadius: "8px", marginTop: "1.5rem" },
  textarea: { width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", marginTop: "0.5rem" },
  reviewActions: { display: "flex", gap: "0.75rem", marginTop: "0.75rem" },
  approveBtn: { padding: "0.6rem 1.2rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  rejectBtn: { padding: "0.6rem 1.2rem", background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "0.6rem", borderRadius: "4px" },
};
