import mongoose from "mongoose";
import { CategoryModel, Categoryname } from "./CategoryModel.js";
import cloudinary from "../../Utils/cloudinary.js";

// Add new Category
export const addCategory = async (req, res) => {
  const { categoryName } = req.body;
  const { categoryImage } = req.files;
  // console.log(categoryName, categoryImage);

  if (!req?.user) return res.status(400).json({ message: "please login !" });
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "please login again " });
    }
    const result = await cloudinary.v2.uploader.upload(
      categoryImage.tempFilePath,
      {
        folder: "GetSygnal/category",
      }
    );

    if (result) {
      const category = await CategoryModel.create({
        categoryName,
        categoryImage: result,
        addedBy: req.user._id,
      });
      if (category) {
        return res
          .status(201)
          .json({ success: true, category, message: "category Added" });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    const categories = await CategoryModel.find().sort({
      createdAt: -1,
    });

    if (!categories) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    const { categoryName } = req.body;
    const olderImage = req.body?.olderImage;
    const categoryImag = req.files?.categoryImage;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    // find the document with the id to delete the image from cloudinary
    if (JSON.parse(olderImage).length == 0) {
      const deletefromCloudinary = await CategoryModel.findOne({ _id: _id });

      const deleteresponse = await cloudinary.v2.uploader.destroy(
        deletefromCloudinary.categoryImage.public_id
      );
      if (deleteresponse) {
        const result = await cloudinary.v2.uploader.upload(
          categoryImag.tempFilePath,
          {
            folder: "GetSygnal/category",
          }
        );
        const update = await CategoryModel.findOneAndUpdate(
          { _id: _id },
          { categoryName: categoryName, categoryImage: result }, // Provide the updated categoryName
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
      const update = await CategoryModel.findOneAndUpdate(
        { _id: _id },
        { categoryName: categoryName, categoryImage: JSON.parse(olderImage) }, // Provide the updated categoryName
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

export const deleteCategory = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    const { _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).json({ error: "Can not find the document " });
    }

    const deletefromCloudinary = await CategoryModel.findOne({ _id: _id });

    const deleteresponse = await cloudinary.v2.uploader.destroy(
      deletefromCloudinary.categoryImage.public_id
    );
    if (deleteresponse) {
      const deleteCategory = await CategoryModel.findOneAndDelete({ _id: _id });
      if (!deleteCategory) {
        return res.status(404).json({
          error: "Can not find the document with the provided id to delete  ",
        });
      }
      res.status(200).json({ success: true, deleteCategory });
    } else {
      return res.status(404).json({ error: "can not delete the category " });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// Home Screen
export const addcategoryname = async (req, res) => {
  try {
    const { name, categoryName } = req.body;
    const { img } = req.files;
    console.log("img", img);

    if (!req.files || !req.files.img) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const result = await cloudinary.v2.uploader.upload(img.tempFilePath, {
      folder: "GetSygnal/category",
    });
    const creatobj = {
      name,
      img: result,
    };
    const data = {
      categoryName: categoryName,
      categoryImage: [creatobj],
    };
    const respone = await Categoryname.create(data);
    return res.status(200).json(respone);
  } catch (error) {
    console.log("error in addcategoryname", error);
    return res.status(500).json({ message: error.message });
  }
};
