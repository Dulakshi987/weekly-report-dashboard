import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";


export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("team_member");
  const [saving, setSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/users", { name, email, password, role });
      setShowForm(false);
      setName(""); setEmail(""); setPassword(""); setRole("team_member");
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  }

  async function handleRemove(userId) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove user");
    }
  }

  function openResetPassword(u) {
    setResetTarget(u);
    setNewPassword("");
    setResetError("");
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!resetTarget) return;
    if (!newPassword.trim() || newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    setResetSaving(true);
    setResetError("");
    try {
      await api.put(`/users/${resetTarget.id}/password`, { password: newPassword });
      alert(`Password updated for ${resetTarget.name}. They can log in with the new password now.`);
      setResetTarget(null);
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to update password");
    } finally {
      setResetSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">USER MANAGEMENT</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          + Invite User
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleInvite} className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">New Team Member</h3>
            <p className="form-card-subtitle">They'll be able to log in immediately with these credentials.</p>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-field-label">Full Name</label>
              <input
                placeholder="e.g. Jane Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-field-label">Email Address</label>
              <input
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-field-label">Temporary Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-field-label">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="team_member">Team Member</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          <div className="form-card-actions">
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
              {saving ? "Creating..." : "Create User"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link to={`/team/${u.id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{u.name}</Link>
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={styles.roleSelect}
                  >
                    <option value="team_member">Team Member</option>
                    <option value="manager">Manager</option>
                  </select>
                </td>
                <td>
                  <div style={styles.actionsCell}>
                    <button
                      onClick={() => openResetPassword(u)}
                      style={styles.resetBtn}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => handleRemove(u.id)}
                      style={styles.deleteBtn}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {resetTarget && (
        <div style={styles.modalOverlay} onClick={() => setResetTarget(null)}>
          <form
            onSubmit={handleResetPasswordSubmit}
            style={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Set New Password</h3>
              <button type="button" style={styles.modalClose} onClick={() => setResetTarget(null)}>
                ✕
              </button>
            </div>
            <p style={styles.modalSubtitle}>
              Setting a new password for <strong>{resetTarget.name}</strong>. They'll be able to log in with it right away.
            </p>

            {resetError && <div className="alert alert-error">{resetError}</div>}

            <div className="form-field" style={{ marginTop: "0.25rem" }}>
              <label className="form-field-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoFocus
              />
            </div>

            <div className="flex gap-2" style={{ marginTop: "1.25rem" }}>
              <button type="submit" disabled={resetSaving} className="btn btn-primary">
                {resetSaving ? "Saving..." : "Set Password"}
              </button>
              <button type="button" onClick={() => setResetTarget(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}

const styles = {
  roleSelect: {
    padding: "0.4rem 0.6rem",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    color: "#334155",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontFamily: "inherit",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.15s ease",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "#fef2f2",
    color: "#dc2626",
    border: "none",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontFamily: "inherit",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.25rem",
    zIndex: 100,
  },
  modalCard: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.25)",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "420px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  modalSubtitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: "0 0 1.1rem",
    lineHeight: 1.5,
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
};
