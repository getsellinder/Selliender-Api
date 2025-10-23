import { Router } from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import {
  addTax,
  updateTax,
  deleteTax,
  getTaxes,
  getTax,
  UpdateTaxStatus,
} from "./tax_controller.js";
const router = Router();

router
  .route("/add_tax")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addTax);
//change status
router
  .route("/update")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    UpdateTaxStatus
  );
//
router
  .route("/update_tax/:id")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "Customer"), updateTax);
router
  .route("/delete_tax/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin", "Customer"), deleteTax);
router.route("/view_tax/:id").get(isAuthenticatedUser, getTax);
router.route("/view_tax").get(isAuthenticatedUser, getTaxes);
export default router;
