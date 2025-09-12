import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../../middlewares/auth.js";
import {
  createEpisode,
  createseries,
  deleteepisode,
  deleteseries,
  getepisode,
  getseries,
  getepisodebyId,
  getserisbyId,
  getallseriesepisodes,
  updateseries,
  updatepisode,
  createseasons,
  // getseriesSessions,
  getseasons,
  getSeasonseries,
  getAlltitles,
  episodedragandDrop,
} from "./SeriesControl.js";
import { roles, rolesAdmin } from "../../Utils/authorizeRoles.js";

const router = express.Router();

router
  .route("/series")
  .post(isAuthenticatedUser, authorizeRoles(...rolesAdmin), createseries);

router
  .route("/all/series")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getseries);
router
  .route("/get/all/titles")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getAlltitles);

router
  .route("/get/series/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getserisbyId);
router
  .route("/delete/series/:id")
  .delete(isAuthenticatedUser, authorizeRoles(...rolesAdmin), deleteseries);
// updateseries;
router
  .route("/update/series/:id")
  .put(isAuthenticatedUser, authorizeRoles(...rolesAdmin), updateseries);

router
  .route("/create/seasons/")
  .post(isAuthenticatedUser, authorizeRoles(...rolesAdmin), createseasons);
//getseasons
router
  .route("/get/seasons/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getseasons);

router
  .route("/get/season/series")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getSeasonseries);

router
  .route("/get/series/episode/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getallseriesepisodes);
router
  .route("/get/series/episode/order/:id")
  .put(isAuthenticatedUser, authorizeRoles(...roles), episodedragandDrop);

// episode;
router
  .route("/episode/:id")
  .post(isAuthenticatedUser, authorizeRoles(...rolesAdmin), createEpisode);
router
  .route("/all/episodes")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getepisode);
router
  .route("/episode/:id")
  .get(isAuthenticatedUser, authorizeRoles(...roles), getepisodebyId);
router
  .route("/delete/episode/:id")
  .delete(isAuthenticatedUser, authorizeRoles(...rolesAdmin), deleteepisode);
// updatepisode
router
  .route("/update/episode/:id")
  .put(isAuthenticatedUser, authorizeRoles(...rolesAdmin), updatepisode);

// updatepisode

export default router;
