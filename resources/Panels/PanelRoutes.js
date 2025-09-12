import express from "express";

import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  AddPanel1,
  AddPanel2,
  AddPanel3,
  AddPanel4,
  deleteImageFromCloudinary,
  getPanel1,
  getPanel2,
  getPanel3,
  getPanel4,
  updatePanel1,
  updatePanel2,
  updatePanel3,
  updatePanel4,
} from "./PanelController.js";

const router = express.Router();

router
  .route("/panel1/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddPanel1);
router.route("/panel1/get").get(getPanel1);

router
  .route("/panel1/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatePanel1
  );

router
  .route("/panel2/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddPanel2);
router.route("/panel2/get").get(getPanel2);

router
  .route("/panel2/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatePanel2
  );

router
  .route("/panel3/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddPanel3);
router.route("/panel3/get").get(getPanel3);

router
  .route("/panel3/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatePanel3
  );

router
  .route("/panel4/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), AddPanel4);
router.route("/panel4/get").get(getPanel4);

router
  .route("/panel4/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatePanel4
  );

router
  .route("/deleteImage/jatinMor/panel/:public_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImageFromCloudinary
  );
export default router;
