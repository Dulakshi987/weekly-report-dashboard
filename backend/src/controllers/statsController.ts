import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// ============================
// DASHBOARD STATS (manager only)
// ============================
export async function getDashboardStats(req: AuthRequest, res: Response) {
  try {
    // 1. Submission status by team member (for current filter set, simplified: all-time)
    const [statusByMember]: any = await pool.query(
      `SELECT u.name AS user_name, r.status, COUNT(*) AS count
       FROM reports r JOIN users u ON r.user_id = u.id
       GROUP BY u.name, r.status`
    );

    // 2. Workload / task distribution by project (count of tasks per project)
    const [workloadByProject]: any = await pool.query(
      `SELECT p.name AS project_name, COUNT(t.id) AS task_count
       FROM tasks t
       JOIN reports r ON t.report_id = r.id
       LEFT JOIN projects p ON r.project_id = p.id
       GROUP BY p.name`
    );

    // 3. Time spent by task type, team-wide
    const [timeByTaskType]: any = await pool.query(
      `SELECT task_type, SUM(hours) AS total_hours
       FROM hours_breakdown
       GROUP BY task_type`
    );

    // 4. Tasks completed trend over time (by week)
    const [tasksCompletedTrend]: any = await pool.query(
      `SELECT r.week_start, COUNT(t.id) AS completed_count
       FROM tasks t
       JOIN reports r ON t.report_id = r.id
       WHERE t.status = 'completed'
       GROUP BY r.week_start
       ORDER BY r.week_start ASC`
    );

    // 5. Open blockers count (blockers belonging to non-approved reports)
    const [openBlockersRows]: any = await pool.query(
      `SELECT COUNT(*) AS count FROM blockers b
       JOIN reports r ON b.report_id = r.id
       WHERE r.status != 'approved'`
    );

    // 6. Recent activity feed (latest review actions)
    const [recentActivity]: any = await pool.query(
      `SELECT rc.action, rc.created_at, u.name AS manager_name, tm.name AS team_member_name, r.id AS report_id
       FROM review_comments rc
       JOIN users u ON rc.manager_id = u.id
       JOIN reports r ON rc.report_id = r.id
       JOIN users tm ON r.user_id = tm.id
       ORDER BY rc.created_at DESC
       LIMIT 10`
    );

    return res.json({
      statusByMember,
      workloadByProject,
      timeByTaskType,
      tasksCompletedTrend,
      openBlockersCount: openBlockersRows[0]?.count || 0,
      recentActivity,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
}