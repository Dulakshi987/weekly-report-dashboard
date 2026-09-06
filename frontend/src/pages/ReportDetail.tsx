import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const ROWS_PER_PAGE = 10;

const statusColors: { [key: string]: { bg: string; text: string; border: string; dot: string } } = {
  draft: { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1", dot: "#64748b" },
  submitted: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd", dot: "#2563eb" },
  needs_correction: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", dot: "#d97706" },
  approved: { bg: "#dcfce7", text: "#166534", border: "#86efac", dot: "#16a34a" },
};

function usePagedList<T>(items: T[], pageSize: number = ROWS_PER_PAGE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);
  return { page, setPage, totalPages, paginated };
}

export default function ReportDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const tasks = data?.tasks || [];
  const blockers = data?.blockers || [];
  const achievements = data?.achievements || [];
  const hoursBreakdown = data?.hoursBreakdown || [];
  const versions = data?.versions || [];
  const comments = data?.comments || [];

  const taskPager = usePagedList(tasks);
  const blockerPager = usePagedList(blockers);
  const achievementPager = usePagedList(achievements);
  const hoursPager = usePagedList(hoursBreakdown);
  const versionPager = usePagedList(versions);
  const commentPager = usePagedList(comments);

  if (loading)
    return (
      <DashboardLayout>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={styles.muted}>Loading report...</p>
        </div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div style={styles.errorBox}>{error}</div>
      </DashboardLayout>
    );

  if (!data) return null;

  const { report } = data;
  const isManager = user?.role === "manager";
  const statusStyle = statusColors[report.status] || statusColors.draft;

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#1d4ed8";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(15, 23, 42, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#334155";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.06)";
          }}
        >
          <span style={{ fontSize: "1rem" }}>←</span> Back
        </button>

        {/* Header */}
        <div style={styles.headerCard}>
          <div style={styles.headerAccentBar} />
          <div style={styles.headerTop}>
            <div>
              <p style={styles.headerEyebrow}>Weekly Report</p>
              <h1 style={styles.headerTitle}>
                {report.week_start?.slice(0, 10)} <span style={styles.arrow}>→</span> {report.week_end?.slice(0, 10)}
              </h1>
            </div>
            <span
              style={{
                ...styles.statusBadge,
                background: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`,
              }}
            >
              <span style={{ ...styles.statusDot, background: statusStyle.dot }} />
              {report.status.replace("_", " ")}
            </span>
          </div>

          <div style={styles.headerMetaGrid}>
            <div style={styles.headerMetaItem}>
              <span style={styles.headerMetaLabel}>Team Member</span>
              <span style={styles.headerMetaValue}>{report.user_name}</span>
            </div>
            <div style={styles.headerMetaItem}>
              <span style={styles.headerMetaLabel}>Project</span>
              <span style={styles.headerMetaValue}>{report.project_name || "—"}</span>
            </div>
          </div>
        </div>

        {report.latest_comment && (
          <div style={styles.commentBox}>
            <div style={styles.commentIcon}>!</div>
            <div>
              <strong style={{ color: "#92400e", fontSize: "0.95rem" }}>Latest Manager Comment</strong>
              <p style={{ margin: "0.3rem 0 0", color: "#78350f", lineHeight: 1.5 }}>{report.latest_comment}</p>
            </div>
          </div>
        )}

        {/* Tasks Completed */}
        <div style={styles.section}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionTitle}>Tasks Completed</h3>
            {tasks.length > 0 && <span style={styles.countPill}>{tasks.length}</span>}
          </div>

          {tasks.length === 0 ? (
            <p style={styles.muted}>No tasks added</p>
          ) : (
            <>
              <div style={styles.tableWrap}>
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
                    {taskPager.paginated.map((t: any, idx: number) => (
                      <tr key={t.id} style={idx % 2 === 1 ? styles.trAlt : undefined} className="report-row">
                        <td style={{ ...styles.td, fontWeight: 600, color: "#0f172a" }}>{t.task_name}</td>
                        <td style={styles.td}>
                          <span style={priorityBadgeStyle(t.priority)}>{t.priority}</span>
                        </td>
                        <td style={styles.td}>{t.planned_percent}%</td>
                        <td style={styles.td}>{t.actual_percent}%</td>
                        <td style={styles.td}>
                          <span style={statusPillStyle(t.status)}>{t.status}</span>
                        </td>
                        <td style={styles.td}>
                          {t.time_planned_hours}h <span style={styles.slash}>/</span> {t.time_spent_hours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tasks.length > ROWS_PER_PAGE && (
                <Pagination
                  page={taskPager.page}
                  totalPages={taskPager.totalPages}
                  onChange={taskPager.setPage}
                  totalItems={tasks.length}
                  pageSize={ROWS_PER_PAGE}
                />
              )}
            </>
          )}
        </div>

        {/* Tasks Planned for Next Week */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Tasks Planned for Next Week</h3>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={{ ...styles.td, color: "#334155" }}>
                    {report.tasks_planned_next_week || <span style={styles.muted}>None</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Blockers / Challenges */}
        <div style={styles.section}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionTitle}>Blockers / Challenges</h3>
            {blockers.length > 0 && <span style={styles.countPill}>{blockers.length}</span>}
          </div>
          {blockers.length === 0 ? (
            <p style={styles.muted}>No blockers reported</p>
          ) : (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Key Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockerPager.paginated.map((b: any, idx: number) => (
                      <tr key={b.id} style={idx % 2 === 1 ? styles.trAlt : undefined}>
                        <td style={styles.td}>{(blockerPager.page - 1) * ROWS_PER_PAGE + idx + 1}</td>
                        <td style={{ ...styles.td, color: "#0f172a" }}>{b.description}</td>
                        <td style={styles.td}>
                          {Boolean(b.is_key_issue) ? (
                            <span style={styles.keyTag}>Key Issue</span>
                          ) : (
                            <span style={styles.muted}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {blockers.length > ROWS_PER_PAGE && (
                <Pagination
                  page={blockerPager.page}
                  totalPages={blockerPager.totalPages}
                  onChange={blockerPager.setPage}
                  totalItems={blockers.length}
                  pageSize={ROWS_PER_PAGE}
                />
              )}
            </>
          )}
        </div>

        {/* Achievements */}
        <div style={styles.section}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionTitle}>Achievements</h3>
            {achievements.length > 0 && <span style={styles.countPill}>{achievements.length}</span>}
          </div>
          {achievements.length === 0 ? (
            <p style={styles.muted}>No achievements listed</p>
          ) : (
            <>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#</th>
                      <th style={styles.th}>Description</th>
                      <th style={styles.th}>Key Achievement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievementPager.paginated.map((a: any, idx: number) => (
                      <tr key={a.id} style={idx % 2 === 1 ? styles.trAlt : undefined}>
                        <td style={styles.td}>{(achievementPager.page - 1) * ROWS_PER_PAGE + idx + 1}</td>
                        <td style={{ ...styles.td, color: "#0f172a" }}>{a.description}</td>
                        <td style={styles.td}>
                          {Boolean(a.is_key_achievement) ? (
                            <span style={styles.keyTagGreen}>Key Achievement</span>
                          ) : (
                            <span style={styles.muted}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {achievements.length > ROWS_PER_PAGE && (
                <Pagination
                  page={achievementPager.page}
                  totalPages={achievementPager.totalPages}
                  onChange={achievementPager.setPage}
                  totalItems={achievements.length}
                  pageSize={ROWS_PER_PAGE}
                />
              )}
            </>
          )}
        </div>

        {/* Hours by Task Type */}
        {hoursBreakdown.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Hours by Task Type</h3>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Task Type</th>
                    <th style={styles.th}>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {hoursPager.paginated.map((h: any, idx: number) => (
                    <tr key={h.id} style={idx % 2 === 1 ? styles.trAlt : undefined}>
                      <td style={{ ...styles.td, color: "#0f172a", fontWeight: 600 }}>{h.task_type}</td>
                      <td style={styles.td}>{h.hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hoursBreakdown.length > ROWS_PER_PAGE && (
              <Pagination
                page={hoursPager.page}
                totalPages={hoursPager.totalPages}
                onChange={hoursPager.setPage}
                totalItems={hoursBreakdown.length}
                pageSize={ROWS_PER_PAGE}
              />
            )}
          </div>
        )}

        {/* Notes */}
        {report.notes && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Notes</h3>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={{ ...styles.td, color: "#334155" }}>{report.notes}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Version History */}
        {versions.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}>Version History</h3>
              <span style={styles.countPill}>{versions.length}</span>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Version</th>
                    <th style={styles.th}>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {versionPager.paginated.map((v: any, idx: number) => (
                    <tr key={v.id} style={idx % 2 === 1 ? styles.trAlt : undefined}>
                      <td style={{ ...styles.td, color: "#0f172a", fontWeight: 600 }}>
                        Version {versions.length - ((versionPager.page - 1) * ROWS_PER_PAGE + idx)}
                      </td>
                      <td style={styles.td}>{new Date(v.submitted_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {versions.length > ROWS_PER_PAGE && (
              <Pagination
                page={versionPager.page}
                totalPages={versionPager.totalPages}
                onChange={versionPager.setPage}
                totalItems={versions.length}
                pageSize={ROWS_PER_PAGE}
              />
            )}
          </div>
        )}

        {/* Review History */}
        {comments.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeaderRow}>
              <h3 style={styles.sectionTitle}>Review History</h3>
              <span style={styles.countPill}>{comments.length}</span>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Manager</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Comment</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {commentPager.paginated.map((c: any, idx: number) => (
                    <tr key={c.id} style={idx % 2 === 1 ? styles.trAlt : undefined}>
                      <td style={{ ...styles.td, color: "#0f172a", fontWeight: 600 }}>{c.manager_name}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.miniBadge,
                            background: c.action === "approved" ? "#dcfce7" : "#fef3c7",
                            color: c.action === "approved" ? "#166534" : "#92400e",
                          }}
                        >
                          {c.action.replace("_", " ")}
                        </span>
                      </td>
                      <td style={styles.td}>{c.comment}</td>
                      <td style={{ ...styles.td, whiteSpace: "nowrap", color: "#94a3b8" }}>
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {comments.length > ROWS_PER_PAGE && (
              <Pagination
                page={commentPager.page}
                totalPages={commentPager.totalPages}
                onChange={commentPager.setPage}
                totalItems={comments.length}
                pageSize={ROWS_PER_PAGE}
              />
            )}
          </div>
        )}

        {/* Manager Review Actions */}
        {isManager && report.status === "submitted" && (
          <div style={styles.reviewBox}>
            <h3 style={styles.reviewTitle}>Review This Report</h3>
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
                style={{ ...styles.approveBtn, opacity: reviewLoading ? 0.6 : 1 }}
              >
                {reviewLoading ? "Submitting..." : "✓ Approve"}
              </button>
              <button
                onClick={() => handleReview("requested_changes")}
                disabled={reviewLoading}
                style={{ ...styles.rejectBtn, opacity: reviewLoading ? 0.6 : 1 }}
              >
                ✕ Request Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  totalItems: number;
  pageSize: number;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    const range = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - range && i <= page + range)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div style={styles.paginationWrap}>
      <span style={styles.paginationInfo}>
        Showing <strong>{start}–{end}</strong> of <strong>{totalItems}</strong>
      </span>
      <div style={styles.paginationControls}>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
        >
          ‹
        </button>
        {pageNumbers.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} style={styles.pageEllipsis}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              style={p === page ? styles.pageBtnActive : styles.pageBtn}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function priorityBadgeStyle(priority: string): React.CSSProperties {
  const p = (priority || "").toLowerCase();
  const map: { [key: string]: { bg: string; text: string } } = {
    high: { bg: "#fee2e2", text: "#b91c1c" },
    medium: { bg: "#fef3c7", text: "#92400e" },
    low: { bg: "#dbeafe", text: "#1e40af" },
  };
  const c = map[p] || { bg: "#f1f5f9", text: "#334155" };
  return {
    background: c.bg,
    color: c.text,
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "capitalize",
    display: "inline-block",
  };
}

function statusPillStyle(status: string): React.CSSProperties {
  const s = (status || "").toLowerCase();
  const map: { [key: string]: { bg: string; text: string } } = {
    completed: { bg: "#dcfce7", text: "#166534" },
    in_progress: { bg: "#dbeafe", text: "#1e40af" },
    pending: { bg: "#f1f5f9", text: "#475569" },
    blocked: { bg: "#fee2e2", text: "#b91c1c" },
  };
  const c = map[s] || { bg: "#f1f5f9", text: "#475569" };
  return {
    background: c.bg,
    color: c.text,
    padding: "0.25rem 0.7rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "capitalize",
    display: "inline-block",
  };
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: "1080px", margin: "0 auto", padding: "1.1rem 1.5rem 3rem", width: "100%", boxSizing: "border-box" },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 1rem", gap: "1rem" },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #dbeafe",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    fontWeight: 500,
    margin: "1.5rem",
  },

  backBtn: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#334155",
    cursor: "pointer",
    marginBottom: "1rem",
    fontWeight: 600,
    fontSize: "0.85rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.5rem 1.1rem 0.5rem 0.9rem",
    borderRadius: "999px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
    transition: "border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
  },

  headerCard: {
    background: "#ffffff",
    color: "#0f172a",
    padding: "1.75rem 2rem",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
    position: "relative",
    overflow: "hidden",
  },
  headerAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "#2563eb",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerEyebrow: {
    margin: 0,
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
    color: "#1d4ed8",
    fontWeight: 700,
  },
  headerTitle: { margin: "0.4rem 0 0", fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#0f172a" },
  arrow: { color: "#94a3b8", fontWeight: 400 },
  statusBadge: {
    padding: "0.4rem 1rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
  },
  statusDot: { width: "7px", height: "7px", borderRadius: "50%", display: "inline-block" },
  headerMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.25rem",
    marginTop: "1.5rem",
    paddingTop: "1.1rem",
    borderTop: "1px solid #f1f5f9",
  },
  headerMetaItem: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  headerMetaLabel: { fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 },
  headerMetaValue: { fontSize: "0.92rem", fontWeight: 600, color: "#1e293b" },

  commentBox: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    padding: "1.1rem 1.4rem",
    borderRadius: "14px",
    marginBottom: "1.5rem",
    display: "flex",
    gap: "0.85rem",
    alignItems: "flex-start",
  },
  commentIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#f59e0b",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  section: {
    background: "#ffffff",
    padding: "1.75rem",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    border: "1px solid #eef2f7",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
  },
  sectionHeaderRow: { display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.1rem" },
  sectionTitle: { margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" },
  countPill: {
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
  },

  /* Light table style — matches Filter Reports table */
  tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1px solid #eef2f7" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "500px" },
  th: {
    textAlign: "left",
    padding: "0.85rem 1.1rem",
    background: "#fafbfc",
    color: "#94a3b8",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
    borderBottom: "1px solid #eef2f7",
  },
  td: { padding: "0.95rem 1.1rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.88rem", color: "#334155" },
  trAlt: { background: "#fafbfc" },
  slash: { color: "#cbd5e1", margin: "0 0.15rem" },

  paginationWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginTop: "1.1rem",
  },
  paginationInfo: { fontSize: "0.8rem", color: "#64748b" },
  paginationControls: { display: "flex", alignItems: "center", gap: "0.3rem" },
  pageBtn: {
    minWidth: "32px",
    height: "32px",
    padding: "0 0.5rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    transition: "all 0.15s ease",
  },
  pageBtnActive: {
    minWidth: "32px",
    height: "32px",
    padding: "0 0.5rem",
    borderRadius: "8px",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  pageEllipsis: { padding: "0 0.2rem", color: "#94a3b8", fontSize: "0.82rem" },

  keyTag: {
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "0.25rem 0.7rem",
    borderRadius: "999px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    display: "inline-block",
  },
  keyTagGreen: {
    background: "#dcfce7",
    color: "#166534",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "0.25rem 0.7rem",
    borderRadius: "999px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    display: "inline-block",
  },

  reviewBox: {
    background: "#ffffff",
    padding: "1.75rem",
    borderRadius: "16px",
    marginTop: "1.75rem",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
  },
  reviewTitle: { margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" },
  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    boxSizing: "border-box",
    fontSize: "0.88rem",
    resize: "vertical",
    fontFamily: "inherit",
  },
  reviewActions: { display: "flex", gap: "0.85rem", marginTop: "1.1rem", flexWrap: "wrap" },
  approveBtn: {
    padding: "0.65rem 1.4rem",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.88rem",
  },
  rejectBtn: {
    padding: "0.65rem 1.4rem",
    background: "#ffffff",
    color: "#dc2626",
    border: "1px solid #dc2626",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.88rem",
  },

  miniBadge: {
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "0.2rem 0.65rem",
    borderRadius: "999px",
    textTransform: "capitalize",
    display: "inline-block",
  },

  muted: { color: "#94a3b8" },
};
