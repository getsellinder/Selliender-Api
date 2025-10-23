import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addCollection,
  deleteCollection,
  getCollections,
  updateCollection,
} from "./CollectionController.js";
const router = express.Router();

router
  .route("/add")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    addCollection
  );
router.route("/getCollections").get(getCollections);
router
  .route("/update/:_id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateCollection
  );
router
  .route("/delete/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteCollection
  );

export default router;
