import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const PAGE_SIZE = 10;

const statusMeta = {
  draft: { dot: "#9CA3AF", text: "#374151", label: "Draft" },
  submitted: { dot: "#2563EB", text: "#1E40AF", label: "Submitted" },
  needs_correction: {
    dot: "#D97706",
    text: "#92400E",
    label: "Needs correction",
  },
  approved: { dot: "#16A34A", text: "#166534", label: "Approved" },
};

export default function TeamMemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    loadProfile(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page]);

  useEffect(() => {
    setPage(1);
  }, [id]);

  async function loadProfile(pageNum) {
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}/profile`, {
        params: { page: pageNum, limit: PAGE_SIZE },
      });
      setUser(res.data.user);
      setStats(res.data.stats);
      setReports(res.data.reports || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalReports(res.data.total ?? (res.data.reports || []).length);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
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

  if (!user || !stats) return null;

  const statItems = [
    { value: stats.totalReports, label: "Total reports" },
    { value: stats.approvedCount, label: "Approved" },
    { value: stats.needsCorrectionCount, label: "Needs correction" },
    { value: `${stats.complianceRate}%`, label: "Approval rate" },
  ];

  const initials = (user.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(15, 23, 42, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.06)";
          }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.identity}>
            <div style={styles.avatarWrap}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarFallback}>{initials}</div>
              )}
            </div>
            <div>
              <h1 style={styles.name}>{user.name}</h1>
              <p style={styles.email}>{user.email}</p>
            </div>
          </div>

          <span style={styles.roleTag}>{user.role.replace("_", " ")}</span>
        </div>

        {/* Stat strip */}
        <div style={styles.statStrip}>
          {statItems.map((s, i) => (
            <div
              key={s.label}
              style={{
                ...styles.statCell,
                borderLeft: i === 0 ? "none" : "1px solid #E2E5EC",
              }}
            >
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Report history */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Report history</h2>

          {reports.length === 0 ? (
            <p className="text-muted">No reports submitted yet.</p>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>&nbsp;</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((r) => {
                    const meta = statusMeta[r.status] || statusMeta.draft;
                    return (
                      <tr key={r.id}>
                        <td>
                          {r.week_start?.slice(5, 10)} – {r.week_end?.slice(5, 10)}
                        </td>
                        <td>{r.project_name || "—"}</td>
                        <td>
                          <span style={styles.statusWrap}>
                            <span style={{ ...styles.statusDot, background: meta.dot }} />
                            <span style={{ color: meta.text }}>{meta.label}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => navigate(`/reports/${r.id}`)}
                            style={styles.viewBtn}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={styles.pagination}>
                <span style={styles.pageInfo}>
                  Page {page} of {totalPages} · {totalReports} total
                </span>

                <div style={styles.pageButtons}>
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    style={{ ...styles.pageBtn, ...(page <= 1 ? styles.pageBtnDisabled : {}) }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    style={{ ...styles.pageBtn, ...(page >= totalPages ? styles.pageBtnDisabled : {}) }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  page: {
    maxWidth: "880px",
    margin: "0 auto",
  },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#2563eb",
    fontFamily: "inherit",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: "0.5rem 1.1rem",
    borderRadius: "999px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    marginBottom: "1.25rem",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: "1.25rem",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #E2E5EC",
  },

  identity: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  avatarWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    border: "1px solid #E2E5EC",
  },

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  avatarFallback: {
    width: "100%",
    height: "100%",
    background: "#F1F4FC",
    color: "#3B4B8C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 700,
  },

  name: {
    fontFamily: "inherit",
    fontWeight: 800,
    fontSize: "1.75rem",
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: "-0.01em",
    color: "#0f172a",
  },

  email: {
    fontFamily: "inherit",
    color: "#616B7A",
    fontSize: "0.9rem",
    margin: "0.35rem 0 0",
  },

  roleTag: {
    fontFamily: "inherit",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#3B4B8C",
    border: "1px solid #C7D0E8",
    background: "#F1F4FC",
    padding: "0.25rem 0.65rem",
    borderRadius: "999px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  statStrip: {
    display: "flex",
    background: "#FFFFFF",
    border: "1px solid #E2E5EC",
    borderRadius: "6px",
    marginBottom: "2rem",
  },

  statCell: {
    flex: 1,
    padding: "1.1rem 1.25rem",
  },

  statValue: {
    fontFamily: "inherit",
    fontVariantNumeric: "tabular-nums",
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: 1,
    color: "#0f172a",
  },

  statLabel: {
    fontFamily: "inherit",
    marginTop: "0.4rem",
    fontSize: "0.78rem",
    color: "#616B7A",
  },

  section: {
    background: "#FFFFFF",
    border: "1px solid #E2E5EC",
    borderRadius: "6px",
    padding: "1.5rem",
  },

  sectionTitle: {
    fontFamily: "inherit",
    fontSize: "1rem",
    fontWeight: 700,
    margin: "0 0 1rem",
    color: "#0f172a",
  },

  statusWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    fontFamily: "inherit",
    fontSize: "0.85rem",
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    display: "inline-block",
  },

  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontFamily: "inherit",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.25rem",
    paddingTop: "1rem",
    borderTop: "1px solid #EEF0F4",
  },

  pageInfo: {
    fontFamily: "inherit",
    fontSize: "0.8rem",
    color: "#616B7A",
  },

  pageButtons: {
    display: "flex",
    gap: "0.5rem",
  },

  pageBtn: {
    fontFamily: "inherit",
    padding: "0.4rem 0.9rem",
    background: "#FFFFFF",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 600,
  },

  pageBtnDisabled: {
    color: "#B7BEC9",
    borderColor: "#E2E5EC",
    cursor: "not-allowed",
  },
};
