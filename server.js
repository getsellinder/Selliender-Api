
import app from "./app.js";
import connectDatabase from "./database/db.js";
import cloudinary from "cloudinary";
import http from "http";

import { initSocket } from "./Utils/Socket.js";

// Connecting to database
connectDatabase();
const serverSocket = http.createServer(app);

//cloudenary uses
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


initSocket(serverSocket);
// }
//<---------deployement------------->
app.listen(process.env.PORT, () => {
  console.log(`Server  is working on http://localhost:${process.env.PORT}`);
});
