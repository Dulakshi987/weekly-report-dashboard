import { pool } from "../config/db.js";

// ============================
// DASHBOARD STATS (manager only)
// ============================
export async function getDashboardStats(req, res) {
  try {
    // 1. Submission status by team member
    const [statusByMember] = await pool.query(
      `SELECT u.name AS user_name, r.status, COUNT(*) AS count
       FROM reports r
       JOIN users u ON r.user_id = u.id
       GROUP BY u.name, r.status`
    );

    // 2. Workload / task distribution by project
    const [workloadByProject] = await pool.query(
      `SELECT p.name AS project_name, COUNT(t.id) AS task_count
       FROM tasks t
       JOIN reports r ON t.report_id = r.id
       LEFT JOIN projects p ON r.project_id = p.id
       GROUP BY p.name`
    );

    // 3. Time spent by task type
    const [timeByTaskType] = await pool.query(
      `SELECT task_type, SUM(hours) AS total_hours
       FROM hours_breakdown
       GROUP BY task_type`
    );

    // 4. Tasks completed trend over time
    const [tasksCompletedTrend] = await pool.query(
      `SELECT r.week_start, COUNT(t.id) AS completed_count
       FROM tasks t
       JOIN reports r ON t.report_id = r.id
       WHERE t.status = 'completed'
       GROUP BY r.week_start
       ORDER BY r.week_start ASC`
    );

    // 5. Open blockers count
    const [openBlockersRows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM blockers b
       JOIN reports r ON b.report_id = r.id
       WHERE r.status != 'approved'`
    );

    // 6. Recent activity feed
    const [recentActivity] = await pool.query(
      `SELECT rc.action,
              rc.created_at,
              u.name AS manager_name,
              tm.name AS team_member_name,
              r.id AS report_id
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

    return res.status(500).json({
      message: "Server error fetching dashboard stats",
    });
  }
}