import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import {
  addGenre,
  deleteGenre,
  Genrescreen,
  getAllGenres,
  homescreen,
  playercontrols,
  seriesScreen,
  Subgenrescreen,
  updateGenre,
  AllGenreScreenData,
  getsubjectbygenrename,
  getsubgenrwithsubjectname,
  getAllsubgenre,
  createsubgenreundergenre,
} from "./GenreController.js";
import { Chapter } from "../Chapter/ChapterModel.js";
const router = express.Router();

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addGenre);
router
  .route("/get/genreName/subject")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getsubjectbygenrename
  );
router
  .route("/getAllGenres/subject")
  .get(isAuthenticatedUser, getsubgenrwithsubjectname);

router.route("/getAllGenres").get(isAuthenticatedUser, getAllGenres);

router.route("/getAll/subgenre/:id").get(isAuthenticatedUser, getAllsubgenre);

router
  .route("/update/:_id")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "Customer"), updateGenre);
router
  .route("/delete/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteGenre
  );

router
  .route("/screen/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), Genrescreen);

router
  .route("/screen/")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    AllGenreScreenData
  );

router
  .route("/subgen/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    Subgenrescreen
  );
router
  .route("/home/screen")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), homescreen);
router
  .route("/series/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), seriesScreen);

router
  .route("/player/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    playercontrols
  );

router
  .route("/subgenre/:id")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    createsubgenreundergenre
  );
export default router;
