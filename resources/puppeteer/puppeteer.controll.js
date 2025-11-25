export const createpupeteer=(req,res)=>{
    try {
        
    } catch (error) {
        console.log("error.createpupeteer",error)
        return res.status(500).json({message:error.message})
    }
}
