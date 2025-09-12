import mongoose from "mongoose";
import { ColorModel } from "./colorModel.js";

// Add new Color
export const addColor = async (req, res) => {
  const { colorName, colorCode } = req.body;

  try {
    // Check if the color already exists by name or code
    const existingColor = await ColorModel.findOne({
      $or: [{ colorName: colorName.trim() }, { colorCode: colorCode.trim() }],
    });

    if (existingColor) {
      return res.status(400).json({
        success: false,
        message: "Color already exists with the same name or code.",
      });
    }

    // Create the new color
    const color = await ColorModel.create({
      colorName: colorName.trim(),
      colorCode: colorCode.trim(),
      addedBy: req.user._id, // Ensure `req.user` is populated via authentication middleware
    });

    return res.status(201).json({
      success: true,
      color,
      message: "Color added successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong.",
    });
  }
};

export const getColors = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const colors = await ColorModel.find().sort({
      createdAt: -1,
    });

    if (!colors) {
      return res.status(404).json({ message: "No Colors found" });
    }

    res.status(200).json({ success: true, colors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// export const updateColor = async (req, res) => {
//   try {
//     if (!req?.user) return res.status(400).json({ message: "please login !" });

//     const { _id } = req.params;
//     const { colorName } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       return res.status(404).json({ error: "Can not find the document " });
//     }

//     const update = await ColorModel.findOneAndUpdate(
//       { _id: _id },
//       { colorName: colorName }, // Provide the updated ColorName
//       { new: true } // To return the updated document
//     );

//     if (!update) {
//       return res
//         .status(404)
//         .json({ message: "Can not update document, something went wrong" });
//     }

//     return res.status(200).json({ success: true, update });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message ? error.message : "Something went wrong",
//     });
//   }
// };
export const updateColor = async (req, res) => {
  const { id } = req.params; // Extract the color ID from the request parameters
  const { colorName, colorCode } = req.body; // Fields to update

  try {
    // Validate input
    if (!colorName && !colorCode) {
      return res.status(400).json({
        success: false,
        message: "At least one of color name or color code is required.",
      });
    }

    // Check if the color exists
    const existingColor = await ColorModel.findById(id);
    if (!existingColor) {
      return res.status(404).json({
        success: false,
        message: "Color not found.",
      });
    }

    // Check if the new name or code conflicts with an existing color
    const duplicateColor = await ColorModel.findOne({
      $and: [
        { _id: { $ne: id } }, // Exclude the current color being updated
        {
          $or: [
            { colorName: colorName?.trim().toLowerCase() },
            { colorCode: colorCode?.trim().toLowerCase() },
          ],
        },
      ],
    });

    if (duplicateColor) {
      return res.status(400).json({
        success: false,
        message: "Another color with the same name or code already exists.",
      });
    }

    // Update the color
    if (colorName) existingColor.colorName = colorName.trim();
    if (colorCode) existingColor.colorCode = colorCode.trim();

    await existingColor.save();

    return res.status(200).json({
      success: true,
      color: existingColor,
      message: "Color updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};

export const deleteColor = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    const deleteColor = await ColorModel.findOneAndDelete({ _id: _id });
    if (!deleteColor) {
      return res.status(404).json({
        error: "Can not find the document with the provided id to delete  ",
      });
    }
    res.status(200).json({ success: true, deleteColor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};
