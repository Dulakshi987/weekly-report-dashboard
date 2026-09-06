import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  updateReport,
  submitReport,
  reviewReport,
} from "../controllers/reportController";
import {
  addTask, updateTask, deleteTask,
  addBlocker, deleteBlocker,
  addAchievement, deleteAchievement,
  upsertHours,
} from "../controllers/reportItemsController";

const router = Router();

// All report routes require authentication
router.use(authenticate);

// Team member routes
router.post("/", createReport);
router.get("/my", getMyReports);
router.put("/:id", updateReport);
router.put("/:id/submit", submitReport);

// Manager-only routes
router.get("/", authorize("manager"), getAllReports);
router.put("/:id/review", authorize("manager"), reviewReport);

// Shared route (ownership checked inside controller)
router.get("/:id", getReportById);

// Tasks
router.post("/:reportId/tasks", addTask);
router.put("/:reportId/tasks/:taskId", updateTask);
router.delete("/:reportId/tasks/:taskId", deleteTask);

// Blockers
router.post("/:reportId/blockers", addBlocker);
router.delete("/:reportId/blockers/:blockerId", deleteBlocker);

// Achievements
router.post("/:reportId/achievements", addAchievement);
router.delete("/:reportId/achievements/:achievementId", deleteAchievement);

// Hours breakdown
router.put("/:reportId/hours", upsertHours);

export default router;