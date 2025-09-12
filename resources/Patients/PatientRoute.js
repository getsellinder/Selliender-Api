import express from "express";

const router = express.Router();
import { EnterPatientDetails, EnterPersonalDetails, Otp, UploadProfileImage, create1RegistrationDetails, deletePatient, forgotPassword, getAllPatient, loginPatient, register, updateMobileNumber, verifyUpdatedMobileOtp, verifyOtp, UpdateProile, getmyProfile, ChangePassword, getOnePatient } from "./PatientController.js";
import { isAuthenticatedPatient } from "../../middlewares/PatientAuth.js";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";


router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginPatient);


router.post('/rgstr_details-p1', isAuthenticatedPatient, create1RegistrationDetails);
router.post('/rgstr_details-p2', isAuthenticatedPatient, EnterPatientDetails);
router.post('/rgstr_psrnl_details-p3', isAuthenticatedPatient, EnterPersonalDetails);
//admin 
router.get('/getAll', isAuthenticatedUser, authorizeRoles("admin"), getAllPatient);
router.get('/getOne/:id', isAuthenticatedUser, authorizeRoles("admin"), getOnePatient);
router.get('/my-profile', isAuthenticatedPatient, getmyProfile);

//Update Mobile Number
router.post('/update-mobile-number', isAuthenticatedPatient, updateMobileNumber);
router.post('/verify-updated-mobile-otp', isAuthenticatedPatient, verifyUpdatedMobileOtp);
router.post('/forgot-password', forgotPassword);
router.post('/profile-image/upload', isAuthenticatedPatient, UploadProfileImage);
router.patch('/profile/update', isAuthenticatedPatient, UpdateProile);

//change password
router.put('/password/update', isAuthenticatedPatient, ChangePassword);



//delete Patient
router.delete('/delete/:id', isAuthenticatedUser, authorizeRoles("admin"), deletePatient);





router.get('/otp', Otp);


export default router;
