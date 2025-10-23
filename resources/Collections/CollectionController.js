import mongoose from "mongoose";
import { CollectionModel } from "./CollectionsModel.js";

// Add new Collection
export const addCollection = async (req, res) => {
    const { collectionName } = req.body;
    // console.log(collectionName)
   
    if (!req?.user) return res.status(400).json({ message: "please login !" });

    try {
      const collection = await CollectionModel.create({
        collectionName,
        addedBy: req.user._id,
      });

      if (!collection) {
        return res
        .status(404)
        .json({ message: "Can not create document, something went wrong" });
      }

      return res
      .status(201)
      .json({ success: true, collection, message: "collection Added" });
      
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message ? error.message : "Something went Wrong",
      });
    }
  };
  
  export const getCollections = async (req, res) => {
    try {
      // if (!req?.user) return res.status(400).json({ message: "please login !" });
      const collections = await CollectionModel.find().sort({
        createdAt: -1,
      });
  
      if (!collections) {
        return res.status(404).json({ message: "No Collections found" });
      }
  
      res.status(200).json({ success: true, collections });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message ? error.message : "Something went wrong",
      });
    }
  };
  
  export const updateCollection = async (req, res) => {
    try {
      if (!req?.user) return res.status(400).json({ message: "please login !" });

      const { _id } = req.params;
      const { collectionName } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).json({ error: "Can not find the document " });
      }
  
          const update = await CollectionModel.findOneAndUpdate(
            { _id: _id },
            { collectionName: collectionName }, // Provide the updated CollectionName
            { new: true } // To return the updated document
          );

          if (!update) {
            return res
              .status(404)
              .json({ message: "Can not update document, something went wrong" });
          } 

          return res.status(200).json({ success: true, update });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message ? error.message : "Something went wrong",
      });
    }
  };
  
  export const deleteCollection = async (req, res) => {
    try {
      if (!req?.user) return res.status(400).json({ message: "please login !" });
      const { _id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).json({ error: "Can not find the document " });
      }
  
      const deleteCollection = await CollectionModel.findOneAndDelete({ _id: _id });
        if (!deleteCollection) {
          return res.status(404).json({
            error: "Can not find the document with the provided id to delete  ",
          });
        }
        res.status(200).json({ success: true, deleteCollection });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message ? error.message : "Something went wrong",
      });
    }
  };
  