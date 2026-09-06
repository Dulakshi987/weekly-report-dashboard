import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

// ============================
// GET ALL USERS (manager only)
// ============================
export async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY name ASC"
    );

    return res.json({
      users: rows,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      message: "Server error fetching users",
    });
  }
}

// ============================
// INVITE / CREATE USER (manager only)
// ============================
export async function inviteUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (role && !["team_member", "manager"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role || "team_member"]
    );

    return res.status(201).json({
      message: "User created",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Invite user error:", error);

    return res.status(500).json({
      message: "Server error creating user",
    });
  }
}

// ============================
// UPDATE USER ROLE (manager only)
// ============================
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["team_member", "manager"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    return res.json({
      message: "Role updated",
    });
  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      message: "Server error updating role",
    });
  }
}

// ============================
// REMOVE USER (manager only)
// ============================
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const requesterId = req.user.id;

    if (Number(id) === requesterId) {
      return res.status(400).json({
        message: "You cannot remove your own account",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      message: "User removed",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Server error removing user",
    });
  }
}

// ============================
// RESET USER PASSWORD (manager only)
// ============================
export async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [passwordHash, id]
    );

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Server error resetting password",
    });
  }
}

// ============================
// GET USER PROFILE (manager view)
// ============================
export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const [userRows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [reports] = await pool.query(
      `SELECT r.*, p.name AS project_name
       FROM reports r
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.week_start DESC`,
      [id]
    );

    // Basic stats
    const totalReports = reports.length;

    const approvedCount = reports.filter(
      (r) => r.status === "approved"
    ).length;

    const needsCorrectionCount = reports.filter(
      (r) => r.status === "needs_correction"
    ).length;

    const submittedCount = reports.filter(
      (r) => r.status === "submitted"
    ).length;

    // On-time rate:
    // approvedCount / totalReports
    const complianceRate =
      totalReports > 0
        ? Math.round((approvedCount / totalReports) * 100)
        : 0;

    return res.json({
      user: userRows[0],
      reports,
      stats: {
        totalReports,
        approvedCount,
        needsCorrectionCount,
        submittedCount,
        complianceRate,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      message: "Server error fetching user profile",
    });
  }
}