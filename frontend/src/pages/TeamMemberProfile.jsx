
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const statusColors = {
  draft: { bg: "#f3f4f6", text: "#374151" },
  submitted: { bg: "#dbeafe", text: "#1e40af" },
  needs_correction: { bg: "#fef3c7", text: "#92400e" },
  approved: { bg: "#dcfce7", text: "#166534" },
};

export default function TeamMemberProfile() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);

    try {
      const res = await api.get(`/users/${id}/profile`);
      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted">Loading...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-error">{error}</div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { user, reports, stats } = data;

  return (
    <DashboardLayout>
      <div style={styles.headerCard}>
        <h1>{user.name}</h1>

        <p style={styles.email}>{user.email}</p>

        <span style={styles.roleBadge}>
          {user.role.replace("_", " ")}
        </span>
      </div>

      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {stats.totalReports}
          </div>

          <div style={styles.metricLabel}>
            Total Reports
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {stats.approvedCount}
          </div>

          <div style={styles.metricLabel}>
            Approved
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {stats.needsCorrectionCount}
          </div>

          <div style={styles.metricLabel}>
            Needs Correction
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricValue}>
            {stats.complianceRate}%
          </div>

          <div style={styles.metricLabel}>
            Approval Rate
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Report History</h3>

        {reports.length === 0 ? (
          <p style={styles.muted}>
            No reports submitted yet
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Week</th>
                <th style={styles.th}>Project</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => {
                const color =
                  statusColors[r.status] ||
                  statusColors.draft;

                return (
                  <tr key={r.id}>
                    <td style={styles.td}>
                      {r.week_start?.slice(0, 10)} →{" "}
                      {r.week_end?.slice(0, 10)}
                    </td>

                    <td style={styles.td}>
                      {r.project_name || "—"}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: color.bg,
                          color: color.text,
                        }}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <Link
                        to={`/reports/${r.id}`}
                        style={styles.link}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginBottom: "1rem",
  },

  headerCard: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "1rem",
  },

  email: {
    color: "#666",
    margin: "0.25rem 0",
  },

  roleBadge: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "0.2rem 0.6rem",
    borderRadius: "10px",
    fontSize: "0.8rem",
  },

  metricsRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },

  metricCard: {
    flex: 1,
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  metricValue: {
    fontSize: "1.6rem",
    fontWeight: 700,
  },

  metricLabel: {
    fontSize: "0.8rem",
    color: "#666",
  },

  section: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "0.5rem",
    background: "#f9fafb",
    fontSize: "0.8rem",
  },

  td: {
    padding: "0.5rem",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "0.85rem",
  },

  badge: {
    padding: "0.2rem 0.5rem",
    borderRadius: "10px",
    fontSize: "0.75rem",
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
  },

  muted: {
    color: "#999",
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "0.6rem",
    borderRadius: "4px",
  },
};

