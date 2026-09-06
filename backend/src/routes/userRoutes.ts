import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  getAllUsers,
  inviteUser,
  updateUserRole,
  deleteUser,
  getUserProfile,
} from "../controllers/userController";

const router = Router();

router.use(authenticate);
router.use(authorize("manager")); // All user management routes are manager-only

router.get("/", getAllUsers);
router.post("/", inviteUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);
router.get("/:id/profile", getUserProfile);

export default router;