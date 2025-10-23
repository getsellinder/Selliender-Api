import bodyParser from "body-parser";
import {
  deleteOneOrder,
  getAllOrder,
  getOrders,
  getOrderSuccess,
  getSingleOrder,
  getUserSelf,
  updateOrderStatusById,
} from "./orderController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import express from "express";
import {
  captureOrderPayment,
  createOrderCheckout,
  getClientId,
} from "./CheckoutController.js";

const app = express();

// Configure bodyParser to parse the raw request body as a buffer
app.use(bodyParser.raw({ type: "application/json" }));
import { handlePayment, webhook } from "./StripeCheckOutController.js";
import {
  checkout,
  getRazerpayKey,
  getRzpkey,
  paymentVerification,
  pospaymentVerification,
} from "./RazerPayCheckoutController.js";
import { poscreateOrderCheckout } from "./PosCheckoutController.js";
const router = express.Router();
//checkout Routes-------------------------//
router.route("/checkout/").post(isAuthenticatedUser, createOrderCheckout);
//checkout Paypal Routes-------------------------//
router
  .route("/pos-checkout/")
  .post(isAuthenticatedUser, poscreateOrderCheckout);
router.route("/clientid/get/").get(isAuthenticatedUser, getClientId);
router.route("/:orderID/capture/payment").post(captureOrderPayment);
// ---------------------------------------------------
// ----------------------stripe checkOut-----------------//
// app.post("/webhook", express.raw({ type: "application/json" }), webhook);
// router.route("/stripe-checkout").post(isAuthenticatedUser, handlePayment);
router.route("/razorpay-checkout").post(isAuthenticatedUser, handlePayment);
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), webhook);

// --------------------------------------------------
//get user self
router.route("/user/self").get(isAuthenticatedUser, getUserSelf);

//admin route
router
  .route("/getAll/:status")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), getAllOrder);
router
  .route("/getAll/")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), getOrders);
router.route("/getOne/:id").get(isAuthenticatedUser, getSingleOrder);
//get success Order By  session id
router.route("/success/:sessionId").get(isAuthenticatedUser, getOrderSuccess);

router
  .route("/change/status/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateOrderStatusById
  );

router
  .route("/delete/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteOneOrder
  );

//RAZERPAY checkout
router
  .route("/getRzpKey/:name/:email")
  .get(isAuthenticatedUser, getRazerpayKey);
router.route("/getRzpKey/").get(isAuthenticatedUser, getRzpkey);
router.route("/Rzpcheckout/").post(isAuthenticatedUser, checkout);
router.route("/paymentverification").post(paymentVerification);
router.route("/pos-paymentverification").post(pospaymentVerification);
// router.route("/product/getAll/").get(getAllProduct)

export default router;
