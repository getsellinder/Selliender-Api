import { timeFormat } from "../../Utils/formatDateToIST .js";
import { ContactRequest } from "./ContactRequestsModel.js";

export const AddNewContactRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const add = {
      name,
      email,
      message,
      contactType: "Contact Us",
    };
    if (!name || !email || !message) {
      return res.status(500).json({ message: "Please fil the Fields" });
    }
    const findEmail = await ContactRequest.findOne({ email: email });
    if (findEmail) {
      return res.status(400).json({ message: "Your message already exists" });
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
    const { name, email, message } = req.body;
    const add = {
      name,
      email,
      message,
      contactType: "Contact Sale",
    };
    if (!name || !email || !message) {
      return res.status(500).json({ message: "Please fil the Fields" });
    }
    const findEmail = await ContactRequest.findOne({ email: email });
    if (findEmail) {
      return res.status(400).json({ message: "Your message already exists" });
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

export const getAllContactSalesRequest = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const { name } = req.query;

    const filter = {
      // Status: "Active",
      contactType: "Contact Sale",
    };
    let skip = (page - 1) * limit;

    if (name) {
      filter.name = { $regex: new RegExp(name, "i") };
    }

    const total = await ContactRequest.countDocuments(filter);
    let getcotactsales = await ContactRequest.find(filter)

      .sort({ createdAt: 1 })
      .skip(skip)

      .limit(limit);
    let data = getcotactsales.map((val) => ({
      ...val.toObject(),
      createdAt: timeFormat(val.createdAt),
      updatedAt: timeFormat(val.updatedAt),
    }));

    return res.status(200).json({
      result: data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.log("Erron in the getAllContactSalesRequest", error);
    return res.status(500).json({ message: error });
  }
};
export const FindAllContactRequest = async (req, res) => {
  try {
    let limit = parseInt(req.query?.limit) || 4;
    let page = parseInt(req.query?.page) || 1;
    let search = req.query?.name || "";
    let status = req.query?.status || "";

    const searchRegex = new RegExp(search, "i");
    const filter = {
      name: { $regex: searchRegex },
      contactType: "Contact Us",
    };
    if (status) {
      filter.status = status;
    }

    // ✅ Count total documents for pagination
    const totalItems = await ContactRequest.countDocuments(filter);

    // ✅ Fetch paginated results
    const contactRequest = await ContactRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let result = contactRequest.map((val) => ({
      ...val.toObject(),
      createdAt: timeFormat(val.createdAt),
      updatedAt: timeFormat(val.updatedAt),
    }));

    if (contactRequest.length > 0) {
      return res.status(200).json({
        success: true,
        result,
        currentPage: page,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        message: "Fetched All Contact Requests Successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No Contact Requests Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
