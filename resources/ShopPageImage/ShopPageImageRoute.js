import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addImage,
  deleteImage,
  getImage,
  updateImage,
  CreateAndUpdateImage,
} from "./ShopPageImageController.js";

// import { addImage, deleteImage, getImage, updateImage } from "./RegistrationImageController.js";
// import { addImage, deleteImage, getImage, updateImage } from "./LoginImageController.js";
const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addImage);
router.route("/getImage").get(getImage);
router
  .route("/update/:_id")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "Customer"), updateImage);
router
  .route("/addmodify")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    CreateAndUpdateImage
  );
router
  .route("/delete/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImage
  );

export default router;
