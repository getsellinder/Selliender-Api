import express from "express";

import {
  createBlog,
  getAllBlog,
  getOneBlog,
  deleteBlog,
  deleteImageFromCloudinary,
  updateBlog,
  getBlogByTitle,
} from "./BlogController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/create")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), createBlog);
router.route("/getallblog").get(getAllBlog);
router.route("/getoneblog/:id").get(getOneBlog);
router.route("/getblog/:title").get(getBlogByTitle);
router
  .route("/deleteblog/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin", "Customer"), deleteBlog);
router
  .route("/deleteImage/jatinMor/Blog/:public_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImageFromCloudinary
  );
router
  .route("/updateblog/:id")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "Customer"), updateBlog);
export default router;
