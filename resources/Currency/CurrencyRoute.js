import express from "express";

import {
  createnew,
  getAllcarrency,
  updatecarrency,
  deletecarrency,
} from "./CurrencyController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/new")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), createnew);
router.route("/getall").get(getAllcarrency);
// router.route("/getoneblog/:id").get(getOneBlog);
router
  .route("/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deletecarrency
  );

router
  .route("/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatecarrency
  );
export default router;
