import { useState } from "react";
import api from "../api/axios";

export default function ItemList({
  reportId,
  items,
  canEdit,
  onChange,
  kind,
}) {
  const [description, setDescription] = useState("");
  const [isKey, setIsKey] = useState(false);
  const [adding, setAdding] = useState(false);

  const keyField =
    kind === "blockers" ? "is_key_issue" : "is_key_achievement";

  const keyLabel =
    kind === "blockers" ? "Key Issue" : "Key Achievement";

  async function handleAdd() {
    if (!description.trim()) {
      alert("Description is required");
      return;
    }

    setAdding(true);

    try {
      await api.post(`/reports/${reportId}/${kind}`, {
        description,
        [keyField]: isKey,
      });

      setDescription("");
      setIsKey(false);
      onChange();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          `Failed to add ${kind.slice(0, -1)}`
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;

    try {
      await api.delete(`/reports/${reportId}/${kind}/${id}`);
      onChange();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete item"
      );
    }
  }

  return (
    <div>
      {items.length === 0 ? (
        <p style={styles.muted}>None added yet</p>
      ) : (
        <ul style={styles.list}>
          {items.map((item) => (
            <li key={item.id} style={styles.listItem}>
              <span>
                {item.description}{" "}
                {item[keyField] && (
                  <strong style={styles.keyTag}>
                    ({keyLabel})
                  </strong>
                )}
              </span>

              {canEdit && (
                <button
                  onClick={() => handleDelete(item.id)}
                  style={styles.deleteBtn}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div style={styles.addRow}>
          <input
            placeholder={`Add a ${
              kind === "blockers" ? "blocker" : "achievement"
            }...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.input}
          />

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isKey}
              onChange={(e) => setIsKey(e.target.checked)}
            />
            {" "}
            {keyLabel}
          </label>

          <button
            onClick={handleAdd}
            disabled={adding}
            style={styles.addBtn}
          >
            + Add
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  list: {
    listStyle: "none",
    padding: 0,
    marginBottom: "0.75rem",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.4rem 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "0.9rem",
  },

  keyTag: {
    color: "#b45309",
  },

  deleteBtn: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
  },

  addRow: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flexWrap: "wrap",
  },

  input: {
    flex: 1,
    minWidth: "200px",
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },

  checkboxLabel: {
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },

  addBtn: {
    padding: "0.5rem 1rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  muted: {
    color: "#999",
    fontSize: "0.9rem",
  },
};