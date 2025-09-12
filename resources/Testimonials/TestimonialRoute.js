import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  AddNewTestimonial,
  FindAllTestimonial,
  FindOneTestimonial,
  deleteImageFromCloudinary,
  deleteTestimonial,
  updatetesTimonial,
} from "./TestimonialController.js";

const router = express.Router();

router.route("/new").post(isAuthenticatedUser, AddNewTestimonial);
router.route("/getAll").get(FindAllTestimonial);
router.route("/getOne/:id").get(isAuthenticatedUser, FindOneTestimonial);
router
  .route("/delete/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteTestimonial
  );
router
  .route("/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updatetesTimonial
  );
router
  .route("/deleteImage/GetSygnal/Testimonial/:public_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImageFromCloudinary
  );
export default router;
