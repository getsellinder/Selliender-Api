import { runPlaywrightAutomation } from "./playwright.js"


export const createplaywright=async (req,res)=>{
    const {promt}=req.body
    try {
        let result=await runPlaywrightAutomation(promt)
        return res.status(200).json(result)
    } catch (error) {
        console.log("error.createpupeteer",error)
        return res.status(500).json({message:error.message})
    }
}
