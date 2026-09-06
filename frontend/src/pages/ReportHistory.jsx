
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";

const PAGE_SIZE = 10;

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadReports(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadReports(pageNum) {
    setLoading(true);

    try {
      const res = await api.get("/reports/my", {
        params: {
          page: pageNum,
          limit: PAGE_SIZE,
        },
      });

      setReports(res.data.reports || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalReports(res.data.total ?? (res.data.reports || []).length);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  function formatStatus(status) {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  }

  const draftCount = reports.filter(
    (r) => r.status === "draft"
  ).length;

  const submittedCount = reports.filter(
    (r) => r.status === "submitted"
  ).length;

  const needsCorrectionCount = reports.filter(
    (r) => r.status === "needs_correction"
  ).length;

  const approvedCount = reports.filter(
    (r) => r.status === "approved"
  ).length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Weekly Reports</h1>
          <p className="page-subtitle">
            Track and manage your weekly progress reports
          </p>
        </div>

        <button
          onClick={() => navigate("/reports/new")}
          className="btn btn-primary"
        >
          + New Report
        </button>
      </div>

      {/* Summary Metrics (reflect current page only) */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-value">{draftCount}</div>
          <div className="metric-label">Drafts</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{submittedCount}</div>
          <div className="metric-label">Awaiting Review</div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-value">{needsCorrectionCount}</div>
          <div className="metric-label">Needs Correction</div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-value">{approvedCount}</div>
          <div className="metric-label">Approved</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <p>You haven't created any reports yet.</p>

          <button
            onClick={() => navigate("/reports/new")}
            className="btn btn-primary mt-1"
          >
            Create your first report
          </button>
        </div>
      ) : (
        <>
          {/* Reports Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Project</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.week_start?.slice(0, 10)} →{" "}
                    {r.week_end?.slice(0, 10)}
                  </td>

                  <td>
                    {r.project_name || "—"}
                  </td>

                  <td>
                    <span
                      className={`badge badge-${r.status}`}
                    >
                      {formatStatus(r.status)}
                    </span>
                  </td>

                  <td>
                    {r.submitted_at
                      ? r.submitted_at.slice(0, 10)
                      : "—"}
                  </td>

                  <td>
                    <Link
                      to={`/reports/${r.id}`}
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: 600,
                        marginRight: "0.75rem",
                      }}
                    >
                      View
                    </Link>

                    {(r.status === "draft" ||
                      r.status === "needs_correction") && (
                      <Link
                        to={`/reports/${r.id}/edit`}
                        style={{
                          color: "#2563eb",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={styles.pagination}>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages} ({totalReports} total)
            </span>

            <div style={styles.pageButtons}>
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                style={{
                  ...styles.pageBtn,
                  ...(page <= 1 ? styles.pageBtnDisabled : {}),
                }}
              >
                ← Previous
              </button>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                style={{
                  ...styles.pageBtn,
                  ...(page >= totalPages
                    ? styles.pageBtnDisabled
                    : {}),
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

const styles = {
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
    padding: "0.75rem 0",
  },

  pageInfo: {
    fontSize: "0.85rem",
    color: "#666",
  },

  pageButtons: {
    display: "flex",
    gap: "0.5rem",
  },

  pageBtn: {
    padding: "0.4rem 0.9rem",
    background: "#fff",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },

  pageBtnDisabled: {
    color: "#aaa",
    borderColor: "#ddd",
    cursor: "not-allowed",
  },
};
