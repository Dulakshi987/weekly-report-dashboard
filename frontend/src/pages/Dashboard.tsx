import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Project } from "../types";

const statusColors: { [key: string]: { bg: string; text: string } } = {
  draft: { bg: "#f3f4f6", text: "#374151" },
  submitted: { bg: "#dbeafe", text: "#1e40af" },
  needs_correction: { bg: "#fef3c7", text: "#92400e" },
  approved: { bg: "#dcfce7", text: "#166534" },
};

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [weekStartFilter, setWeekStartFilter] = useState("");
  const [weekEndFilter, setWeekEndFilter] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadReports();
  }, [statusFilter, projectFilter, weekStartFilter, weekEndFilter]);

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadReports() {
    setLoading(true);
    setError("");
    try {
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (projectFilter) params.project_id = projectFilter;
      if (weekStartFilter) params.week_start = weekStartFilter;
      if (weekEndFilter) params.week_end = weekEndFilter;

      const res = await api.get("/reports", { params });
      setReports(res.data.reports || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  function formatStatus(status: string) {
    return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Summary metrics
  const totalSubmitted = reports.filter((r) => r.status === "submitted").length;
  const needsCorrection = reports.filter((r) => r.status === "needs_correction").length;
  const approved = reports.filter((r) => r.status === "approved").length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>Manager Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.name}</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate("/users")} style={styles.secondaryBtn}>
            Manage Users
          </button>
          <button onClick={() => navigate("/projects")} style={styles.secondaryBtn}>
            Manage Projects
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{totalSubmitted}</div>
          <div style={styles.metricLabel}>Awaiting Review</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{needsCorrection}</div>
          <div style={styles.metricLabel}>Needs Correction</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{approved}</div>
          <div style={styles.metricLabel}>Approved</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{reports.length}</div>
          <div style={styles.metricLabel}>Total Reports</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterInput}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="needs_correction">Needs Correction</option>
          <option value="approved">Approved</option>
        </select>

        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} style={styles.filterInput}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={weekStartFilter}
          onChange={(e) => setWeekStartFilter(e.target.value)}
          style={styles.filterInput}
          title="From week starting"
        />
        <input
          type="date"
          value={weekEndFilter}
          onChange={(e) => setWeekEndFilter(e.target.value)}
          style={styles.filterInput}
          title="To week ending"
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No reports match the selected filters.</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Team Member</th>
              <th style={styles.th}>Week</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Submitted</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const color = statusColors[r.status] || statusColors.draft;
              return (
                <tr key={r.id}>
                  <td style={styles.td}>
                    <Link to={`/team/${r.user_id}`} style={styles.link}>{r.user_name}</Link>
                  </td>
                  <td style={styles.td}>{r.week_start?.slice(0, 10)} → {r.week_end?.slice(0, 10)}</td>
                  <td style={styles.td}>{r.project_name || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: color.bg, color: color.text }}>
                      {formatStatus(r.status)}
                    </span>
                  </td>
                  <td style={styles.td}>{r.submitted_at ? r.submitted_at.slice(0, 10) : "—"}</td>
                  <td style={styles.td}>
                    <Link to={`/reports/${r.id}`} style={styles.link}>
                      {r.status === "submitted" ? "Review" : "View"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  headerActions: { display: "flex", gap: "0.5rem" },
  subtitle: { color: "#666", margin: 0 },
  secondaryBtn: { padding: "0.6rem 1rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" },
  logoutBtn: { padding: "0.6rem 1rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" },
  metricsRow: { display: "flex", gap: "1rem", marginBottom: "1.5rem" },
  metricCard: { flex: 1, background: "#fff", padding: "1.25rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" },
  metricValue: { fontSize: "1.8rem", fontWeight: 700, color: "#1f2937" },
  metricLabel: { fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" },
  filters: { display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" },
  filterInput: { padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  th: { textAlign: "left", padding: "0.75rem", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", fontSize: "0.85rem" },
  td: { padding: "0.75rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  badge: { padding: "0.25rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 500 },
  link: { color: "#2563eb", textDecoration: "none", fontWeight: 500 },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "0.6rem", borderRadius: "4px", marginBottom: "1rem" },
  emptyState: { textAlign: "center", padding: "3rem", background: "#fff", borderRadius: "8px" },
};
