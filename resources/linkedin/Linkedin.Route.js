import express from "express"
import { getLinkedinAnalysisResult, getLinkedinUploadFile, getLinkedinUserProfile, LinkedinUploadFile, LinkedinuserDelete } from "./Linkedin.controll.js"
import multer from "multer"

const Router = express.Router()
const upload = multer()


// Router.post("/create/file/:id", upload.fields([
//     { name: "content", maxCount: 1 }, // for LinkedinContent JSON
//     { name: "posts", maxCount: 1 }    // for LinkedinPost JSON
// ]), LinkedinUploadFile)


Router.post("/create/file/:id", LinkedinUploadFile)


Router.get("/get/:id", getLinkedinUploadFile)
Router.get("/analysis", getLinkedinAnalysisResult)

Router.get("/analysis/:id", getLinkedinUserProfile)
Router.delete("/delete/:id", LinkedinuserDelete)

export default Router



