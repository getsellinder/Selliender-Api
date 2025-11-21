import express from "express";
import {
  analyzeDISCProfile,
  getDISCProfile,
  getDISCProfilesByUser,
  getAllDISCProfiles,
  deleteDISCProfile,
  updateDISCProfile,
  reanalyzeDISCProfile,

} from "./DISCProfileController.js";

const Router = express.Router();

Router.post("/analyze", analyzeDISCProfile);

Router.get("/profile/:id", getDISCProfile);

Router.get("/user/:userId", getDISCProfilesByUser);

Router.get("/all", getAllDISCProfiles);

Router.delete("/delete/:id", deleteDISCProfile);

Router.put("/update/:id", updateDISCProfile);

Router.post("/reanalyze/:id", reanalyzeDISCProfile);


// for admin 


export default Router;
