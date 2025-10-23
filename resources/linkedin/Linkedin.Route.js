import express from "express"
import { 
    getLinkedinAnalysisResult, 
    getLinkedinUploadFile, 
    getLinkedinUserProfile, 
    LinkedinUploadFile, 
    LinkedinuserDelete,
    saveDISCRequest,
    analyzeDISCProfile,
    getLatestDISCAnalysis,
    getDISCAnalysisById,
    getAllDISCAnalysesByUser,
    getDISCAnalysisSummary
} from "./Linkedin.controll.js"
import multer from "multer"

const Router = express.Router()
const upload = multer()

Router.post("/create/file/:id", LinkedinUploadFile)
Router.post("/save-disc-request/:userId", saveDISCRequest)
Router.post("/analyze-disc/:userId", analyzeDISCProfile)

Router.get("/get/:id", getLinkedinUploadFile)
Router.get("/analysis", getLinkedinAnalysisResult)

Router.get("/analysis/:id", getLinkedinUserProfile)
Router.delete("/delete/:id", LinkedinuserDelete)

Router.get("/disc/latest/:userId", getLatestDISCAnalysis)

Router.get("/disc/analysis/:analysisId", getDISCAnalysisById)

Router.get("/disc/summary/:analysisId", getDISCAnalysisSummary)

Router.get("/disc/user/:userId", getAllDISCAnalysesByUser)

export default Router



