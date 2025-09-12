import express from "express";
import { createCheckoutSessionController } from "./stripeController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSessionController);

export default router;
