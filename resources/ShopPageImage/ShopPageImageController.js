import mongoose from "mongoose";

import cloudinary from "../../Utils/cloudinary.js";
import { ShopPageImageModel } from "./ShopPageImageModel.js";

// Add new Category
export const addImage = async (req, res) => {
  // const { bannerName } = req.body;
  const { bannerImage } = req.files;
  // console.log("image", bannerImage);
  // console.log(categoryName, categoryImage);

  if (!req?.user) return res.status(400).json({ message: "please login !" });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "please login again " });
    }
    const result = await cloudinary.v2.uploader.upload(
      bannerImage.tempFilePath,
      {
        folder: "GetSygnal/shopImage",
      }
    );

    if (result) {
      const regsiterImage = await ShopPageImageModel.create({
        image: result,
        addedBy: req.user._id,
      });
      if (regsiterImage) {
        return res
          .status(201)
          .json({ success: true, regsiterImage, message: "Image Added" });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getImage = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const image = await ShopPageImageModel.find().sort({
      createdAt: -1,
    });

    if (!image) {
      return res.status(404).json({ message: "No categories found" });
    }
    // console.log("image", image);
    res.status(200).json({ success: true, image });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};
// export const updateImage = async (req, res) => {
//     try {
//         if (!req?.user) return res.status(400).json({ message: "please login !" });
//         const { _id } = req.params;
//         const { bannerName } = req.body;
//         const olderImage = req.body?.olderImage;
//         const bannerImag = req.files?.bannerImage;

//         if (!mongoose.Types.ObjectId.isValid(_id)) {
//             return res.status(404).json({ error: "Can not find the document " });
//         }

//         if (olderImage) {
//             // If there's an older image, delete it from Cloudinary
//             const deletefromCloudinary = await ShopPageImageModel.findOne({ _id: _id });
//             const deleteresponse = await cloudinary.v2.uploader.destroy(
//                 deletefromCloudinary.image.public_id
//             );

//             if (deleteresponse) {
//                 // Upload the new image to Cloudinary
//                 const result = await cloudinary.v2.uploader.upload(
//                     bannerImag.tempFilePath,
//                     {
//                         folder: "GetSygnal/shopImage",
//                     }
//                 );

//                 // Update the document with the new image
//                 const update = await ShopPageImageModel.findOneAndUpdate(
//                     { _id: _id },
//                     { bannerImage: result }, // Provide the updated bannerImage
//                     { new: true } // To return the updated document
//                 );

//                 if (!update) {
//                     return res
//                         .status(404)
//                         .json({ message: "Can not update document, something went wrong" });
//                 } else {
//                     return res.status(200).json({ success: true, update });
//                 }
//             }
//         } else {
//             // If there's no older image, update the document with the existing bannerImage
//             const update = await ShopPageImageModel.findOneAndUpdate(
//                 { _id: _id },
//                 { bannerImage: JSON.parse(bannerImag) }, // Provide the updated bannerImage
//                 { new: true } // To return the updated document
//             );

//             if (update) {
//                 return res.status(200).json({ success: true, update });
//             }
//         }
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message ? error.message : "Something went wrong",
//         });
//     }
// };

export const updateImage = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    const { bannerName } = req.body;
    const olderImage = req.body?.olderImage;
    const bannerImag = req.files?.bannerImage;
    // console.log("bannerImag", bannerImag);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }
    // console.log(JSON.parse(olderImage).length);
    // find the document with the id to delete the image from cloudinary

    if (olderImage) {
      const deletefromCloudinary = await ShopPageImageModel.findOne({
        _id: _id,
      });

      // console.log("deletefromCloudinary", deletefromCloudinary)
      const deleteresponse = await cloudinary.v2.uploader.destroy(
        deletefromCloudinary.image.public_id
      );

      if (deleteresponse) {
        const result = await cloudinary.v2.uploader.upload(
          bannerImag.tempFilePath,
          {
            folder: "GetSygnal/shopImage",
          }
        );
        // console.log("result", result);
        const update = await ShopPageImageModel.findOneAndUpdate(
          { _id: _id },
          { image: result }, // Provide the updated categoryName
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
      const update = await ShopPageImageModel.findOneAndUpdate(
        { _id: _id },
        { image: JSON.parse(olderImage) }, // Provide the updated categoryName
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

export const deleteImage = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    const deletefromCloudinary = await ShopPageImageModel.findOne({ _id: _id });
    // console.log(deletefromCloudinary);
    const deleteresponse = await cloudinary.v2.uploader.destroy(
      deletefromCloudinary.image.public_id
    );
    if (deleteresponse) {
      const deleteBanner = await ShopPageImageModel.findOneAndDelete({
        _id: _id,
      });
      if (!deleteBanner) {
        return res.status(404).json({
          error: "Can not find the document with the provided id to delete  ",
        });
      }
      res.status(200).json({ success: true, deleteBanner });
    } else {
      return res.status(404).json({ error: "can not delete the banner " });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const CreateAndUpdateImage = async (req, res) => {
  try {
    const ShopImag = req.files?.ShopImg;
    const findImage = await ShopPageImageModel.find();
    if (findImage?.length > 0) {
      const deleteImg = await cloudinary.v2.uploader.destroy(
        findImage[0]?.image.public_id
      );
      if (deleteImg) {
        const result = await cloudinary.v2.uploader.upload(
          ShopImag.tempFilePath,
          {
            folder: "Ayurpulse/ShopImage",
          }
        );
        // console.log("result", result);
        const update = await ShopPageImageModel.findOneAndUpdate(
          { _id: findImage[0]?._id },
          { image: result }, // Provide the updated categoryName
          { new: true } // To return the updated document
        );
        if (update)
          return res
            .status(200)
            .json({ message: "Shop Image Update successfully" });
      }
    } else {
      const result = await cloudinary.v2.uploader.upload(
        ShopImag.tempFilePath,
        {
          folder: "Ayurpulse/shopImage",
        }
      );
      if (result) {
        const shopImage = await ShopPageImageModel.create({
          image: result,
          addedBy: req.user._id,
        });
        if (shopImage) {
          return res.status(201).json({
            success: true,
            shopImage,
            message: " Shop Image Added successfully",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};
