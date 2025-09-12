import dotenv from "dotenv";
dotenv.config();
import { google } from "googleapis";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const oauth2client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  // "https://audio-stream-api.onrender.com/api/v1/google/callback"
  "postmessage"
);
console.log("Redirect URI:", oauth2client.redirectUri);
