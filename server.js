import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDatabase from "./database/db.js";
import cloudinary from "cloudinary";
import http from "http";
import { Server } from "socket.io";
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
//<---------deployement------------->``
// const data_dir = path.resolve();

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(data_dir, "/frontend/build")));

//     app.get("*", (req, res) =>
//         res.sendFile(path.join(data_dir, "frontend", "build", "index.html"))
//     );
// } else {
app.get("/", (req, res) => {
  res.send("API is running..");
});

initSocket(serverSocket);
// }
//<---------deployement------------->
const server = app.listen(process.env.PORT, () => {
  console.log(`Server  is working on http://localhost:${process.env.PORT}`);
});
