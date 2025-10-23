import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  AddNewnIformation,
  FindAllInformation,
} from "./InformationController.js";

const router = express.Router();

router
  .route("/new")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    AddNewnIformation
  );
router
  .route("/getAll")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    FindAllInformation
  );

// router.route("/product/getAll/").get(getAllProduct)

export default router;
