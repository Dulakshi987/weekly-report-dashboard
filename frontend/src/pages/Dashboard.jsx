import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#8b5cf6",
  "#0891b2",
];

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "1y", label: "1 Year" },
  { key: "custom", label: "Custom" },
];

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function getRangeDates(range, customFrom, customTo) {
  const today = new Date();
  const to = formatDate(today);

  if (range === "custom") {
    return {
      from: customFrom,
      to: customTo,
    };
  }

  const from = new Date(today);

  if (range === "today") {
    // same day
  } else if (range === "7d") {
    from.setDate(from.getDate() - 6);
  } else if (range === "30d") {
    from.setDate(from.getDate() - 29);
  } else if (range === "1y") {
    from.setFullYear(from.getFullYear() - 1);
  }

  return {
    from: formatDate(from),
    to,
  };
}

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [weekStartFilter, setWeekStartFilter] = useState("");
  const [weekEndFilter, setWeekEndFilter] = useState("");

  // Chart time range state
  const [chartRange, setChartRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const activeDates = useMemo(
    () => getRangeDates(chartRange, customFrom, customTo),
    [chartRange, customFrom, customTo]
  );

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // For custom range, wait until both dates are picked before fetching
    if (
      chartRange === "custom" &&
      (!customFrom || !customTo)
    ) {
      return;
    }

    loadStats();
  }, [chartRange, customFrom, customTo]);

  useEffect(() => {
    loadReports();
  }, [
    statusFilter,
    projectFilter,
    weekStartFilter,
    weekEndFilter,
  ]);

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStats() {
    setStatsLoading(true);

    try {
      const res = await api.get("/stats/dashboard", {
        params: {
          date_from: activeDates.from,
          date_to: activeDates.to,
        },
      });

      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const params = {
        limit: 100,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (projectFilter) {
        params.project_id = projectFilter;
      }

      if (weekStartFilter) {
        params.week_start = weekStartFilter;
      }

      if (weekEndFilter) {
        params.week_end = weekEndFilter;
      }

      const res = await api.get("/reports", {
        params,
      });

      setReports(res.data.reports || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatStatus(status) {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function clearTableFilters() {
    setStatusFilter("");
    setProjectFilter("");
    setWeekStartFilter("");
    setWeekEndFilter("");
  }

  const hasActiveTableFilters =
    statusFilter ||
    projectFilter ||
    weekStartFilter ||
    weekEndFilter;

  const totalSubmitted = reports.filter(
    (r) => r.status === "submitted"
  ).length;

  const needsCorrection = reports.filter(
    (r) => r.status === "needs_correction"
  ).length;

  const approved = reports.filter(
    (r) => r.status === "approved"
  ).length;

  const statusByMemberChart = (() => {
    if (!stats?.statusByMember) {
      return [];
    }

    const map = {};

    stats.statusByMember.forEach((row) => {
      if (!map[row.user_name]) {
        map[row.user_name] = {
          name: row.user_name,
        };
      }

      map[row.user_name][row.status] = row.count;
    });

    return Object.values(map);
  })();

  const workloadChart =
    stats?.workloadByProject?.map((p) => ({
      name: p.project_name || "Unassigned",
      tasks: p.task_count,
    })) || [];

  const timeByTypeChart =
    stats?.timeByTaskType?.map((t) => ({
      name: t.task_type,
      value: Number(t.total_hours),
    })) || [];

  const tasksTrendChart =
    stats?.tasksCompletedTrend?.map((t) => ({
      week: t.week_start?.slice(5, 10),
      completed: t.completed_count,
    })) || [];

  return (
    <DashboardLayout>
      {/* Summary Metrics */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-value">
            {totalSubmitted}
          </div>
          <div className="metric-label">
            Awaiting Review
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-value">
            {needsCorrection}
          </div>
          <div className="metric-label">
            Needs Correction
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-value">
            {approved}
          </div>
          <div className="metric-label">
            Approved
          </div>
        </div>

        <div className="metric-card metric-dark">
          <div className="metric-value">
            {stats?.openBlockersCount ?? "—"}
          </div>
          <div className="metric-label">
            Open Blockers
          </div>
        </div>
      </div>

      {/* Chart Time Range Selector */}
      <div style={styles.rangeBar}>
        <div style={styles.rangeBarLeft}>
          <span style={styles.rangeLabel}>
            Chart Period
          </span>

          <div style={styles.rangePills}>
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() =>
                  setChartRange(opt.key)
                }
                style={
                  chartRange === opt.key
                    ? styles.rangePillActive
                    : styles.rangePill
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {chartRange === "custom" && (
          <div style={styles.customDateRow}>
            <div style={styles.dateField}>
              <label style={styles.dateLabel}>
                From
              </label>

              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(e) =>
                  setCustomFrom(e.target.value)
                }
                style={styles.dateInput}
              />
            </div>

            <span style={styles.dateArrow}>→</span>

            <div style={styles.dateField}>
              <label style={styles.dateLabel}>
                To
              </label>

              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) =>
                  setCustomTo(e.target.value)
                }
                style={styles.dateInput}
              />
            </div>
          </div>
        )}

        {chartRange !== "custom" && (
          <span style={styles.rangeSummary}>
            {activeDates.from}{" "}
            <span style={{ color: "#94a3b8" }}>
              →
            </span>{" "}
            {activeDates.to}
          </span>
        )}
      </div>

      {/* Charts */}
      {statsLoading ? (
        <div style={styles.chartsLoading}>
          <div style={styles.spinner} />

          <span
            style={{
              color: "#94a3b8",
              fontSize: "0.85rem",
            }}
          >
            Loading chart data...
          </span>
        </div>
      ) : stats &&
        chartRange === "custom" &&
        (!customFrom || !customTo) ? (
        <div style={styles.chartsPlaceholder}>
          Select both a start and end date to view
          charts.
        </div>
      ) : (
        stats && (
          <div className="charts-grid">
            {/* Tasks Completed Trend */}
            <div className="card">
              <h4 className="card-title">
                Tasks Completed Trend
              </h4>

              <ResponsiveContainer
                width="100%"
                height={220}
              >
                <LineChart data={tasksTrendChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="week"
                    fontSize={12}
                    stroke="#64748b"
                  />

                  <YAxis
                    fontSize={12}
                    allowDecimals={false}
                    stroke="#64748b"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Submission Status */}
            <div className="card">
              <h4 className="card-title">
                Submission Status by Team Member
              </h4>

              <ResponsiveContainer
                width="100%"
                height={220}
              >
                <BarChart data={statusByMemberChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    stroke="#64748b"
                  />

                  <YAxis
                    fontSize={12}
                    allowDecimals={false}
                    stroke="#64748b"
                  />

                  <Tooltip />

                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                    }}
                  />

                  <Bar
                    dataKey="draft"
                    stackId="a"
                    fill="#94a3b8"
                    name="Draft"
                  />

                  <Bar
                    dataKey="submitted"
                    stackId="a"
                    fill="#2563eb"
                    name="Submitted"
                  />

                  <Bar
                    dataKey="needs_correction"
                    stackId="a"
                    fill="#d97706"
                    name="Needs Correction"
                  />

                  <Bar
                    dataKey="approved"
                    stackId="a"
                    fill="#16a34a"
                    name="Approved"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Workload */}
            <div className="card">
              <h4 className="card-title">
                Workload by Project
              </h4>

              <ResponsiveContainer
                width="100%"
                height={220}
              >
                <BarChart data={workloadChart}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    stroke="#64748b"
                  />

                  <YAxis
                    fontSize={12}
                    allowDecimals={false}
                    stroke="#64748b"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="tasks"
                    fill="#0f172a"
                    name="Task Count"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Time Spent */}
            <div className="card">
              <h4 className="card-title">
                Time Spent by Task Type
              </h4>

              <ResponsiveContainer
                width="100%"
                height={220}
              >
                <PieChart>
                  <Pie
                    data={timeByTypeChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {timeByTypeChart.map(
                      (_, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            PIE_COLORS[
                              idx % PIE_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      )}

      {/* Reports Table Filters */}
      <div style={styles.filterCard}>
        <div style={styles.filterCardHeader}>
          <span style={styles.filterCardTitle}>
            Filter Reports
          </span>

          {hasActiveTableFilters && (
            <button
              onClick={clearTableFilters}
              style={styles.clearBtn}
            >
              Clear all
            </button>
          )}
        </div>

        <div style={styles.filterGrid}>
          <div style={styles.filterField}>
            <label style={styles.dateLabel}>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">
                Submitted
              </option>
              <option value="needs_correction">
                Needs Correction
              </option>
              <option value="approved">
                Approved
              </option>
            </select>
          </div>

          <div style={styles.filterField}>
            <label style={styles.dateLabel}>
              Project
            </label>

            <select
              value={projectFilter}
              onChange={(e) =>
                setProjectFilter(e.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="">All Projects</option>

              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterField}>
            <label style={styles.dateLabel}>
              From
            </label>

            <input
              type="date"
              value={weekStartFilter}
              max={weekEndFilter || undefined}
              onChange={(e) =>
                setWeekStartFilter(e.target.value)
              }
              style={styles.dateInput}
            />
          </div>

          <div style={styles.filterField}>
            <label style={styles.dateLabel}>
              To
            </label>

            <input
              type="date"
              value={weekEndFilter}
              min={weekStartFilter || undefined}
              onChange={(e) =>
                setWeekEndFilter(e.target.value)
              }
              style={styles.dateInput}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          No reports match the selected filters.
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table
            className="data-table"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Week</th>
                <th>Project</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link
                      to={`/team/${r.user_id}`}
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      {r.user_name}
                    </Link>
                  </td>

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
                      }}
                    >
                      {r.status === "submitted"
                        ? "Review →"
                        : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

const styles = {
  /* Chart range selector */
  rangeBar: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: "16px",
    padding: "1.1rem 1.35rem",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  rangeBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },

  rangeLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  rangePills: {
    display: "flex",
    gap: "0.35rem",
    background: "#f1f5f9",
    padding: "0.3rem",
    borderRadius: "12px",
  },

  rangePill: {
    border: "none",
    background: "transparent",
    color: "#475569",
    padding: "0.45rem 0.9rem",
    borderRadius: "9px",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  rangePillActive: {
    border: "none",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "0.45rem 0.9rem",
    borderRadius: "9px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow:
      "0 4px 10px rgba(37, 99, 235, 0.3)",
  },

  rangeSummary: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#334155",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
    padding: "0.5rem 0.9rem",
    borderRadius: "10px",
  },

  customDateRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },

  dateArrow: {
    color: "#94a3b8",
    paddingBottom: "0.55rem",
    fontSize: "0.9rem",
  },

  chartsLoading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    padding: "3rem 1rem",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #eef2f7",
    marginBottom: "1.75rem",
  },

  chartsPlaceholder: {
    padding: "2.5rem 1rem",
    textAlign: "center",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: "16px",
    border: "1px dashed #cbd5e1",
    marginBottom: "1.75rem",
    fontSize: "0.9rem",
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #dbeafe",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  /* Filter card for reports table */
  filterCard: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: "16px",
    padding: "1.1rem 1.35rem",
    marginBottom: "1.25rem",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  filterCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.9rem",
  },

  filterCardTitle: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  clearBtn: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: "0.2rem 0.4rem",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "0.9rem",
  },

  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },

  dateLabel: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  dateField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },

  dateInput: {
    padding: "0.55rem 0.7rem",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    fontSize: "0.85rem",
    color: "#334155",
    background: "#f8fafc",
    outline: "none",
  },

  filterSelect: {
    padding: "0.55rem 0.7rem",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    fontSize: "0.85rem",
    color: "#334155",
    background: "#f8fafc",
    outline: "none",
  },

  tableWrap: {
    background: "#fff",
    border: "1px solid #eef2f7",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
};