import { pool } from "../config/db.js";

// Helper: verify the report belongs to the user and is editable
async function verifyEditableReport(reportId, userId) {
  const [rows] = await pool.query(
    "SELECT * FROM reports WHERE id = ?",
    [reportId]
  );

  if (rows.length === 0) {
    return {
      error: "Report not found",
      status: 404,
    };
  }

  const report = rows[0];

  if (report.user_id !== userId) {
    return {
      error: "Access denied: not your report",
      status: 403,
    };
  }

  if (!["draft", "needs_correction"].includes(report.status)) {
    return {
      error:
        "Report can only be edited while in draft or needs_correction status",
      status: 400,
    };
  }

  return { report };
}

// ============================
// TASKS
// ============================

export async function addTask(req, res) {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    const {
      task_name,
      priority,
      planned_percent,
      actual_percent,
      status,
      time_planned_hours,
      time_spent_hours,
      deliverable,
    } = req.body;

    if (!task_name) {
      return res.status(400).json({
        message: "task_name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks 
       (report_id, task_name, priority, planned_percent, actual_percent, 
        status, time_planned_hours, time_spent_hours, deliverable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportId,
        task_name,
        priority || "medium",
        planned_percent || 0,
        actual_percent || 0,
        status || "not_started",
        time_planned_hours || 0,
        time_spent_hours || 0,
        deliverable || null,
      ]
    );

    return res.status(201).json({
      message: "Task added",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Add task error:", error);

    return res.status(500).json({
      message: "Server error adding task",
    });
  }
}

export async function updateTask(req, res) {
  try {
    const { reportId, taskId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    const {
      task_name,
      priority,
      planned_percent,
      actual_percent,
      status,
      time_planned_hours,
      time_spent_hours,
      deliverable,
    } = req.body;

    await pool.query(
      `UPDATE tasks 
       SET task_name = ?, 
           priority = ?, 
           planned_percent = ?, 
           actual_percent = ?,
           status = ?, 
           time_planned_hours = ?, 
           time_spent_hours = ?, 
           deliverable = ?
       WHERE id = ? AND report_id = ?`,
      [
        task_name,
        priority,
        planned_percent,
        actual_percent,
        status,
        time_planned_hours,
        time_spent_hours,
        deliverable,
        taskId,
        reportId,
      ]
    );

    return res.json({
      message: "Task updated",
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      message: "Server error updating task",
    });
  }
}

export async function deleteTask(req, res) {
  try {
    const { reportId, taskId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    await pool.query(
      "DELETE FROM tasks WHERE id = ? AND report_id = ?",
      [taskId, reportId]
    );

    return res.json({
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      message: "Server error deleting task",
    });
  }
}

// ============================
// BLOCKERS
// ============================

export async function addBlocker(req, res) {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    const { description, is_key_issue } = req.body;

    if (!description) {
      return res.status(400).json({
        message: "description is required",
      });
    }

    // If this one is marked key issue,
    // unset any existing key issue for this report
    if (is_key_issue) {
      await pool.query(
        "UPDATE blockers SET is_key_issue = FALSE WHERE report_id = ?",
        [reportId]
      );
    }

    const [result] = await pool.query(
      "INSERT INTO blockers (report_id, description, is_key_issue) VALUES (?, ?, ?)",
      [reportId, description, !!is_key_issue]
    );

    return res.status(201).json({
      message: "Blocker added",
      blockerId: result.insertId,
    });
  } catch (error) {
    console.error("Add blocker error:", error);

    return res.status(500).json({
      message: "Server error adding blocker",
    });
  }
}

export async function deleteBlocker(req, res) {
  try {
    const { reportId, blockerId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    await pool.query(
      "DELETE FROM blockers WHERE id = ? AND report_id = ?",
      [blockerId, reportId]
    );

    return res.json({
      message: "Blocker deleted",
    });
  } catch (error) {
    console.error("Delete blocker error:", error);

    return res.status(500).json({
      message: "Server error deleting blocker",
    });
  }
}

// ============================
// ACHIEVEMENTS
// ============================

export async function addAchievement(req, res) {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    const { description, is_key_achievement } = req.body;

    if (!description) {
      return res.status(400).json({
        message: "description is required",
      });
    }

    if (is_key_achievement) {
      await pool.query(
        "UPDATE achievements SET is_key_achievement = FALSE WHERE report_id = ?",
        [reportId]
      );
    }

    const [result] = await pool.query(
      "INSERT INTO achievements (report_id, description, is_key_achievement) VALUES (?, ?, ?)",
      [reportId, description, !!is_key_achievement]
    );

    return res.status(201).json({
      message: "Achievement added",
      achievementId: result.insertId,
    });
  } catch (error) {
    console.error("Add achievement error:", error);

    return res.status(500).json({
      message: "Server error adding achievement",
    });
  }
}

export async function deleteAchievement(req, res) {
  try {
    const { reportId, achievementId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    await pool.query(
      "DELETE FROM achievements WHERE id = ? AND report_id = ?",
      [achievementId, reportId]
    );

    return res.json({
      message: "Achievement deleted",
    });
  } catch (error) {
    console.error("Delete achievement error:", error);

    return res.status(500).json({
      message: "Server error deleting achievement",
    });
  }
}

// ============================
// HOURS BREAKDOWN
// ============================

export async function upsertHours(req, res) {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    const check = await verifyEditableReport(reportId, userId);

    if (check.error) {
      return res.status(check.status).json({
        message: check.error,
      });
    }

    const { hours } = req.body;

    // Expects array: [{ task_type, hours }]
    if (!Array.isArray(hours)) {
      return res.status(400).json({
        message: "hours must be an array",
      });
    }

    // Replace all existing hours entries for this report
    await pool.query(
      "DELETE FROM hours_breakdown WHERE report_id = ?",
      [reportId]
    );

    for (const h of hours) {
      if (h.task_type && h.hours >= 0) {
        await pool.query(
          "INSERT INTO hours_breakdown (report_id, task_type, hours) VALUES (?, ?, ?)",
          [reportId, h.task_type, h.hours]
        );
      }
    }

    return res.json({
      message: "Hours breakdown saved",
    });
  } catch (error) {
    console.error("Upsert hours error:", error);

    return res.status(500).json({
      message: "Server error saving hours breakdown",
    });
  }
}