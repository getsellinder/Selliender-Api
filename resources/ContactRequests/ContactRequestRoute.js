import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  AddNewContactRequest,
  FindAllContactRequest,
  getAllContactSalesRequest,
  ContactSalesRequest,
} from "./ContactRequestsController.js";

const router = express.Router();

router.route("/new").post(AddNewContactRequest);
router.route("/contact/sales").post(ContactSalesRequest);
router.route("/getAll/contact/sales").get(getAllContactSalesRequest);
router.route("/getAll").get(FindAllContactRequest);

export default router;
