import express from "express";
import {
  adddownloads,
  addlibrary,
  addlistenhistory,
  deletedownloads,
  deletelibrary,
  deletelistenhistory,
  getdownloads,
  getlibrary,
  getlistenhistory,
} from "./MylibraryControll.js";
import { isAuthenticatedUser } from "../../middlewares/auth.js";
const rounter = express.Router();

// MY LIBRARY SCREEN
rounter.get("/library/get/:id", isAuthenticatedUser, addlibrary);
rounter.delete("/library/delete/:id", isAuthenticatedUser, deletelibrary);
rounter.get("/library/get", isAuthenticatedUser, getlibrary);

// MY LISTEN HISTORY SCREEN
rounter.get("/listen/get/:id", isAuthenticatedUser, addlistenhistory);
rounter.delete("/listen/delete/:id", isAuthenticatedUser, deletelistenhistory);
rounter.get("/listen/get", isAuthenticatedUser, getlistenhistory);

// MY DOWNLOADS
rounter.get("/downloads/get/:id", isAuthenticatedUser, adddownloads);
rounter.delete("/downloads/delete/:id", isAuthenticatedUser, deletedownloads);
rounter.get("/downloads/get", isAuthenticatedUser, getdownloads);

export default rounter;
