import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addCategory,
  addcategoryname,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./categoryController.js";
const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addCategory);
router.route("/getCategories").get(getCategories);
router
  .route("/update/:_id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateCategory
  );
router
  .route("/delete/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteCategory
  );

// options;
router
  .route("/add/name")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    addcategoryname
  );

export default router;
