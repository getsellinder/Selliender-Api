// routes/reviewStatusRoutes.js
import express from "express";
// import { getReviewStatus, updateReviewStatus } from './ReviewStatusController';
import {
  getReviewStatus,
  updateReviewStatus,
} from "./ReviewStatusController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

// GET: Get current review status (enabled or disabled)
router.get(
  "/status", 
  // isAuthenticatedUser, authorizeRoles("admin", "Employee"),
  getReviewStatus
);

// PUT: Update review status (enabled or disabled)
router.patch(
  "/status", 
  // isAuthenticatedUser, authorizeRoles("admin", "Employee"),
  updateReviewStatus
);

export default router;
