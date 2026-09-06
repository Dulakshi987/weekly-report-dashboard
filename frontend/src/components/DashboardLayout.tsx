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

  const [menuOpen, setMenuOpen] = useState(false);
  const [showRecentWork, setShowRecentWork] = useState(false);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState("");

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  function go(path: string) {
    navigate(path);
    setMenuOpen(false);
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
    { path: "/dashboard", label: "Dashboard" },
    { path: "/projects", label: "Projects" },
    { path: "/users", label: "Team Members" },
  ];

  const memberLinks = [
    { path: "/my-reports", label: "My Reports" },
  ];

  const links = isManager ? managerLinks : memberLinks;

  return (
    <div className="app-shell">
      {/* Mobile top bar with toggle */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, padding: 3, boxSizing: "border-box",
          }}>
            <img
              src="/logo.jpg"
              alt="Sisenco Digital"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <span style={{ fontFamily: "inherit", fontWeight: 700 }}>Sisenco Digital</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      <div className={`sidebar-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}></div>

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, padding: 4, boxSizing: "border-box",
          }}>
            <img
              src="/logo.jpg"
              alt="Sisenco Digital"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <span style={{ fontFamily: "inherit", fontWeight: 700 }}>Sisenco Digital</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <button
              key={link.path}
              className={`sidebar-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => go(link.path)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            {user?.role.replace("_", " ")}
          </div>
          <button className="sidebar-link" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {showTopUtilityBar && (
          <div style={styles.topUtilityBar}>
            <h1 style={styles.utilityPageTitle}>MANAGER DASHBOARD</h1>
            <div style={styles.utilityRightGroup}>
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
                Recent Work
              </button>
              <NotificationBell />
            </div>
          </div>
        )}

        <div style={styles.pageBody}>{children}</div>

        <footer style={styles.pageFooter}>
          © 2026 Dulakshi Keshani. All rights reserved.
        </footer>
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
  pageBody: {
    minHeight: "calc(100vh - 4rem)",
  },

  pageFooter: {
    textAlign: "center",
    fontSize: "0.78rem",
    color: "#94a3b8",
    padding: "1.5rem 0 0.5rem 0",
    marginTop: "1rem",
    borderTop: "1px solid #e2e8f0",
  },

  topUtilityBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0 0",
    marginBottom: "0.25rem",
  },

  utilityBrand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  utilityLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    objectFit: "contain",
    flexShrink: 0,
  },

  utilityBrandText: {
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },

  utilityPageTitle: {
    fontFamily: "inherit",
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    margin: 0,
  },

  utilityRightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
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
