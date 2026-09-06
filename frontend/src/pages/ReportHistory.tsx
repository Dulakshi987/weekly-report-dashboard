import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Report } from "../types";
import DashboardLayout from "../components/DashboardLayout";

export default function ReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

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

  const draftCount = reports.filter((r) => r.status === "draft").length;
  const submittedCount = reports.filter((r) => r.status === "submitted").length;
  const needsCorrectionCount = reports.filter((r) => r.status === "needs_correction").length;
  const approvedCount = reports.filter((r) => r.status === "approved").length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Weekly Reports</h1>
          <p className="page-subtitle">Track and manage your weekly progress reports</p>
        </div>
        <button onClick={() => navigate("/reports/new")} className="btn btn-primary">
          + New Report
        </button>
      </div>

      {/* Summary Metrics */}
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

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any reports yet.</p>
          <button onClick={() => navigate("/reports/new")} className="btn btn-primary mt-1">
            Create your first report
          </button>
        </div>
      ) : (
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
                <td>{r.week_start?.slice(0, 10)} → {r.week_end?.slice(0, 10)}</td>
                <td>{r.project_name || "—"}</td>
                <td><span className={`badge badge-${r.status}`}>{formatStatus(r.status)}</span></td>
                <td>{r.submitted_at ? r.submitted_at.slice(0, 10) : "—"}</td>
                <td>
                  <Link to={`/reports/${r.id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600, marginRight: "0.75rem" }}>
                    View
                  </Link>
                  {(r.status === "draft" || r.status === "needs_correction") && (
                    <Link to={`/reports/${r.id}/edit`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}
