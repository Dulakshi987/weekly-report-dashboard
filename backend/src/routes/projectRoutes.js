import { Router } from "express";

import { authenticate, authorize } from "../middleware/authMiddleware.js";

import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = Router();

router.use(authenticate);

// Any logged-in user can view projects
router.get("/", getAllProjects);

// Only managers can create/edit/delete projects
router.post("/", authorize("manager"), createProject);

router.put("/:id", authorize("manager"), updateProject);

router.delete("/:id", authorize("manager"), deleteProject);

export default router;