import { Router } from "express";
import { getTermsOfUse } from "./Config_controller.js";
const router = Router();

router.get("/termsofuse", getTermsOfUse);

export default router;
