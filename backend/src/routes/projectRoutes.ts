import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";

const router = Router();

router.use(authenticate);

// Any logged-in user can view projects (needed for report form dropdown)
router.get("/", getAllProjects);

// Only managers can create/edit/delete projects
router.post("/", authorize("manager"), createProject);
router.put("/:id", authorize("manager"), updateProject);
router.delete("/:id", authorize("manager"), deleteProject);

export default router;