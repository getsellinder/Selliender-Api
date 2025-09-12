import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addSubject,
  deleteSubject,
  getsubjectById,
  getSubjects,
  updateSubject,
  getsubjectByGenreId,
} from "./SubjectController.js";
import { rolesAdmin } from "../../Utils/authorizeRoles.js";

const router = express.Router();

//  Create a new subject
router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles(...rolesAdmin), addSubject);

// Get all subjects
router.route("/getSubjects").get(getSubjects);
router.route("/getSubjects/by/:id").get(getsubjectByGenreId);
router.route("/getSubject/:id").get(getsubjectById);

// Update a subject
router
  .route("/update/:_id")
  .patch(isAuthenticatedUser, authorizeRoles(...rolesAdmin), updateSubject);
// Delete a subject
router
  .route("/delete/:_id")
  .delete(isAuthenticatedUser, authorizeRoles(...rolesAdmin), deleteSubject);

export default router;
