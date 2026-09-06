import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("team_member");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: FormEvent) {
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
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(userId: number, newRole: string) {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  }

  async function handleRemove(userId: number) {
    if (!confirm("Remove this user? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove user");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>User Management</h1>
          <p style={styles.subtitle}>Invite team members and assign roles</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>← Back to Dashboard</button>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            + Invite User
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleInvite} style={styles.form}>
          <h3>New Team Member</h3>
          <div style={styles.row}>
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.row}>
            <input type="password" placeholder="Temporary password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
              <option value="team_member">Team Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div style={styles.formActions}>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? "Creating..." : "Create User"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>
                  <Link to={`/team/${u.id}`} style={styles.link}>{u.name}</Link>
                </td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={styles.roleSelect}
                  >
                    <option value="team_member">Team Member</option>
                    <option value="manager">Manager</option>
                  </select>
                </td>
                <td style={styles.td}>
                  <button onClick={() => handleRemove(u.id)} style={styles.removeBtn}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { maxWidth: "800px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" },
  headerActions: { display: "flex", gap: "0.5rem" },
  subtitle: { color: "#666", margin: 0 },
  backBtn: { background: "none", border: "1px solid #d1d5db", color: "#374151", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" },
  addBtn: { padding: "0.5rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  form: { background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: "1.5rem" },
  row: { display: "flex", gap: "0.75rem", marginTop: "0.5rem" },
  input: { flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" },
  formActions: { display: "flex", gap: "0.75rem", marginTop: "1rem" },
  saveBtn: { padding: "0.5rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelBtn: { padding: "0.5rem 1.2rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  th: { textAlign: "left", padding: "0.75rem", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", fontSize: "0.85rem" },
  td: { padding: "0.75rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  roleSelect: { padding: "0.3rem", borderRadius: "4px", border: "1px solid #ccc" },
  removeBtn: { background: "none", border: "none", color: "#dc2626", cursor: "pointer" },
  link: { color: "#2563eb", textDecoration: "none", fontWeight: 500 },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "0.6rem", borderRadius: "4px", marginBottom: "1rem" },
};
