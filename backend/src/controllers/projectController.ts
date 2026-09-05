import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// ============================
// GET ALL PROJECTS (any logged-in user can view, for dropdowns)
// ============================
export async function getAllProjects(req: AuthRequest, res: Response) {
  try {
    const [rows]: any = await pool.query("SELECT * FROM projects ORDER BY name ASC");
    return res.json({ projects: rows });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Server error fetching projects" });
  }
}

// ============================
// CREATE PROJECT (manager only)
// ============================
export async function createProject(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const [result]: any = await pool.query(
      "INSERT INTO projects (name, description) VALUES (?, ?)",
      [name.trim(), description || null]
    );

    return res.status(201).json({
      message: "Project created successfully",
      projectId: result.insertId,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ message: "Server error creating project" });
  }
}

// ============================
// UPDATE PROJECT (manager only)
// ============================
export async function updateProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const [result]: any = await pool.query(
      "UPDATE projects SET name = ?, description = ? WHERE id = ?",
      [name.trim(), description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Server error updating project" });
  }
}

// ============================
// DELETE PROJECT (manager only)
// ============================
export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const [result]: any = await pool.query("DELETE FROM projects WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
      return res.status(409).json({
        message: "Cannot delete: this project is used in existing reports",
      });
    }
    console.error("Delete project error:", error);
    return res.status(500).json({ message: "Server error deleting project" });
  }
}