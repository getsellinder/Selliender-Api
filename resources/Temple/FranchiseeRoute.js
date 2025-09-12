import { Router } from "express";
const router = Router();
import {
  addFranchisee,
  getAllFranchisees,
  getFranchiseeById,
  updateFranchisee,
  deleteFranchiseeById,
  getFranchiseeByIdWithoutPopulate,
  getAllFranchiseesPopulated,
  // getAllFranchiseesPopulatedWithOption,
  addProductToFranchisee,
  // addGradeToFranchisee,
  getFranchiseeByIdPopulated,
  FranchiseeLogin,
  franchiseeForgotPassword,
  franchiseeUpdatePassword,
  getFransiDetails,
  EditFranchiseeProfile,
} from "./Franchisee_controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
  isFranchiAuthenticated,
} from "../../middlewares/auth.js";
import { FranchiseeVarificationFromAdmin } from "./Franchisee_controller.js";
import { FranchiseePriceLevelProduct } from "./Franchisee_controller.js";
import { createOrder } from "./Franchisee_controller.js";
import { EditOrderBeforePayment } from "./Franchisee_controller.js";
import { getSingleOrder } from "./Franchisee_controller.js";
import { getAllOrder } from "./Franchisee_controller.js";

router.get("/", getAllFranchisees);
router.get("/withpopulate", isAuthenticatedUser, getAllFranchiseesPopulated);
// router.get("/withpopulate/:option", getAllFranchiseesPopulatedWithOption);
router.get(
  "/withoutpopulate/:id",
  isAuthenticatedUser,
  getFranchiseeByIdWithoutPopulate
);

router.get("/:id", isAuthenticatedUser, getFranchiseeById);
router.get("/arrayspopulate/:id", getFranchiseeByIdPopulated);
router.post(
  "/",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  addFranchisee
);
router.patch("/product/:id", isAuthenticatedUser, addProductToFranchisee);
// router.patch("/grade/:id", addGradeToFranchisee);
router.patch(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  updateFranchisee
);
router.delete(
  "/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  deleteFranchiseeById
);
//varify
router.get(
  "/admin/verify/:id",
  isAuthenticatedUser,
  authorizeRoles("admin", "Customer"),
  FranchiseeVarificationFromAdmin
);

// ---------franchisee Auth ----------------------////////
franchiseeForgotPassword;
router.post("/login", FranchiseeLogin);
router.post("/password/forgot", franchiseeForgotPassword);
router.get("/getDetails/me", isFranchiAuthenticated, getFransiDetails);
router.patch("/edit/self", isFranchiAuthenticated, EditFranchiseeProfile);

router
  .route("/password/update")
  .put(isFranchiAuthenticated, franchiseeUpdatePassword);
//fetch product franchisee Wise
router
  .route("/product/price_level")
  .get(isFranchiAuthenticated, FranchiseePriceLevelProduct);
//product order
router.route("/order/create").post(isFranchiAuthenticated, createOrder);
router.route("/order/getAll").get(isFranchiAuthenticated, getAllOrder);
router.route("/order/getOne/:id").get(isFranchiAuthenticated, getSingleOrder);
router
  .route("/order/edit/:id")
  .put(isFranchiAuthenticated, EditOrderBeforePayment);

export default router;
