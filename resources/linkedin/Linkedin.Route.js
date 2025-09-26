import express from "express"
import { getLinkedinUploadFile, LinkedinUploadFile } from "./Linkedin.controll.js"
import multer from "multer"

const Router = express.Router()
const upload = multer()


Router.post("/create/file/:id", upload.fields([
    { name: "content", maxCount: 1 }, // for LinkedinContent JSON
    { name: "posts", maxCount: 1 }    // for LinkedinPost JSON
]), LinkedinUploadFile)



Router.get("/get/:id", getLinkedinUploadFile)

export default Router


