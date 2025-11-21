import express from "express"
import { 
    getLinkedinAnalysisResult, 
    getLinkedinUploadFile, 
    getLinkedinUserProfile, 
    LinkedinUploadFile, 
    LinkedinuserDelete,
    saveDISCRequest,
    analyzeDISCProfile,
    analyzeDISCProfileCompact,
    getLatestDISCAnalysis,
    getDISCAnalysisById,
    getAllDISCAnalysesByUser,
    getDISCAnalysisSummary,
    getDISCProfilesByUserTable,
    getDISCProfilesByUserId
} from "./Linkedin.controll.js"
import multer from "multer"

const Router = express.Router()
const upload = multer()

Router.post("/create/file/:id", LinkedinUploadFile)
Router.post("/save-disc-request/:userId", saveDISCRequest)
Router.post("/analyze-disc/:userId", analyzeDISCProfile)
Router.post("/analyze-disc-compact/:userId", analyzeDISCProfileCompact)

Router.get("/get/:id", getLinkedinUploadFile)
Router.get("/analysis", getLinkedinAnalysisResult)
Router.get("/analysis/:userId", getDISCProfilesByUserTable)
Router.get("/analysis/admin/:id", getDISCProfilesByUserId)



Router.get("/analysis/:id", getLinkedinUserProfile)
Router.delete("/delete/:id", LinkedinuserDelete)

Router.get("/disc/latest/:userId", getLatestDISCAnalysis)

Router.get("/disc/analysis/:analysisId", getDISCAnalysisById)

Router.get("/disc/summary/:analysisId", getDISCAnalysisSummary)

// Shortcut: allow clients (extensions) to fetch the analysis summary with a shorter path
Router.get("/disc/:analysisId", getDISCAnalysisSummary)

Router.get("/disc/user/:userId", getAllDISCAnalysesByUser)

export default Router



