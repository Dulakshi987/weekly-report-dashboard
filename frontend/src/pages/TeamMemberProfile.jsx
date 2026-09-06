
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination state (applies to the report history table only)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    loadProfile(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page]);

  // Reset back to page 1 whenever a different team member is opened
  useEffect(() => {
    setPage(1);
  }, [id]);

  async function loadProfile(pageNum) {
    setLoading(true);

    try {
      const res = await api.get(`/users/${id}/profile`, {
        params: {
          page: pageNum,
          limit: PAGE_SIZE,
        },
      });

      setUser(res.data.user);
      setStats(res.data.stats);
      setReports(res.data.reports || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalReports(
        res.data.total ?? (res.data.reports || []).length
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load profile"
      );
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
        <FontLoader />
        <p style={styles.muted}>Loading…</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <FontLoader />
        <div style={styles.errorBanner}>{error}</div>
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
      <FontLoader />

      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.identity}>
            <div style={styles.avatarWrap}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  style={styles.avatarImg}
                />
              ) : (
                <div style={styles.avatarFallback}>{initials}</div>
              )}
            </div>

            <div>
              <h1 style={styles.name}>{user.name}</h1>
              <p style={styles.email}>{user.email}</p>
            </div>
          </div>

          <span style={styles.roleTag}>
            {user.role.replace("_", " ")}
          </span>
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
            <p style={styles.muted}>No reports submitted yet.</p>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Week</th>
                    <th style={styles.th}>Project</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>
                      &nbsp;
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((r) => {
                    const meta =
                      statusMeta[r.status] || statusMeta.draft;

                    return (
                      <tr key={r.id} className="tmp-row">
                        <td style={{ ...styles.td, ...styles.mono }}>
                          {r.week_start?.slice(5, 10)} –{" "}
                          {r.week_end?.slice(5, 10)}
                        </td>

                        <td style={styles.td}>
                          {r.project_name || "—"}
                        </td>

                        <td style={styles.td}>
                          <span style={styles.statusWrap}>
                            <span
                              style={{
                                ...styles.statusDot,
                                background: meta.dot,
                              }}
                            />
                            <span style={{ color: meta.text }}>
                              {meta.label}
                            </span>
                          </span>
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                          }}
                        >
                          <Link to={`/reports/${r.id}`} style={styles.link}>
                            View
                          </Link>
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
                    className="tmp-page-btn"
                    style={{
                      ...styles.pageBtn,
                      ...(page <= 1 ? styles.pageBtnDisabled : {}),
                    }}
                  >
                    Previous
                  </button>

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="tmp-page-btn"
                    style={{
                      ...styles.pageBtn,
                      ...(page >= totalPages
                        ? styles.pageBtnDisabled
                        : {}),
                    }}
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

/* Loads the two typefaces once and defines the small interactive states
   that inline styles can't express (row hover, button hover/focus). */
function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

      .tmp-row td { transition: background 120ms ease; }
      .tmp-row:hover td { background: #FAFBFC; }

      .tmp-page-btn:hover:not(:disabled) {
        background: #3B4B8C !important;
        color: #fff !important;
      }
      .tmp-page-btn:focus-visible {
        outline: 2px solid #3B4B8C;
        outline-offset: 2px;
      }
    `}</style>
  );
}

const styles = {
  page: {
    maxWidth: "880px",
    margin: "0 auto",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#1A2233",
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
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.95rem",
    fontWeight: 500,
  },

  name: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 500,
    fontSize: "2rem",
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: "-0.01em",
  },

  email: {
    color: "#616B7A",
    fontSize: "0.9rem",
    margin: "0.35rem 0 0",
  },

  roleTag: {
    fontSize: "0.75rem",
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
    fontFamily: "'IBM Plex Mono', monospace",
    fontVariantNumeric: "tabular-nums",
    fontSize: "1.5rem",
    fontWeight: 500,
    lineHeight: 1,
  },

  statLabel: {
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
    fontSize: "1rem",
    fontWeight: 600,
    margin: "0 0 1rem",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "0.5rem 0.6rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#616B7A",
    borderBottom: "1px solid #E2E5EC",
  },

  td: {
    padding: "0.7rem 0.6rem",
    borderBottom: "1px solid #EEF0F4",
    fontSize: "0.88rem",
  },

  mono: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontVariantNumeric: "tabular-nums",
    fontSize: "0.82rem",
    color: "#414A58",
  },

  statusWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    fontSize: "0.85rem",
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    display: "inline-block",
  },

  link: {
    color: "#3B4B8C",
    fontWeight: 500,
    fontSize: "0.85rem",
    textDecoration: "none",
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
    fontSize: "0.8rem",
    color: "#616B7A",
    fontFamily: "'IBM Plex Mono', monospace",
  },

  pageButtons: {
    display: "flex",
    gap: "0.5rem",
  },

  pageBtn: {
    padding: "0.4rem 0.9rem",
    background: "#FFFFFF",
    color: "#3B4B8C",
    border: "1px solid #3B4B8C",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
  },

  pageBtnDisabled: {
    color: "#B7BEC9",
    borderColor: "#E2E5EC",
    cursor: "not-allowed",
  },

  muted: {
    color: "#9CA3AF",
    fontSize: "0.9rem",
  },

  errorBanner: {
    background: "#FEF2F2",
    color: "#B91C1C",
    border: "1px solid #FECACA",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    fontSize: "0.9rem",
  },
};
