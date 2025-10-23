import express from "express";
import { getbanners, uploadbanner } from "./HomeScreenBannersControll";

const rounter = express.Router();

rounter.post("/", uploadbanner);
rounter.get("/", getbanners);

export default rounter;
