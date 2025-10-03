import { ContactRequest } from "./ContactRequestsModel.js";

export const AddNewContactRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body
    const add = {
      name, email, message
    }
    if (!name || !email || !message) {
      return res.status(500).json({ message: "Please fil the Fields" })
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
