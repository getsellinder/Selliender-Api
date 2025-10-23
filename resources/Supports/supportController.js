import { Support } from "./supportModel.js";
import cloudinary from "../../Utils/cloudinary.js";

import { formatDateToIST } from "../../Utils/formatDateToIST .js";
import UserModel from "../user/userModel.js";

// export const createSupport = async (req, res) => {
//   try {
//     if (req?.files && req?.files?.image) {
//       let images = [];
//       let Allfiles = req.files.image;
//       if (typeof Allfiles.tempFilePath === "string") {
//         let filepath = Allfiles.tempFilePath;
//         images.push(filepath);
//       } else {
//         Allfiles.map((item) => {
//           images.push(item.tempFilePath);
//         });
//       }

//       const imagesLinks = [];
//       for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//           folder: "tavisa/CustomerSupport",
//         });

//         imagesLinks.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }
//       req.body.image = imagesLinks;
//     }

//     req.body.addedBy = (await req?.user?._id)
//       ? req?.user?._id
//       : req?.patient?._id;
//     req.body.from = (await req?.user?._id) ? "Website" : "Mobile";
//     req.body.addedByModel = (await req?.user?._id) ? "User" : "Patient";

//     const support = await Support.create({ ...req.body });

//     res.status(201).json({
//       success: true,
//       data: support,
//       msg: "Support ticket created successfully.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       msg: error.message,
//     });
//   }
// };
// ****************************

// user pointof view

export const createSupport = async (req, res) => {
  try {
    const AdminId = req.user._id;
    const { id } = req.params;

    const { subject, description } = req.body;

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
      userId: id,
      createdBy: AdminId,
    };
    await Support.create(data);
    return res.status(200).json({ message: "Ticket created successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

// user point of view
export const createSupportUser = async (req, res) => {
  try {
    const UserId = req.user._id;

    const { subject, description } = req.body;

    const findUser = await UserModel.findById(UserId);
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
      userId: UserId,
      // createdBy: AdminId,
    };
    await Support.create(data);
    return res.status(200).json({ message: "Ticket created successfully." });
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
    // Use the find method to retrieve all support tickets
    const { status, searchInput } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    let skip = (page - 1) * limit;
    const filter = {};

    if (status === undefined) {
      filter.status = "OPEN";
    } else {
      filter.status = status.toUpperCase();
    }

    let searchQuery = {};
    if (searchInput && searchInput.trim() !== "") {
      const regex = new RegExp(searchInput, "i"); // case-insensitive
      searchQuery = {
        $or: [
          { ticketId: regex },
          { subject: regex },
          { "userId.name": regex },
          { "userId.email": regex },
        ],
      };
    }

    const total = await Support.countDocuments({ ...filter, ...searchQuery });

    const support = await Support.find({ ...filter, ...searchQuery })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email");
    if (support.length === 0) {
      return res.status(404).json({
        message: `${status === filter.status}`
          ? `No ${filter.status} Requests Active Now`
          : `No ${filter.status} Close Request Active Now `,
      });
    }
    const data = support.map((t) => ({
      t,
      createdAt: formatDateToIST(t.createdAt),
      updatedAt: formatDateToIST(t.updatedAt),
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
    const support = await Support.findById(req.params?.id).populate({
      path: "addedBy", // Field to populate
    });
    if (support) {
      return res.status(200).json({
        success: true,
        support,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "Support ticket not found",
      });
    }
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
    // Retrieve the user ID from the request
    const userId = (await req?.user?._id) ? req?.user?._id : req?.patient?._id;

    // Use the find method to retrieve all support tickets created by the user
    const support = await Support.find({ addedBy: userId }).sort({
      createdAt: -1,
    });

    // Check if support tickets were found
    if (support) {
      return res.status(200).json({
        success: true,
        support,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "No support tickets found for the user.",
      });
    }
  } catch (error) {
    // Handle errors
    // console.error(error);
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

// ************************8

export const deleteSupport = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const findticket = await Support.findById(ticketId);
    if (!findticket) {
      return res
        .status(404)
        .json({ message: "Ticket details not found with this ID" });
    }
    const result = await Support.findByIdAndDelete(ticketId);
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
