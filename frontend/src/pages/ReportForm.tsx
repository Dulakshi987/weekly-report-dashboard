import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Project } from "../types";

export default function ReportForm() {
  const { id } = useParams(); // present when editing an existing report
  const isEditMode = Boolean(id);

  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tasksPlanned, setTasksPlanned] = useState("");
  const [notes, setNotes] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<string>("draft");
  const [latestComment, setLatestComment] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Load projects for dropdown
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.get("/projects");
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    }
    loadProjects();
  }, []);

  // If editing, load existing report data
  useEffect(() => {
    if (!isEditMode) return;

    async function loadReport() {
      try {
        const res = await api.get(`/reports/${id}`);
        const r = res.data.report;
        setWeekStart(r.week_start?.slice(0, 10));
        setWeekEnd(r.week_end?.slice(0, 10));
        setProjectId(r.project_id || "");
        setTasksPlanned(r.tasks_planned_next_week || "");
        setNotes(r.notes || "");
        setStatus(r.status);
        setLatestComment(r.latest_comment);
      } catch (err: any) {
        setError("Failed to load report");
      }
    }
    loadReport();
  }, [id, isEditMode]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!weekStart || !weekEnd) {
      setError("Week start and end dates are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        week_start: weekStart,
        week_end: weekEnd,
        project_id: projectId || null,
        tasks_planned_next_week: tasksPlanned,
        notes,
      };

      if (isEditMode) {
        await api.put(`/reports/${id}`, payload);
        setSuccess("Report updated (saved as draft)");
      } else {
        const res = await api.post("/reports", payload);
        setSuccess("Report created as draft");
        setTimeout(() => navigate(`/reports/${res.data.reportId}/edit`), 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save report");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitForReview() {
    if (!id) {
      setError("Save the report as draft first before submitting");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.put(`/reports/${id}/submit`);
      setSuccess("Report submitted for manager review!");
      setTimeout(() => navigate("/my-reports"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }

  const canEdit = !isEditMode || status === "draft" || status === "needs_correction";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>{isEditMode ? "Edit Weekly Report" : "New Weekly Report"}</h1>
        <button onClick={() => navigate("/my-reports")} style={styles.backBtn}>
          ← Back to My Reports
        </button>
      </div>

      {latestComment && status === "needs_correction" && (
        <div style={styles.commentBox}>
          <strong>Manager's comment (needs correction):</strong>
          <p>{latestComment}</p>
        </div>
      )}

      {!canEdit && (
        <div style={styles.infoBox}>
          This report is <strong>{status}</strong> and can no longer be edited.
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Week Start</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              disabled={!canEdit}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Week End</label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              disabled={!canEdit}
              style={styles.input}
            />
          </div>
        </div>

        <label style={styles.label}>Project / Category</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          disabled={!canEdit}
          style={styles.input}
        >
          <option value="">-- Select project --</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label style={styles.label}>Tasks Planned for Next Week</label>
        <textarea
          value={tasksPlanned}
          onChange={(e) => setTasksPlanned(e.target.value)}
          disabled={!canEdit}
          style={styles.textarea}
          rows={4}
        />

        <label style={styles.label}>Notes / Links (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
          style={styles.textarea}
          rows={3}
        />

        {canEdit && (
          <div style={styles.actions}>
            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? "Saving..." : "Save as Draft"}
            </button>
            {isEditMode && (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={loading}
                style={styles.submitBtn}
              >
                Submit for Review
              </button>
            )}
          </div>
        )}
      </form>

      <p style={styles.note}>
        Note: Task-level details, blockers, and achievements can be added after saving the draft.
      </p>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: "700px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  backBtn: { background: "none", border: "none", color: "#2563eb", cursor: "pointer" },
  form: { background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  row: { display: "flex", gap: "1rem" },
  field: { flex: 1 },
  label: { display: "block", marginTop: "0.75rem", marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: 500 },
  input: { width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "inherit" },
  actions: { display: "flex", gap: "0.75rem", marginTop: "1.5rem" },
  saveBtn: { padding: "0.6rem 1.2rem", background: "#6b7280", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  submitBtn: { padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "0.6rem", borderRadius: "4px", marginBottom: "1rem" },
  success: { background: "#dcfce7", color: "#166534", padding: "0.6rem", borderRadius: "4px", marginBottom: "1rem" },
  commentBox: { background: "#fef3c7", color: "#92400e", padding: "1rem", borderRadius: "4px", marginBottom: "1rem" },
  infoBox: { background: "#e0f2fe", color: "#075985", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem" },
  note: { marginTop: "1rem", fontSize: "0.85rem", color: "#666" },
};
