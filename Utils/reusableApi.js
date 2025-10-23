/* Guys Im creating this resuable CRUD funtions so that you no need to write these 
 things again and again you have to just pass them in arguments 
 feel free to make any changes here if you want to improve the code
 here:- 
    remember you can import this in controllers ONLY not anywhere else!!!
 Entity to pass is Schema Name which you import in controller e.g import { CalendarEvent } from "./calendarEventModel";  so Entity will be CalendarEvent in this case 
 by default I have kept the boolean arguments as false. you can pass it as true whenever needed.

*/
//author: Tazim K Madre

//imports
import cloudinary from "./cloudinary.js";

const getEntities = async (
  req,
  res,
  Entity,
  isUser = false,
  criteria = false,
  log = false
) => {
  //pagination added filter can change so it needs to be dynamic will add it in future
  let { page, limit } = req.query;
  page = page * 1;
  limit = limit * 1;
  let limitVal = limit;
  let skipeValue = (page - 1) * limitVal;
  if (isUser) {
    if (!req.user) return res.status(400).json({ message: "User not found." });
  }
  try {
    if (criteria) {
      const entity = await Entity.find({ createdBy: req.user._id });
      return res.status(200).json({ status: "OK", data: entity });
    }
    const totalRecords = await Entity.countDocuments({});
    const entity = await Entity.find({})
      .sort({ createdAt: -1 })
      .limit(limitVal)
      .skip(skipeValue);
    res
      .status(200)
      .json({ status: "OK", totalRecords: totalRecords, data: entity });
  } catch (err) {
    log && console.log(err);
    return res.status(500).json({ message: "Unable to fetch." });
  }
};

const getEntity = async (req, res, Entity, isUser = false, log = false) => {
  if (isUser) {
    1;
    if (!req.user) return res.status(400).json({ message: "User not found." });
  }
  try {
    const entity = await Entity.findById(req.params.id);
    if (!entity) {
      return res.status(400).json({ message: "Not found" });
    }
    res.status(200).json({ status: "OK", data: entity });
  } catch (err) {
    log && console.log(err);
    return res.status(500).json({ message: "Unable to find" });
  }
};

const addEntity = async (
  req,
  res,
  Entity,
  isUser = false,
  isSingleImage = false,
  isMultipleImages = false,
  isCreatedBy = false,
  log = false
) => {
  if (isUser) {
    if (!req.user) return res.status(400).json({ message: "User not found." });
  }
  try {
    if (isCreatedBy) {
      req.body.createdBy = req.user._id;
    }
    if (isSingleImage) {
      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        const image = { url: result.secure_url, public_id: result.public_id };
        req.body.image = image;
      }
    }
    if (isMultipleImages) {
      const imageUrlList = [];
      for (var i = 0; i < req.files.length; i++) {
        const locaFilePath = req.files[i].path;
        const result = await cloudinary.v2.uploader.upload(locaFilePath);
        imageUrlList.push({ url: result.url, public_id: result.public_id });
      }
      req.body.files = imageUrlList;
    }
    const entity = await Entity.create(req.body);
    res.status(200).json({ status: "OK", data: entity });
  } catch (err) {
    log && console.log(err);
    return res.status(500).json({ message: "Unable to create." });
  }
};

const updateEntity = async (
  req,
  res,
  Entity,
  isUser = false,
  isSingleImage = false,
  isMultipleImages = false,
  log = false
) => {
  if (isUser) {
    if (!req.user) return res.status(400).json({ message: "User not found." });
  }
  let entity = await Entity.findById(req.params.id);
  if (!entity) {
    return res.status(400).json({ message: "Not found" });
  }
  try {
    if (isSingleImage) {
      await cloudinary.v2.uploader.destroy(req.body.public_id);
      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        const image = { url: result.url, public_id: result.public_id };
        req.body.image = image;
      }
    }
    if (isMultipleImages) {
      for (let i = 0; i < req.body.publicIdArray; i++) {
        await cloudinary.v2.uploader.destroy(req.body.publicIdArray[i]);
      }
      const imageUrlList = [];
      for (var i = 0; i < req.files.length; i++) {
        const locaFilePath = req.files[i].path;
        const result = await cloudinary.v2.uploader.upload(locaFilePath);
        imageUrlList.push({ url: result.url, public_id: result.public_id });
      }
      req.body.files = imageUrlList;
    }
    entity = await Entity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ status: "OK", data: entity });
  } catch (err) {
    log && console.log(err);
    return res.status(500).json({ message: "Unable to update." });
  }
};

const deleteEntity = async (
  req,
  res,
  Entity,
  isUser = false,
  isSingleImage = false,
  isMultipleImages = false,
  log = false
) => {
  if (isUser) {
    if (!req.user) return res.status(400).json({ message: "User not found." });
  }
  //   if (isSingleImage) {
  //     req.body.imageUrl = req.file.location;
  //   }
  try {
    // if (isSingleImage) {
    //   await cloudinary.v2.uploader.destroy(entity.image.public_id);
    // }
    // if (isMultipleImages) {
    //   for (let i = 0; i < entity.files.length; i++) {
    //     await cloudinary.v2.uploader.destroy(entity.files[i].public_id);
    //   }
    // }
    await Entity.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: "OK", message: "Deleted Successfully" });
  } catch (err) {
    log && console.log(err);
    return res.status(500).json({ message: "Unable to delete" });
  }
};

export { getEntities, getEntity, addEntity, updateEntity, deleteEntity };
