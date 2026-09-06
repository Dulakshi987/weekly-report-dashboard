import { useState } from "react";
import api from "../api/axios";

interface Task {
  id: number;
  task_name: string;
  priority: string;
  planned_percent: number;
  actual_percent: number;
  status: string;
  time_planned_hours: number;
  time_spent_hours: number;
  deliverable: string | null;
}

interface Props {
  reportId: number;
  tasks: Task[];
  canEdit: boolean;
  onChange: () => void;
}

const emptyTask = {
  task_name: "",
  priority: "medium",
  planned_percent: 0,
  actual_percent: 0,
  status: "not_started",
  time_planned_hours: 0,
  time_spent_hours: 0,
  deliverable: "",
};

export default function TaskTable({ reportId, tasks, canEdit, onChange }: Props) {
  const [newTask, setNewTask] = useState({ ...emptyTask });
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newTask.task_name.trim()) {
      alert("Task name is required");
      return;
    }
    setAdding(true);
    try {
      await api.post(`/reports/${reportId}/tasks`, newTask);
      setNewTask({ ...emptyTask });
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add task");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(taskId: number) {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/reports/${reportId}/tasks/${taskId}`);
      onChange();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  }

  return (
    <div>
      {tasks.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Planned %</th>
              <th style={styles.th}>Actual %</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Time (h)</th>
              <th style={styles.th}>Deliverable</th>
              {canEdit && <th style={styles.th}></th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={styles.td}>{t.task_name}</td>
                <td style={styles.td}>{t.priority}</td>
                <td style={styles.td}>{t.planned_percent}%</td>
                <td style={styles.td}>{t.actual_percent}%</td>
                <td style={styles.td}>{t.status}</td>
                <td style={styles.td}>{t.time_planned_hours}/{t.time_spent_hours}</td>
                <td style={styles.td}>{t.deliverable || "—"}</td>
                {canEdit && (
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}>✕</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canEdit && (
        <div style={styles.addRow}>
          <input
            placeholder="Task name"
            value={newTask.task_name}
            onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
            style={styles.inputSmall}
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            style={styles.inputSmall}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="number" placeholder="Planned %" min={0} max={100}
            value={newTask.planned_percent}
            onChange={(e) => setNewTask({ ...newTask, planned_percent: Number(e.target.value) })}
            style={styles.inputTiny}
          />
          <input
            type="number" placeholder="Actual %" min={0} max={100}
            value={newTask.actual_percent}
            onChange={(e) => setNewTask({ ...newTask, actual_percent: Number(e.target.value) })}
            style={styles.inputTiny}
          />
          <select
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            style={styles.inputSmall}
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <input
            type="number" placeholder="Planned h" min={0}
            value={newTask.time_planned_hours}
            onChange={(e) => setNewTask({ ...newTask, time_planned_hours: Number(e.target.value) })}
            style={styles.inputTiny}
          />
          <input
            type="number" placeholder="Spent h" min={0}
            value={newTask.time_spent_hours}
            onChange={(e) => setNewTask({ ...newTask, time_spent_hours: Number(e.target.value) })}
            style={styles.inputTiny}
          />
          <input
            placeholder="Deliverable"
            value={newTask.deliverable}
            onChange={(e) => setNewTask({ ...newTask, deliverable: e.target.value })}
            style={styles.inputSmall}
          />
          <button onClick={handleAdd} disabled={adding} style={styles.addBtn}>
            + Add Task
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" },
  th: { textAlign: "left", padding: "0.4rem", background: "#f9fafb", fontSize: "0.75rem" },
  td: { padding: "0.4rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.82rem" },
  deleteBtn: { background: "none", border: "none", color: "#dc2626", cursor: "pointer" },
  addRow: { display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center", padding: "0.75rem", background: "#f9fafb", borderRadius: "6px" },
  inputSmall: { padding: "0.4rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.82rem", minWidth: "100px" },
  inputTiny: { padding: "0.4rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "0.82rem", width: "70px" },
  addBtn: { padding: "0.4rem 0.8rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.82rem" },
};
