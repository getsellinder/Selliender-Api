import express from "express"
import { createpupeteer } from "./puppeteer.controll"

let Router=express.Router()

Router.post("/",createpupeteer)

export default Router