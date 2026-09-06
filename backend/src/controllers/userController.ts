import { Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// ============================
// GET ALL USERS (manager only) - for User Management page
// ============================
export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const [rows]: any = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY name ASC"
    );
    return res.json({ users: rows });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Server error fetching users" });
  }
}

// ============================
// INVITE / CREATE USER (manager only)
// ============================
export async function inviteUser(req: AuthRequest, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (role && !["team_member", "manager"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [existing]: any = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role || "team_member"]
    );

    return res.status(201).json({ message: "User created", userId: result.insertId });
  } catch (error) {
    console.error("Invite user error:", error);
    return res.status(500).json({ message: "Server error creating user" });
  }
}

// ============================
// UPDATE USER ROLE (manager only)
// ============================
export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["team_member", "manager"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    return res.json({ message: "Role updated" });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({ message: "Server error updating role" });
  }
}

// ============================
// REMOVE USER (manager only)
// ============================
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const requesterId = req.user!.id;

    if (Number(id) === requesterId) {
      return res.status(400).json({ message: "You cannot remove your own account" });
    }

    const [result]: any = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User removed" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Server error removing user" });
  }
}

// ============================
// GET USER PROFILE (manager view) - user info + report history + basic stats
// ============================
export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const [userRows]: any = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [reports]: any = await pool.query(
      `SELECT r.*, p.name AS project_name FROM reports r
       LEFT JOIN projects p ON r.project_id = p.id
       WHERE r.user_id = ? ORDER BY r.week_start DESC`,
      [id]
    );

    // Basic stats
    const totalReports = reports.length;
    const approvedCount = reports.filter((r: any) => r.status === "approved").length;
    const needsCorrectionCount = reports.filter((r: any) => r.status === "needs_correction").length;
    const submittedCount = reports.filter((r: any) => r.status === "submitted").length;

    // On-time rate: approved on first submission (no needs_correction ever) - simplified as approvedCount/totalReports
    const complianceRate = totalReports > 0 ? Math.round((approvedCount / totalReports) * 100) : 0;

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
    return res.status(500).json({ message: "Server error fetching user profile" });
  }
}