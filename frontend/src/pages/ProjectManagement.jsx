import { useState, useEffect } from "react";
import api from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);

    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
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

  function openEditForm(p) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, {
          name,
          description,
        });
      } else {
        await api.post("/projects", {
          name,
          description,
        });
      }

      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save project"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete project"
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">PROJECTS / CATEGORIES</h1>
        </div>

        <button
          onClick={openCreateForm}
          className="btn btn-primary"
        >
          + Add Project
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="form-card">
          <div className="form-card-header">
            <h3 className="form-card-title">
              {editingId ? "Edit Project" : "New Project"}
            </h3>

            <p className="form-card-subtitle">
              {editingId
                ? "Update the details for this project or category."
                : "Add a new project or category for reports to be tagged with."}
            </p>
          </div>

          <div className="form-grid">
            <div className="form-field form-grid-full">
              <label className="form-field-label">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Client A"
              />
            </div>

            <div className="form-field form-grid-full">
              <label className="form-field-label">
                Description (optional)
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of this project or category"
                style={{
                  padding: "0.65rem 0.9rem",
                  borderRadius: "6px",
                  border: "1.5px solid #e2e8f0",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  color: "#334155",
                  background: "#f8fafc",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          <div className="form-card-actions">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update"
                : "Create"}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          No projects yet. Add your first one.
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                </td>

                <td>
                  {p.description || (
                    <span className="text-muted">—</span>
                  )}
                </td>

                <td>
                  <div style={styles.actionsCell}>
                    <button
                      onClick={() => openEditForm(p)}
                      style={styles.editBtn}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "#dbeafe")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "#eff6ff")
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      style={styles.deleteBtn}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "#fee2e2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "#fef2f2")
                      }
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
    </DashboardLayout>
  );
}

const styles = {
  actionsCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  editBtn: {
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
};