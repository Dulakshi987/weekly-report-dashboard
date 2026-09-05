import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// ============================
// CREATE REPORT (Draft)
// ============================
export async function createReport(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { week_start, week_end, project_id, tasks_planned_next_week, notes } = req.body;

    if (!week_start || !week_end) {
      return res.status(400).json({ message: "week_start and week_end are required" });
    }

    const [result]: any = await pool.query(
      `INSERT INTO reports (user_id, project_id, week_start, week_end, status, tasks_planned_next_week, notes)
       VALUES (?, ?, ?, ?, 'draft', ?, ?)`,
      [userId, project_id || null, week_start, week_end, tasks_planned_next_week || null, notes || null]
    );

    return res.status(201).json({
      message: "Report created as draft",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({ message: "Server error creating report" });
  }
}

// ============================
// GET MY REPORTS (Team Member's own history)
// ============================
export async function getMyReports(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = `SELECT r.*, p.name AS project_name 
                 FROM reports r 
                 LEFT JOIN projects p ON r.project_id = p.id
                 WHERE r.user_id = ?`;
    const params: any[] = [userId];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.week_start DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [rows]: any = await pool.query(query, params);

    return res.json({ reports: rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("Get my reports error:", error);
    return res.status(500).json({ message: "Server error fetching reports" });
  }
}

// ============================
// GET ALL REPORTS (Manager view, with filters)
// ============================
export async function getAllReports(req: AuthRequest, res: Response) {
  try {
    const { page = 1, limit = 10, status, user_id, project_id, week_start, week_end } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `SELECT r.*, u.name AS user_name, p.name AS project_name
                 FROM reports r
                 JOIN users u ON r.user_id = u.id
                 LEFT JOIN projects p ON r.project_id = p.id
                 WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (user_id) {
      query += ` AND r.user_id = ?`;
      params.push(user_id);
    }
    if (project_id) {
      query += ` AND r.project_id = ?`;
      params.push(project_id);
    }
    if (week_start) {
      query += ` AND r.week_start >= ?`;
      params.push(week_start);
    }
    if (week_end) {
      query += ` AND r.week_end <= ?`;
      params.push(week_end);
    }

    query += ` ORDER BY r.week_start DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [rows]: any = await pool.query(query, params);

    return res.json({ reports: rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("Get all reports error:", error);
    return res.status(500).json({ message: "Server error fetching reports" });
  }
}

// ============================
// GET SINGLE REPORT (Detail view)
// ============================
export async function getReportById(req: AuthRequest, res: Response) {
  try {
    const reportId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const [rows]: any = await pool.query(
      `SELECT r.*, u.name AS user_name, p.name AS project_name
       FROM reports r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.id = ?`,
      [reportId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = rows[0];

    // Ownership check: team members can only view their own reports
    if (userRole === "team_member" && report.user_id !== userId) {
      return res.status(403).json({ message: "Access denied: not your report" });
    }

    // Fetch related data
    const [tasks]: any = await pool.query("SELECT * FROM tasks WHERE report_id = ?", [reportId]);
    const [blockers]: any = await pool.query("SELECT * FROM blockers WHERE report_id = ?", [reportId]);
    const [achievements]: any = await pool.query("SELECT * FROM achievements WHERE report_id = ?", [reportId]);
    const [hoursBreakdown]: any = await pool.query("SELECT * FROM hours_breakdown WHERE report_id = ?", [reportId]);
    const [versions]: any = await pool.query(
      "SELECT id, submitted_at FROM report_versions WHERE report_id = ? ORDER BY submitted_at DESC",
      [reportId]
    );
    const [comments]: any = await pool.query(
      `SELECT rc.*, u.name AS manager_name FROM review_comments rc
       JOIN users u ON rc.manager_id = u.id
       WHERE rc.report_id = ? ORDER BY rc.created_at DESC`,
      [reportId]
    );

    return res.json({
      report,
      tasks,
      blockers,
      achievements,
      hoursBreakdown,
      versions,
      comments,
    });
  } catch (error) {
    console.error("Get report by id error:", error);
    return res.status(500).json({ message: "Server error fetching report" });
  }
}

// ============================
// UPDATE REPORT (only when draft or needs_correction)
// ============================
export async function updateReport(req: AuthRequest, res: Response) {
  try {
    const reportId = req.params.id;
    const userId = req.user!.id;
    const { project_id, week_start, week_end, tasks_planned_next_week, notes } = req.body;

    const [rows]: any = await pool.query("SELECT * FROM reports WHERE id = ?", [reportId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = rows[0];

    if (report.user_id !== userId) {
      return res.status(403).json({ message: "Access denied: not your report" });
    }

    if (!["draft", "needs_correction"].includes(report.status)) {
      return res.status(400).json({ message: "Report can only be edited while in draft or needs_correction status" });
    }

    await pool.query(
      `UPDATE reports 
       SET project_id = ?, week_start = ?, week_end = ?, tasks_planned_next_week = ?, notes = ?
       WHERE id = ?`,
      [project_id || null, week_start, week_end, tasks_planned_next_week || null, notes || null, reportId]
    );

    return res.json({ message: "Report updated successfully" });
  } catch (error) {
    console.error("Update report error:", error);
    return res.status(500).json({ message: "Server error updating report" });
  }
}

// ============================
// SUBMIT REPORT (draft/needs_correction -> submitted)
// ============================
export async function submitReport(req: AuthRequest, res: Response) {
  try {
    const reportId = req.params.id;
    const userId = req.user!.id;

    const [rows]: any = await pool.query("SELECT * FROM reports WHERE id = ?", [reportId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = rows[0];

    if (report.user_id !== userId) {
      return res.status(403).json({ message: "Access denied: not your report" });
    }

    if (!["draft", "needs_correction"].includes(report.status)) {
      return res.status(400).json({ message: "Only draft or needs_correction reports can be submitted" });
    }

    // Save version snapshot before submitting (bonus: version history)
    const [tasks]: any = await pool.query("SELECT * FROM tasks WHERE report_id = ?", [reportId]);
    const [blockers]: any = await pool.query("SELECT * FROM blockers WHERE report_id = ?", [reportId]);
    const [achievements]: any = await pool.query("SELECT * FROM achievements WHERE report_id = ?", [reportId]);

    const snapshot = { report, tasks, blockers, achievements };

    await pool.query(
      "INSERT INTO report_versions (report_id, content_snapshot) VALUES (?, ?)",
      [reportId, JSON.stringify(snapshot)]
    );

    await pool.query(
      "UPDATE reports SET status = 'submitted', submitted_at = NOW() WHERE id = ?",
      [reportId]
    );

    return res.json({ message: "Report submitted for review" });
  } catch (error) {
    console.error("Submit report error:", error);
    return res.status(500).json({ message: "Server error submitting report" });
  }
}

// ============================
// REVIEW REPORT (Manager: Approve or Request Changes)
// ============================
export async function reviewReport(req: AuthRequest, res: Response) {
  try {
    const reportId = req.params.id;
    const managerId = req.user!.id;
    const { action, comment } = req.body; // action: 'approved' | 'requested_changes'

    if (!["approved", "requested_changes"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (action === "requested_changes" && !comment) {
      return res.status(400).json({ message: "Comment is required when requesting changes" });
    }

    const [rows]: any = await pool.query("SELECT * FROM reports WHERE id = ?", [reportId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = rows[0];

    if (report.status !== "submitted") {
      return res.status(400).json({ message: "Only submitted reports can be reviewed" });
    }

    // Get latest version id (the one being reviewed)
    const [versions]: any = await pool.query(
      "SELECT id FROM report_versions WHERE report_id = ? ORDER BY submitted_at DESC LIMIT 1",
      [reportId]
    );
    const latestVersionId = versions.length > 0 ? versions[0].id : null;

    const newStatus = action === "approved" ? "approved" : "needs_correction";

    await pool.query(
      `UPDATE reports 
       SET status = ?, latest_comment = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [newStatus, comment || null, managerId, reportId]
    );

    await pool.query(
      `INSERT INTO review_comments (report_id, report_version_id, manager_id, comment, action)
       VALUES (?, ?, ?, ?, ?)`,
      [reportId, latestVersionId, managerId, comment || "Approved", action]
    );

    return res.json({ message: `Report ${newStatus}` });
  } catch (error) {
    console.error("Review report error:", error);
    return res.status(500).json({ message: "Server error reviewing report" });
  }
}