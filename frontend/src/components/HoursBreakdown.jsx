import { useState, useEffect } from "react";
import api from "../api/axios";

const TASK_TYPES = [
  "Development",
  "Testing",
  "Meetings",
  "Documentation",
];

export default function HoursBreakdown({
  reportId,
  initialHours,
  canEdit,
}) {
  const [hours, setHours] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const map = {};

    TASK_TYPES.forEach((t) => {
      map[t] = 0;
    });

    initialHours.forEach((h) => {
      map[h.task_type] = h.hours;
    });

    setHours(map);
  }, [initialHours]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const payload = Object.entries(hours)
        .filter(([, v]) => v > 0)
        .map(([task_type, hrs]) => ({
          task_type,
          hours: hrs,
        }));

      await api.put(`/reports/${reportId}/hours`, {
        hours: payload,
      });

      setSaved(true);

      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to save hours"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={styles.grid}>
        {TASK_TYPES.map((type) => (
          <div key={type} style={styles.field}>
            <label style={styles.label}>{type}</label>

            <input
              type="number"
              min={0}
              step={0.5}
              value={hours[type] || 0}
              onChange={(e) =>
                setHours({
                  ...hours,
                  [type]: Number(e.target.value),
                })
              }
              disabled={!canEdit}
              style={styles.input}
            />
          </div>
        ))}
      </div>

      {canEdit && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        >
          {saving
            ? "Saving..."
            : saved
            ? "✓ Saved"
            : "Save Hours"}
        </button>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.75rem",
    marginBottom: "1rem",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "0.8rem",
    marginBottom: "0.25rem",
    color: "#374151",
  },

  input: {
    padding: "0.4rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },

  saveBtn: {
    padding: "0.4rem 1rem",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};