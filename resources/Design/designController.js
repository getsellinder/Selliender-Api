import mongoose from "mongoose";

import cloudinary from "../../Utils/cloudinary.js";
import { DesignModel } from "./designModel.js";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { fileURLToPath } from "url";

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploades");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const imageUpload = multer({ storage: imageStorage }).any();

// const jsonUpload = multer({ storage: jsonStorage }).fields([
//   { name: "designImageJson", maxCount: 1 },
// ]);

// Add new Category
// export const addDesign = async (req, res) => {
//   const { designName, categoryName } = req.body;
//   const { designImage } = req.files;
//   const { designImageJson } = req.body;

//   // console.log(categoryName, categoryImage);

//   if (!req?.user) return res.status(400).json({ message: "please login !" });
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
//       return res.status(400).json({ message: "please login again " });
//     }
//     const result = await cloudinary.v2.uploader.upload(
//       designImage.tempFilePath,
//       {
//         folder: "GetSygnal/design",
//       }
//     );

//     if (result) {
//       const design = await DesignModel.create({
//         designName,
//         categoryName,
//         designImage: result,
//         designImageJson: JSON.parse(designImageJson),
//         addedBy: req.user._id,
//       });
//       if (design) {
//         return res
//           .status(201)
//           .json({ success: true, design, message: "design Added" });
//       }
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message ? error.message : "Something went Wrong",
//     });
//   }
// };
export const addDesign = (req, res) => {
  // const { designName, categoryName } = req.body;
  // const { designImage, designImageJson } = req.files;
  // const { designImageJson } = req.body;
  // console.log(designImage, designImageJson);

  // console.log(categoryName, designImage);
  imageUpload(req, res, async (imageErr) => {
    // jsonUpload(req, res, async (jsonErr) => {
    if (imageErr) {
      console.log(imageErr);
      return res.status(500).json({
        success: false,
        message: "Error uploading files",
      });
    }

    const { designName, categoryName } = req.body;

    if (!req?.user) return res.status(400).json({ message: "please login !" });
    try {
      // Retrieve the uploaded image and JSON file information
      const designImage = req.files[0];
      const designImageJson = req.files[1];
      console.log("designImage", designImage, "json", designImageJson);

      // Create a new design in the database
      console.log("came here");
      const design = await DesignModel.create({
        designName,
        categoryName,
        designImage: {
          filename: designImage.filename,
          path: designImage.path,
        },
        designImageJson: {
          filename: designImageJson.filename,
          path: designImageJson.path,
          // Add any other necessary information from the JSON file
        },
        addedBy: req.user._id,
      });
      console.log("design", design);
      if (design) {
        return res.status(201).json({
          success: true,
          design,
          message: "Design added successfully",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message ? error.message : "Something went wrong",
      });
    }
  });
  // });
};

export const getDesign = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const designs = await DesignModel.find().sort({
      createdAt: -1,
    });

    if (!designs) {
      return res.status(404).json({ message: "No design found" });
    }

    res.status(200).json({ success: true, designs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const updateDesign = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    const { designName, categoryName } = req.body;
    const olderImage = req.body?.olderImage;
    const designImage = req.files?.designImage;
    const { designImageJson } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    // find the document with the id to delete the image from cloudinary
    if (JSON.parse(olderImage).length == 0) {
      const deletefromCloudinary = await DesignModel.findOne({ _id: _id });

      const deleteresponse = await cloudinary.v2.uploader.destroy(
        deletefromCloudinary.designImage.public_id
      );
      if (deleteresponse) {
        const result = await cloudinary.v2.uploader.upload(
          designImage.tempFilePath,
          {
            folder: "GetSygnal/design",
          }
        );
        const update = await DesignModel.findOneAndUpdate(
          { _id: _id },
          {
            designName: designName,
            categoryName: categoryName,
            designImage: result,
            designImageJson: JSON.parse(designImageJson),
          }, // Provide the updated categoryName
          { new: true } // To return the updated document
        );
        if (!update) {
          return res
            .status(404)
            .json({ message: "Can not update document, something went wrong" });
        } else {
          return res.status(200).json({ success: true, update });
        }
      }
    } else {
      const update = await DesignModel.findOneAndUpdate(
        { _id: _id },
        {
          designName: designName,
          categoryName: categoryName,
          designImage: JSON.parse(olderImage),
          designImageJson: designImageJson,
        }, // Provide the updated categoryName
        { new: true } // To return the updated document
      );
      if (update) {
        return res.status(200).json({ success: true, update });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// export const deleteDesign = async (req, res) => {
//   try {
//     if (!req?.user) return res.status(400).json({ message: "please login !" });
//     const { _id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       return res.status(404).json({ error: "Can not find the document " });
//     }

//     const deletefromCloudinary = await DesignModel.findOne({ _id: _id });

//     const deleteresponse = await cloudinary.v2.uploader.destroy(
//       deletefromCloudinary.designImage.public_id
//     );
//     if (deleteresponse) {
//       const deleteDesign = await DesignModel.findOneAndDelete({ _id: _id });
//       if (!deleteDesign) {
//         return res.status(404).json({
//           error: "Can not find the document with the provided id to delete  ",
//         });
//       }
//       res.status(200).json({ success: true, deleteDesign });
//     } else {
//       return res.status(404).json({ error: "can not delete the design " });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message ? error.message : "Something went wrong",
//     });
//   }
// };
// import imagepath from "../../public/uploades";

export const deleteDesign = async (req, res) => {
  const { _id } = req.params;
  const {
    designImageFilename,
    designImagePath,
    designImageJsonFilename,
    designImageJsonPath,
  } = req.body;

  try {
    // Construct absolute paths for the files
    const imagePath = path.join(__dirname, "../../", designImagePath);
    const jsonPath = path.join(
      __dirname,
      "../../",
      designImageJsonPath
      // designImageJsonFilename
    );

    // Check if the files exist before attempting deletion
    const imageExists = await fs
      .access(imagePath)
      .then(() => true)
      .catch(() => false);
    const jsonExists = await fs
      .access(jsonPath)
      .then(() => true)
      .catch(() => false);

    if (imageExists) {
      await fs.unlink(imagePath);
    } else {
      console.error(`Image file not found at path: ${imagePath}`);
    }

    if (jsonExists) {
      await fs.unlink(jsonPath);
    } else {
      console.error(`JSON file not found at path: ${jsonPath}`);
    }

    const deleteDesign = await DesignModel.findOneAndDelete({ _id });

    if (!deleteDesign) {
      return res.status(404).json({
        error: "Cannot find the document with the provided id to delete",
      });
    }

    res.status(200).json({ success: true, deleteDesign });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};
