import { Server } from "socket.io";
let io;
const onlineUsers = {};

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("sendMessage", (data) => {
      // send to sender immediately
      socket.emit("receiveMessage", data);
      // also send to all other connected clients (receivers)
      socket.broadcast.emit("receiveMessage", data);
    });

    // userOnline
    socket.on("addUser", (userId) => {
      onlineUsers[userId] = socket.id;
      io.emit("getUsers", Object.keys(onlineUsers));
    });
    // when user logs out manually
    socket.on("logout", (userId) => {
      delete onlineUsers[userId];
      io.emit("getUsers", Object.keys(onlineUsers));
      console.log("👋 User logged out:", userId);
    });

    // handle typing
    socket.on("typing", ({ ticketId, userId, isTyping, receiverId }) => {
      const otherSocketId = onlineUsers[receiverId];
      if (otherSocketId) {
        io.to(otherSocketId).emit("userTyping", { ticketId, userId, isTyping });
      }
    });

    // user marks messages as seen

    socket.on("messageSeen", ({ ticketId, messageIds, userId }) => {
      socket.broadcast.emit("messagesSeen", {
        ticketId,
        messageIds,
        seenBy: userId,
      });
    });

    socket.on("disconnect", () => {
      // remove user from onlineUsers map

      for (let [userId, id] of Object.entries(onlineUsers)) {
        if (id === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
      io.emit("getUsers", Object.keys(onlineUsers));
      console.log("❌ User disconnected:", socket.id);
    });
  });
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
