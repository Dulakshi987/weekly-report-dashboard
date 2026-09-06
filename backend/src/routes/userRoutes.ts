import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware";
import {
  getAllUsers,
  inviteUser,
  updateUserRole,
  deleteUser,
  getUserProfile,
  resetUserPassword,
} from "../controllers/userController";

const router = Router();

router.use(authenticate);
router.use(authorize("manager")); // All user management routes are manager-only

router.get("/", getAllUsers);
router.post("/", inviteUser);
router.put("/:id/role", updateUserRole);
router.put("/:id/password", resetUserPassword);
router.delete("/:id", deleteUser);
router.get("/:id/profile", getUserProfile);

export default router;