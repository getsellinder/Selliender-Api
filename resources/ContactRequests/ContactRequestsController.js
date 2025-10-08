import { ContactRequest } from "./ContactRequestsModel.js";

export const AddNewContactRequest = async (req, res) => {
  try {
    const { name, eamil, message } = req.body
    const add = {
      name, eamil, message, contactType: "Contact Us"
    }
    if (!name || !eamil || !message) {
      return res.status(500).json({ message: "Please fil the Fields" })
    }
    const findEmail = await ContactRequest.findOne({ eamil: eamil })
    if (findEmail) {
      return res.status(400).json({ message: "Your message already exists" })
    }
    const contactRequest = await ContactRequest.create(add);

    res.status(201).json({
      success: true,
      contactRequest,
      message: "You request sucessfully send the management",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const ContactSalesRequest = async (req, res) => {
  try {
    const { name, eamil, message } = req.body
    const add = {
      name, eamil, message, contactType: "Contact Sale"
    }
    if (!name || !eamil || !message) {
      return res.status(500).json({ message: "Please fil the Fields" })
    }
    const findEmail = await ContactRequest.findOne({ eamil: eamil })
    if (findEmail) {
      return res.status(400).json({ message: "Your message already exists" })
    }
    const contactRequest = await ContactRequest.create(add);

    res.status(201).json({
      success: true,
      contactRequest,
      message: "You request sucessfully send the  sales team",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};




export const FindAllContactRequest = async (req, res) => {
  try {
    const contactRequest = await ContactRequest.find().sort({ createdAt: -1 });
    if (contactRequest) {
      return res.status(200).json({
        success: true,
        contactRequest,
        message: "Fetched All ContactRequest",
      });
    } else {
      return res.status(404).json({
        success: true,

        message: "No ContactRequest till Now",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
