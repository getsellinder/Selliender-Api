import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Name of category required "],
    },
    categoryImage: {},
    addedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CategorynameSchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      // required: [true, "Name of category required "],
      // ref: "CategorySchema",
    },
    categoryImage: [],
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model("CategoryModel", CategorySchema);

export const Categoryname = mongoose.model("Categoryname", CategorynameSchema);
