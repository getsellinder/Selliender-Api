import { Tax } from "./tax_model.js";

export const addTax = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const tax = new Tax({
    name: req.body.name,
    Gst: req.body.Gst,
  });
  try {
    const data = await tax.save();
    res.status(201).json({ message: "Success", data: data });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const UpdateTaxStatus = async (req, res) => {
  // if (!req.user) {
  //   return res.status(400).json({ message: "User Not Found" });
  // }
  try {
    const data = await Tax.find();
    if (data?.length > 0) {
      if (data[0]?.active === true) {
        const data = await Tax.updateMany({}, { $set: { active: false } });
        return res
          .status(200)
          .json({ message: "All VAT is Desabled", data: data });
      } else {
        const data = await Tax.updateMany({}, { $set: { active: true } });
        return res
          .status(200)
          .json({ message: "All VAT is Desabled", data: data });
      }
    } else {
      res
        .status(200)
        .json({ message: "No Vat Found For Update Status", data: data });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, message: "failed" });
  }
};
export const updateTax = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const id = req.params.id;
  const queryObj = req.body;

  try {
    const data = await Tax.findByIdAndUpdate(id, queryObj, {
      new: true,
    });
    res.status(200).json({ message: "Success", data: data });
  } catch (error) {
    res.status(500).json({ message: error.message, message: "failed" });
  }
};

export const deleteTax = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const id = req.params.id;
  try {
    const data = await Tax.findByIdAndDelete(id);
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message, message: "failed" });
  }
};

export const getTaxes = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  try {
    const data = await Tax.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message, message: "failed" });
  }
};

export const getTax = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User Not Found" });
  }
  try {
    let { id } = req.params;
    const tax = await Tax.findById({ _id: id });
    return res.status(200).json(tax);
  } catch (error) {
    return res.status(504).json({
      status: "failed",
      error,
    });
  }
};
