import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useParams } from "react-router-dom";
import { useCustomer } from "../CustomerSupport/CustomerContext";
import axios from "axios";
import { isAutheticated } from "src/auth";
import toast from "react-hot-toast";
import { Card, CardContent, Divider } from "@material-ui/core";

import users from "../Users/users";

const Chat = () => {
  const token = isAutheticated();
  const { name, ticketId } = useParams();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const {
    getMessagesChat,
    chatData,
    userId,
    ticketDetails,
    chatErorr,
    setChatData,
    SupportRequestsData,
  } = useCustomer();

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  const [messageLoading, setMessageLoading] = useState(false);


  const loggedInUserId = userId;



  // typing indicater

  const [message, setMessages] = useState({
    message: "",
  });
  const [isReceiverTyping, setIsReceiverTyping] = useState();
  let typingTimeout;

  const hendelMessage = (e) => {
    const { name, value } = e.target;
    clearTimeout(typingTimeout)
  

    setMessages((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const handleReceive = (data) => {
      console.log("vireceived msg:", data);
      // Only add to chat if the message is NOT from the current user
      if (data.senderId !== userId) {

        setChatData((prev) => [
          ...prev,
          {
            ...data,
            time: data.time
              ? data.time
              : new Date().toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
          },
        ]);
      }
    };



   
  }, []);
  const handelSendMessage = async () => {
    try {
      setMessageLoading(true);

      let newMsg = {
        ticketId,
        message: message.message,
        senderId: userId,
        time: new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      // Push outgoing msg immediately
      setChatData((prev) => [...prev, newMsg]);

  

      // Save to DB
      await axios.post(`/api/user/message/create/${ticketId}`, message, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages({ message: "" });
      toast.success("Message sent");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send message";
      toast.error(msg);
    } finally {
      setMessageLoading(false);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handelSendMessage();
      setMessages(() => ({
        message: "",
      }));
      // getMessagesChat(ticketId);
      toast.success("message sent");
    }
  };

  useEffect(() => {
    getMessagesChat(ticketId);
  }, [ticketId]);

  // console.log("onlineUsers", onlineUsers);
  // console.log("SupportRequestsData", SupportRequestsData);
  // console.log("ticketDetails details", ticketDetails);
  console.log("isReceiverTyping",isReceiverTyping)

  return (
    <>
      <Card style={{ height: "20vh", marginBottom: "10px" }}>
        <div style={{ padding: "10px" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "orange", mb: 1 }}
          >
            🎟️ Ticket Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "gray", fontWeight: "600", width: "15%" }}
              >
                TicketId
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#000", fontWeight: 600 }}
              >
                {ticketDetails?.ticketId || "N/A"}
              </Typography>
            </Box>
            {/* <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "gray", fontWeight: "600", width: "15%" }}
              >
                Online Status
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#000", fontWeight: 600 }}
              >
                <Typography>
                  {onlineUsers.includes(receiverId)
                    ? "🟢 Online"
                    : "⚪ Offline"}
                </Typography>
              </Typography>
            </Box> */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "gray", fontWeight: "600", width: "15%" }}
              >
                Username
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#000", fontWeight: 600 }}
              >
                {name || "N/A"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "start",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "gray", fontWeight: "600", width: "15%" }}
              >
                Subject
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#000", fontWeight: 600 }}
              >
                {ticketDetails?.subject || "N/A"}
              </Typography>
            </Box>
          </div>
        </div>
      </Card>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "50vh",
          bgcolor: "#f5f5f5",
        }}
      >
        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflow: "auto", p: 2, height: "40vh" }}>
          {chatErorr ? (
            <Typography
              sx={{
                fontSize: "1rem",
                color: "gray",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {chatErorr}
            </Typography>
          ) : (
            chatData?.map((msg, index) => {
              const isMe = userId === msg.senderId;
              return (
                <>
                  <Box
                    key={index}
                    secondary
                    sx={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.5,
                        maxWidth: "60%",

                        bgcolor: isMe ? "#1976d2" : "#e0e0e0",
                        color: isMe ? "#fff" : "#000",
                        borderRadius: isMe
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      }}
                    >
                      <Typography>{msg.message}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          mt: 0.5,
                          opacity: 0.7,
                        }}
                      >
                        {msg.time}
                      </Typography>
                    </Paper>
                  </Box>
                </>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Box */}
   
        {isReceiverTyping && (
          <Typography variant="caption" color="gray">
            Typing...
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            p: 1,
            bgcolor: "#fff",
            borderTop: "1px solid #ccc",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={message.message}
            name="message"
            onChange={hendelMessage}
            onKeyDown={handleKeyDown}
          />

          <IconButton color="primary" onClick={() => handelSendMessage()}>
            {messageLoading ? <CircularProgress size={25} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default Chat;
