import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import {
  addReview,
  ChangeChapterStatus,
  createNewChapter,
  deleteChapter,
  deleteImageFromCloudinary,
  deleteReview,
  getAllChapterUser,
  getChapterByName,
  getChaptersByGenre,
  getOneChapter,
  getReviews,
  RestoreChapter,
  updateChapter,
  updateReview,
} from "./ChapterController.js";

const router = express.Router();

// Create a new chapter
router
  .route("/chapter/create")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    createNewChapter
  );

// Get chapter by id
router.route("/chapter/getOne/:id").get(getOneChapter);

// Get Chapter By name
router.route("/chapter/getByName/:name").get(getChapterByName);

// Get all chapters by Admin

router
  .route("/chapter/restore/chapter/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    RestoreChapter
  );

// Get chapter by genreName
router.route("/chapter/genre/:genreName").get(getChaptersByGenre);

// Reviews

// create review
router
  .route("/chapter/:chapterId/reviews")
  .post(isAuthenticatedUser, addReview);
// get review
router.get("/chapter/:chapterId/reviews", getReviews);
// Route to update a review
router.put("/chapter/:chapterId/reviews", isAuthenticatedUser, updateReview);

router.delete("/chapter/:chapterId/reviews", isAuthenticatedUser, deleteReview);

// UPDATE
router
  .route("/chapter/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateChapter
  );

// Change Chapter Status
router.route("/chapter/admin/status/:id").patch(ChangeChapterStatus);

// Get All Chapter By User
router.route("/chapter/getAll/user/").get(getAllChapterUser);

// Get All Chapter By Devices

// DELETE

// delete chapter by Id
router
  .route("/chapter/delete/:id")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteChapter
  );

//  delete chapter image
router
  .route("/chapter/deleteImage/jatinMor/chapter/:public_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImageFromCloudinary
  );

export default router;
