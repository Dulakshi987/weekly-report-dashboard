import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Report } from "../types";

const statusColors: { [key: string]: { bg: string; text: string } } = {
  draft: { bg: "#f3f4f6", text: "#374151" },
  submitted: { bg: "#dbeafe", text: "#1e40af" },
  needs_correction: { bg: "#fef3c7", text: "#92400e" },
  approved: { bg: "#dcfce7", text: "#166534" },
};

export default function ReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await api.get("/reports/my");
      setReports(res.data.reports || []);
    } catch (err: any) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  function formatStatus(status: string) {
    return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>My Weekly Reports</h1>
          <p style={styles.subtitle}>Welcome, {user?.name}</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate("/reports/new")} style={styles.newBtn}>
            + New Report
          </button>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <div style={styles.emptyState}>
          <p>You haven't created any reports yet.</p>
          <button onClick={() => navigate("/reports/new")} style={styles.newBtn}>
            Create your first report
          </button>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Week</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Submitted</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const color = statusColors[r.status] || statusColors.draft;
              return (
                <tr key={r.id}>
                  <td style={styles.td}>
                    {r.week_start?.slice(0, 10)} → {r.week_end?.slice(0, 10)}
                  </td>
                  <td style={styles.td}>{r.project_name || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: color.bg, color: color.text }}>
                      {formatStatus(r.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {r.submitted_at ? r.submitted_at.slice(0, 10) : "—"}
                  </td>
                  <td style={styles.td}>
                    <Link to={`/reports/${r.id}`} style={styles.link}>
                      View
                    </Link>
                    {(r.status === "draft" || r.status === "needs_correction") && (
                      <>
                        {" | "}
                        <Link to={`/reports/${r.id}/edit`} style={styles.link}>
                          Edit
                        </Link>
                      </>
                    )}
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
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  headerActions: { display: "flex", gap: "0.5rem" },
  subtitle: { color: "#666", margin: 0 },
  newBtn: { padding: "0.6rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  logoutBtn: { padding: "0.6rem 1.2rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  th: { textAlign: "left", padding: "0.75rem", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", fontSize: "0.85rem", color: "#374151" },
  td: { padding: "0.75rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  badge: { padding: "0.25rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 500 },
  link: { color: "#2563eb", textDecoration: "none" },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "0.6rem", borderRadius: "4px", marginBottom: "1rem" },
  emptyState: { textAlign: "center", padding: "3rem", background: "#fff", borderRadius: "8px" },
};
