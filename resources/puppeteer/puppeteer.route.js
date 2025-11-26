import express from "express"
import { createplaywright } from "./puppeteer.controll.js"

let Router=express.Router()

Router.post("/",createplaywright)

export default Router