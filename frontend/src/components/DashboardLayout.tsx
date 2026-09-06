import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import api from "../api/axios";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isManager = user?.role === "manager";
  const isDashboardPage = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");
  const showTopUtilityBar = isManager && isDashboardPage;

  const [showRecentWork, setShowRecentWork] = useState(false);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState("");

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  async function loadRecentWork() {
    setRecentLoading(true);
    setRecentError("");
    try {
      const res = await api.get("/reports", { params: { limit: 5 } });
      setRecentItems(res.data.reports || []);
    } catch (err: any) {
      setRecentError(err.response?.data?.message || "Failed to load recent work");
    } finally {
      setRecentLoading(false);
    }
  }

  function openRecentWork() {
    setShowRecentWork(true);
    loadRecentWork();
  }

  const managerLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/projects", label: "Projects", icon: "📁" },
    { path: "/users", label: "Team Members", icon: "👥" },
  ];

  const memberLinks = [
    { path: "/my-reports", label: "My Reports", icon: "📝" },
  ];

  const links = isManager ? managerLinks : memberLinks;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="dot"></span>
          Weekly Reports
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <button
              key={link.path}
              className={`sidebar-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => navigate(link.path)}
            >
              <span>{link.icon}</span> {link.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            {user?.role.replace("_", " ")}
          </div>
          <button className="sidebar-link" onClick={logout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {showTopUtilityBar && (
          <div style={styles.topUtilityBar}>
            <button
              onClick={openRecentWork}
              style={styles.recentWorkBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563eb";
                e.currentTarget.style.color = "#1d4ed8";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(15, 23, 42, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.06)";
              }}
            >
              <span style={{ fontSize: "0.95rem" }}>🕒</span> Recent Work
            </button>
            <NotificationBell />
          </div>
        )}
        {children}
      </main>

      {showRecentWork && (
        <div style={styles.modalOverlay} onClick={() => setShowRecentWork(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Recent Work</h3>
              <button style={styles.modalClose} onClick={() => setShowRecentWork(false)}>
                ✕
              </button>
            </div>

            {recentLoading ? (
              <p style={styles.modalMuted}>Loading...</p>
            ) : recentError ? (
              <div className="alert alert-error">{recentError}</div>
            ) : recentItems.length === 0 ? (
              <p style={styles.modalMuted}>No recent activity</p>
            ) : (
              <div style={styles.modalTableWrap}>
                <table className="data-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Project</th>
                      <th>Week</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentItems.map((r: any) => (
                      <tr key={r.id}>
                        <td>{r.user_name}</td>
                        <td>{r.project_name || "—"}</td>
                        <td>
                          {r.week_start?.slice(0, 10)} → {r.week_end?.slice(0, 10)}
                        </td>
                        <td>
                          <span className={`badge badge-${r.status}`}>{r.status.replace("_", " ")}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  topUtilityBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.5rem 1.5rem 0",
    marginBottom: "0.25rem",
  },

  recentWorkBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#334155",
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    fontFamily: "inherit",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
    transition: "border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "5rem 1.25rem",
    zIndex: 100,
  },
  modalCard: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.25)",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.1rem",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  modalClose: {
    background: "#f1f5f9",
    border: "none",
    color: "#64748b",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTableWrap: {
    borderRadius: "12px",
    border: "1px solid #eef2f7",
    overflow: "hidden",
  },
  modalMuted: { color: "#94a3b8", fontSize: "0.88rem" },
};
