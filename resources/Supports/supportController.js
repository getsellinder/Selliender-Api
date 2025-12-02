import { Support } from "./supportModel.js";
import cloudinary from "../../Utils/cloudinary.js";

import {
  formatDateToIST,
  shordataformate,
  shortDateWithTime,
} from "../../Utils/formatDateToIST .js";
import UserModel from "../user/userModel.js";

// user pointof view

export const createSupport = async (req, res) => {
  try {
    const id = req.user._id;
    // const {id}=req.params //user id
  

    const { subject, description, category, priority } = req.body;

    const findUser = await UserModel.findById(id);
    if (!findUser) {
      return res.status(404).json({ message: "User not found with this id" });
    }
    if (!subject || !description) {
      return res.status(500).json({
        message: "Some fields are missing. Kindly complete the form.",
      });
    }

    const data = {
      subject,
      description,
      category,
      priority,
      userId: id,
      // createdBy: AdminId,
    };
   let ticket= await Support.create(data);
    return res.status(200).json({ message: "Ticket created successfully.",ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

export const getAllSupportTicketUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const findTickets = await Support.find({
      userId: userId,
      status: { $in: ["OPEN", "CLOSED"] },
    }).sort({
      createdAt: -1,
    });
    if (!findTickets) {
      return res.status(404).json({ message: "No Tickets found" });
    }
    const ticketsWithTime = findTickets.map((ticket) => ({
      ...ticket._doc,
      createdTime: new Date(ticket.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    }));
    res.status(200).json({
      message: "Tickets fetched successfully",
      tickets: ticketsWithTime,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    let senderId = req.user._id;
    let { ticketId } = req.params; //tikcet id
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    let ticket = await Support.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    let data = {
      message,
      senderId,
      // receiverId,
    };
    console.log("data", data);
    ticket.messages.push(data);
    await ticket.save();

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json({ message: "Internal Server Error" });
  }
};

export const sendMessageuser = async (req, res) => {
  try {
    const { message } = req.body;
    let senderId = req.user._id;
    let { ticketId } = req.params; //tikcet id
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }
    const findAdmin=await UserModel.findOne({role:"admin"})
    console.log("findAdmin",findAdmin)
    const adminId=findAdmin._id
    let ticket = await Support.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    let data = {
      message,
      senderId,
      receiverId:adminId,
    };

    ticket.messages.push(data);
    await ticket.save();

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json({ message: "Internal Server Error" });
  }
};
export const closedticktbyuser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    const findTickets = await Support.find({ userId: userId });
    if (!findTickets) {
      return res.status(404).json({ message: "No Tickets found" });
    }
    const updatesupport = await Support.findOneAndUpdate(
      { _id: ticketId },
      {
        status: "CLOSED",
      },
      { new: true }
    );
    if (!updatesupport) {
      return res
        .status(404)
        .json({ message: "Ticket not found or not authorized" });
    }
    return res
      .status(200)
      .json({ message: "Ticket Closed Successfully", updatesupport });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// user end heaer

export const getAllSupportTicket = async (req, res) => {
  try {
    const { status, searchInput } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    let filter = {};
    // filter.status = status ? status.toUpperCase() : "OPEN";
    if (status && status.trim() !== "") {
      filter.status = status.toUpperCase();
    }
    let searchQuery = {};
    if (searchInput && searchInput.trim() !== "") {
      const regex = new RegExp(searchInput.trim(), "i");
      searchQuery = {
        $or: [{ ticketId: regex }, { subject: regex }],
      };
    }
    const total = await Support.countDocuments({
      ...filter,
      ...searchQuery,
    });
    const support = await Support.find({
      ...filter,
      ...searchQuery,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (support.length === 0) {
      return res.status(404).json({
        message: `No ${filter.status} Tickets Found`,
      });
    }
    const data = support.map((t) => ({
      ...t._doc,
      createdAt: shordataformate(t.createdAt),
      updatedAt: shordataformate(t.updatedAt),
    }));
    return res.status(200).json({
      data,
      currentPage: page,
      totalPage: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
export const getOneSupportTicket = async (req, res) => {
  try {
    // console.log(req.params.id);/api/support/getOne/
    const support = await Support.findById(req.params?.id)
      .populate("userId", "name email")
      .populate("messages.senderId", "name email")
      // .populate("messages.receiverId", "name email");
    if (!support) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    let data = support.toObject();
    data.createdAt = shordataformate(support.createdAt);
    data.updatedAt = shordataformate(support.updatedAt);
    data.messages = data.messages.map((msg) => {
      let m = msg;
      return {
        ...m,
        createdAt: shortDateWithTime(m.createdAt),
        updatedAt: shortDateWithTime(m.updatedAt),
      };
    });
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const getAllSupportUserForOnlineStatus = async (req, res) => {
  try {
    const users = await Support.find();
    if (!users) {
      return res.status(404).json({ message: "Users Not found" });
    }
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// ************************8



export const getAllSupportTicketofuser = async (req, res) => {
  try {
    const { status, searchInput } = req.query;
    let {id}=req.params
    console.log("userId.getAllSupportTicketofuser",id)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    let filter = {userId:id};

    if (status && status.trim() !== "") {
      filter.status = status.toUpperCase();
    }
    let searchQuery = {userId:id};
    if (searchInput && searchInput.trim() !== "") {
      const regex = new RegExp(searchInput.trim(), "i");
      searchQuery = {
        $or: [{ ticketId: regex }, { subject: regex }],
      };
    }
    const total = await Support.countDocuments({
      ...filter,
      ...searchQuery,
    });
    const support = await Support.find({
      ...filter,
      ...searchQuery,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (support.length === 0) {
      return res.status(404).json({
        message: `No ${filter.status || "Tokens"} Tickets Found`,
      });
    }
    const data = support.map((t) => ({
      ...t._doc,
      createdAt: shordataformate(t.createdAt),
      updatedAt: shordataformate(t.updatedAt),
    }));
    return res.status(200).json({
      data,
      currentPage: page,
      totalPage: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

// ************************8

export const deleteSupport = async (req, res) => {
  try {
    const { id } = req.params; //ticket Id
    const findticket = await Support.findById(id);
    if (!findticket) {
      return res
        .status(404)
        .json({ message: "Ticket details not found with this ID" });
    }
    const result = await Support.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Ticket Details deleted Successfully", result });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const updateSupport = async (req, res) => {
  try {
    const { status, message } = req.body;
    // console.log(req.params.id);
    // Prepare an array for the images
    // const jsonArray = JSON.parse(image);
    // const AllImages = jsonArray.map(({ public_id, url }) => ({
    //   public_id,
    //   url,
    // }));

    // if (req.files && req.files.newImages) {
    //   const newuploadImages = Array.isArray(req.files.newImages)
    //     ? req.files.newImages
    //     : [req.files.newImages];

    //   const imagesLinks = [];

    //   for (let i = 0; i < newuploadImages.length; i++) {
    //     const result = await cloudinary.v2.uploader.upload(
    //       newuploadImages[i].tempFilePath,
    //       {
    //         folder: "tavisa/product",
    //       }
    //     );

    //     imagesLinks.push({
    //       public_id: result.public_id,
    //       url: result.secure_url,
    //     });
    //   }

    // Combine the existing images and the newly uploaded images
    // const updatedImages = [...AllImages, ...imagesLinks];

    // Perform the product update
    // Find the support ticket by ID
    const supportTicket = await Support.findById(req.params.id);
    // Check if the support ticket exists
    if (!supportTicket) {
      return res.status(404).json({
        success: false,
        msg: "Support ticket not found",
      });
    }

    // Update the support ticket fields
    if (status) {
      supportTicket.status = status;
    }
    if (message) {
      const newMessage = {
        message: message.message,
        user: message.user,
        replyDate: message.replyDate, // Add a timestamp to the message object
      };
      supportTicket.message.push(newMessage);
      // Update the last reply to the timestamp of the new message if the user is admin
      if (message.user === "admin") {
        supportTicket.lastreply = newMessage.replyDate;
      }
    }

    // Save the updated support ticket
    const updatedSupportTicket = await supportTicket.save();

    return res.status(200).json({
      success: true,
      updatedSupportTicket,
    });
  } catch (error) {
    // Handle errors
    // console.error(error);
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
export const deleteImageFromCloudinary = async (req, res) => {
  const { public_id } = req.params;

  try {
    if (!public_id) {
      return res.status(400).json({
        success: false,
        msg: "Please Provide Product ID!",
      });
    }
    const response = await cloudinary.v2.uploader.destroy(public_id);
    if (response) {
      res.status(200).json({
        success: true,
        msg: "CustomerSupport Deleted Successfully!!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let {id}=req.params

    const supportTicket = await Support.findById(id);

    if (!supportTicket) {
      return res.status(404).json({
        success: false,
        msg: "Support ticket not found",
      });
    }
    await Support.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    return res.status(200).json({
      success: true,
  
      message: `Staus ${status} Updated Successfully`,
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
