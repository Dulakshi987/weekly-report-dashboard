import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Project } from "../types";

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state (used for both create and edit)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err: any) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setShowForm(true);
  }

  function openEditForm(p: Project) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setShowForm(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, { name, description });
      } else {
        await api.post("/projects", { name, description });
      }
      setShowForm(false);
      loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1>Projects / Categories</h1>
          <p style={styles.subtitle}>Manage work categories used across weekly reports</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate("/dashboard")} style={styles.backBtn}>
            ← Back to Dashboard
          </button>
          <button onClick={openCreateForm} style={styles.addBtn}>
            + Add Project
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSave} style={styles.form}>
          <h3>{editingId ? "Edit Project" : "New Project"}</h3>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="e.g. Client A"
          />
          <label style={styles.label}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            rows={2}
            placeholder="Brief description of this project or category"
          />
          <div style={styles.formActions}>
            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No projects yet. Add your first one.</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td style={styles.td}><strong>{p.name}</strong></td>
                <td style={styles.td}>{p.description || <span style={styles.muted}>—</span>}</td>
                <td style={styles.td}>
                  <button onClick={() => openEditForm(p)} style={styles.editLink}>
                    Edit
                  </button>
                  {" | "}
                  <button onClick={() => handleDelete(p.id)} style={styles.deleteLink}>
                    Delete
                  </button>
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
  label: { display: "block", marginTop: "0.75rem", marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: 500 },
  input: { width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "inherit" },
  formActions: { display: "flex", gap: "0.75rem", marginTop: "1rem" },
  saveBtn: { padding: "0.5rem 1.2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelBtn: { padding: "0.5rem 1.2rem", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  th: { textAlign: "left", padding: "0.75rem", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", fontSize: "0.85rem" },
  td: { padding: "0.75rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" },
  muted: { color: "#999" },
  editLink: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, fontSize: "0.85rem" },
  deleteLink: { background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 0, fontSize: "0.85rem" },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "0.6rem", borderRadius: "4px", marginBottom: "1rem" },
  emptyState: { textAlign: "center", padding: "3rem", background: "#fff", borderRadius: "8px" },
};
