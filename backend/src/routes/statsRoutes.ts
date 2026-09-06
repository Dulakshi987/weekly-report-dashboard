import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/statsController";

const router = Router();

router.use(authenticate);
router.get("/dashboard", authorize("manager"), getDashboardStats);

export default router;