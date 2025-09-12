import bodyParser from "body-parser";
import {
  closedticktbyuser,
  createSupport,
  createSupportUser,
  deleteImageFromCloudinary,
  deleteSupport,
  getAllSupportTicket,
  getAllSupportTicketofuser,
  getAllSupportTicketUser,
  getAllSupportUserForOnlineStatus,
  getOneSupportTicket,
  updateSupport,
} from "./supportController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import express from "express";
import { isAuthenticatedPatient } from "../../middlewares/PatientAuth.js";
import { isAuthenticatedUserOrPatient } from "../../middlewares/AuthUserOrPatient.js";

const app = express();

// Configure bodyParser to parse the raw request body as a buffer
app.use(bodyParser.raw({ type: "application/json" }));

const router = express.Router();
//checkout Routes-------------------------//
router
  .route("/support/create/")
  .post(isAuthenticatedUserOrPatient, createSupport);
// user

router
  .route("/support/user/create/")
  .post(isAuthenticatedUserOrPatient, createSupportUser);

router
  .route("/support/user/get/")
  .get(isAuthenticatedUserOrPatient, getAllSupportTicketUser);
router
  .route("/support/user/update/status/:ticketId")
  .put(isAuthenticatedUserOrPatient, closedticktbyuser);

router
  .route("/support/user/online/status/")
  .get(isAuthenticatedUserOrPatient, getAllSupportUserForOnlineStatus);
// user closedticktbyuser

router
  .route("/support/getAll/")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getAllSupportTicket
  );
// router
//   .route("/support/userticket/")
//   .get(isAuthenticatedUserOrPatient, getAllSupportTicketofuser);

router.route("/support/delete/:ticketId").delete(deleteSupport);
router
  .route("/support/getOne/:id")
  .get(isAuthenticatedUserOrPatient, getOneSupportTicket);
router
  .route("/support/update/:id")
  .patch(isAuthenticatedUserOrPatient, updateSupport);
router
  .route("/support/deleteImage/jatinMor/CustomerSupport/:public_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImageFromCloudinary
  );
// ---------------------------------------------------------

export default router;
