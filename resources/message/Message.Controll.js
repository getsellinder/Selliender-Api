import { getIO } from "../../Utils/Socket.js";
import { Support } from "../Supports/supportModel.js";

export const createMessageUser = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user._id; //user whome sending msg
    if (!message) {
      return res.status(404).json({ message: "Message Field Cannot be Empty" });
    }
    const findTicktId = await Support.findById(ticketId);

    if (!findTicktId) {
      return res.status(404).json({ message: "TicketId not found" });
    }

    const data = {
      message,
      senderId: userId,
      createdAt: new Date(),
    };

    let updatedTicket = await Support.findOneAndUpdate(
      { _id: ticketId },
      {
        $push: { messages: data },
      },
      { new: true }
    );
    const savedMessage =
      updatedTicket.messages[updatedTicket.messages.length - 1];
    const io = getIO();
    io.emit("receiveMessage", savedMessage);

    res.status(200).json({
      // message: "Message Send to Admin Successfully ",
      message: "Message created & sent via socket",
      data: savedMessage,
      // message: messageData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessagesUser = async (req, res) => {
  try {
    const { ticketId } = req.params;
    let findTicket = await Support.findById(ticketId);
    if (!findTicket) {
      return res.status(404).json({ message: "TicketId not found" });
    }
    if (findTicket.messages.length === 0) {
      return res.status(404).json({ message: "Start the conversations" });
    }
    let result = {
      ...findTicket._doc,
      messages: findTicket.messages.map((msg) => {
        let createdAt = new Date(msg.createdAt);
        let formattedTime = createdAt.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });

        return {
          ...msg._doc,
          time: formattedTime,
        };
      }),
    };
    // const io = getIO();
    // io.emit("loadMessages", result);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
