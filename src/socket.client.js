import {io} from "socket.io-client"

const SOCKET_URL = "http://localhost:5000";

const socket =io(SOCKET_URL,{
    transports:["websocket"]
})

socket.on("connect",()=>{
      console.log("✅ Connected to socket server:", socket.id);
})

socket.on("disconnect",()=>{
      console.log("❌ Disconnected from socket server");
})


export default socket
