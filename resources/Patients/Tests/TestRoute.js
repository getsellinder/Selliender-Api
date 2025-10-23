import express from "express";

const router = express.Router();
import { createTest, getselfTest, getSinglePatientAllTest } from "./TestController.js";
import { isAuthenticatedPatient } from "../../../middlewares/PatientAuth.js";




router.post('/create', isAuthenticatedPatient, createTest);
router.get('/self', isAuthenticatedPatient, getselfTest);
router.get('/:patientId', getSinglePatientAllTest);


// router.post('/rgstr_details-p2', isAuthenticatedPatient, EnterPatientDetails);
// router.post('/rgstr_psrnl_details-p3', isAuthenticatedPatient, EnterPersonalDetails);


// //change password
// router.put('/password/update', isAuthenticatedPatient, ChangePassword);

// //delete Patient
// router.delete('/delete/:id', isAuthenticatedUser, authorizeRoles("admin"), deletePatient);

export default router;
