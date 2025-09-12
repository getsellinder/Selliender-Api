import mongoose from "mongoose";

import cloudinary from "../../Utils/cloudinary.js";
import { BannerModel } from "./BannerModel.js";
import { deleteFile, uploadFile } from "../../Utils/uploadeFile.js";

// Add new Category
export const addBanner = async (req, res) => {
  if (!req?.user) return res.status(400).json({ message: "please login !" });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "please login again " });
    }
    const { bannerName } = req.body;
    const { bannerImage } = req.files;
    console.log("bannerImage", bannerImage);
    const result = await uploadFile(bannerImage);

    if (result?.fileUrl) {
      const banner = await BannerModel.create({
        bannerName,
        bannerImage: {
          fileUrl: result.fileUrl,
          filePath: result.filePath,
        },

        addedBy: req.user._id,
      });
      return res
        .status(201)
        .json({ success: true, banner, message: "banner Added" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getBanner = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const banners = await BannerModel.find().sort({
      createdAt: -1,
    });

    if (!banners) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const updateBanner = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "Please login !" });
    const { _id } = req.params;
    const { bannerName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }
    const bannerImage = req.files?.bannerImage;

    const getOldbanner = await BannerModel.findById(_id);
    if (!getOldbanner) {
      return res.status(401).json({ message: "With this ID Banner not found" });
    }
    let oldbanner = getOldbanner.bannerImage.filePath;

    let updatesponse;
    let data = { bannerName };
    if (bannerImage) {
      if (oldbanner) {
        await deleteFile(oldbanner);
      }

      updatesponse = await uploadFile(bannerImage);
      data.bannerImage = {
        fileUrl: updatesponse.fileUrl,
        filePath: updatesponse.filePath,
      };
    } else {
      data.bannerImage = getOldbanner.bannerImage || null;
    }

    const update = await BannerModel.findOneAndUpdate({ _id }, data, {
      new: true,
    });
    return res.status(200).json({
      success: true,
      update,
      message: "Banner updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    const deletefrombyteScale = await BannerModel.findOne({ _id: _id });
    let delImage = deletefrombyteScale.bannerImage.filePath;

    await deleteFile(delImage);
    const deleteBanner = await BannerModel.findOneAndDelete({ _id: _id });
    if (!deleteBanner) {
      return res.status(404).json({
        error: "Can not find the document with the provided id to delete  ",
      });
    }
    res.status(200).json({
      success: true,
      message: "Banner Deleted Successfully",
      deleteBanner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};
