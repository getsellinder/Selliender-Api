import express from "express";
import { createMessageUser, getMessagesUser } from "./Message.Controll.js";
import { isAuthenticatedUserOrPatient } from "../../middlewares/AuthUserOrPatient.js";

const router = express.Router();

router
  .route("/user/message/create/:ticketId")
  .post(isAuthenticatedUserOrPatient, createMessageUser);

router
  .route("/user/message/get/:ticketId")
  .get(isAuthenticatedUserOrPatient, getMessagesUser);

export default router;
