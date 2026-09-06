import { Router } from "express";

import { authenticate, authorize } from "../middleware/authMiddleware.js";

import { getDashboardStats } from "../controllers/statsController.js";

const router = Router();

router.use(authenticate);

router.get(
  "/dashboard",
  authorize("manager"),
  getDashboardStats
);

export default router;