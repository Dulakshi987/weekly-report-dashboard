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

export default router;