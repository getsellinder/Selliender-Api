import mongoose from "mongoose";
import cloudinary from "../../Utils/cloudinary.js";
import { SubjectModel } from "./SubjectModel.js";
import { Series } from "../series/SeriesModel.js";
import { GenreModel } from "../Genres/GenreModel.js";

import { v4 as uuidv4 } from "uuid";
import { deleteFile, uploadFile } from "../../Utils/uploadeFile.js";

// const uploadFile = async (file) => {
//   try {
//     const uniqueFileName = `${uuidv4()}-${file.name}`;
//     const result = await uploadManager.upload({
//       data: file.data,
//       mime: file.mimetype,
//       originalFileName: file.name,
//       path: `/Frameji/chapter/${uniqueFileName}`,
//     });
//     return result;
//   } catch (error) {
//     console.error("Bytscale upload error:", error);
//     throw new Error("error uploading to Bytscale.");
//   }
// };

export const addSubject = async (req, res) => {
  const { subjectName, genreId } = req.body;

  // Check if user is authenticated
  if (!req?.user) {
    return res.status(401).json({ message: "Please login!" });
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(401).json({ message: "Please login again" });
  }

  // Check if file was
  // uploaded
  if (!req.files || !req.files.subjectImage) {
    return res.status(400).json({ message: "Subject image is required" });
  }

  const { subjectImage } = req.files;
  console.log("subjectImage", subjectImage);

  try {
    // Upload image to Cloudinary
    // const result = await cloudinary.v2.uploader.upload(
    //   subjectImage.tempFilePath,
    //   {
    //     folder: "GetSygnal/subject",
    //   }
    // );

    const result = await uploadFile(subjectImage);

    // Validate Cloudinary upload result
    if (!result?.fileUrl) {
      return res
        .status(500)
        .json({ message: "Failed to upload image to byscale" });
    }

    // Create subject in the database
    const subject = await SubjectModel.create({
      subjectName,
      genreId,
      subjectImage: {
        fileUrl: result.fileUrl,
        filePath: result.filePath,
      },

      addedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      subject,
      message: "Subject added successfully",
    });
  } catch (error) {
    console.error("Error in addSubject:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
// export const addSubject = async (req, res) => {
//   const { subjectName, genreId } = req.body;

//   // Check if user is authenticated
//   if (!req?.user) {
//     return res.status(401).json({ message: "Please login!" });
//   }

//   // Validate ObjectId
//   if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
//     return res.status(401).json({ message: "Please login again" });
//   }

//   // Check if file was
//   // uploaded
//   if (!req.files || !req.files.subjectImage) {
//     return res.status(400).json({ message: "Subject image is required" });
//   }

//   const { subjectImage } = req.files;

//   try {
//     // Upload image to Cloudinary
//     const result = await cloudinary.v2.uploader.upload(
//       subjectImage.tempFilePath,
//       {
//         folder: "GetSygnal/subject",
//       }
//     );

//     // Validate Cloudinary upload result
//     if (!result?.secure_url) {
//       return res
//         .status(500)
//         .json({ message: "Failed to upload image to Cloudinary" });
//     }

//     // Create subject in the database
//     const subject = await SubjectModel.create({
//       subjectName,
//       genreId,
//       subjectImage: {
//         public_id: result.public_id,
//         url: result.secure_url,
//       },
//       addedBy: req.user._id,
//     });

//     return res.status(201).json({
//       success: true,
//       subject,
//       message: "Subject added successfully",
//     });
//   } catch (error) {
//     console.error("Error in addSubject:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };
export const getSubjects = async (req, res) => {
  const { genreId } = req.query;
  try {
    const condiation = genreId ? { genreId } : {};
    const subjectsdata = await SubjectModel.find(condiation).sort({
      createdAt: -1,
    });

    if (!subjectsdata) {
      return res.status(404).json({ message: "No subjects found" });
    }

    const subjects = await Promise.all(
      subjectsdata.map(async (subject) => {
        console.log("subject", subject);
        const genre = await GenreModel.findById(subject.genreId);
        console.log("genreId", genre);
        const titleCount = await Series.countDocuments({
          subject: subject._id,
        });

        const istDateTime = new Date(subject.createdAt).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            // second: "2-digit",
            hour12: true,
          }
        );
        const istupdateTime = new Date(subject.updatedAt).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            // second: "2-digit",
            hour12: true,
          }
        );
        return {
          ...subject._doc,
          genrename: genre ? genre.genreName : null,
          titleCount,
          createdAtIST: istDateTime,
          updatedAt: istupdateTime,
        };
      })
    );
    res.status(200).json({ success: true, subjects });
    //   res.status(200).json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const getsubjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const subjectsdata = await SubjectModel.findById(id);
    if (!subjectsdata) {
      return res.status(400).json({ message: "subgenre data not found" });
    }
    const genre = await GenreModel.findById(subjectsdata.genreId);
    if (!genre) {
      return res.status(400).json({ message: "genre data not found" });
    }
    const result = {
      ...subjectsdata._doc,
      genrename: genre.genreName,
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

export const getsubjectByGenreId = async (req, res) => {
  const { id } = req.params;
  try {
    const genre = await GenreModel.findById(id);
    if (!genre) {
      return res.status(400).json({ message: "genre data not found" });
    }
    console.log("id", id);
    const subgenre = await SubjectModel.find({ genreId: id });
    if (!subgenre.length) {
      return res.status(401).json({ message: "subgenre not found" });
    }
    const result = subgenre.map((sg) => ({
      ...sg._doc,
      genrename: genre.genreName,
    }));
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  }
};

// export const updateSubject = async (req, res) => {
//   try {
//     const { _id } = req.params;

//     const { subjectName, genreId } = req.body;
//     let data = {
//       subjectName,
//       genreId,
//     };

//     if (req.files && req.files.subjectImage) {
//       const subjectImage = req.files.subjectImage;
//       if (!subjectImage || !subjectImage.mimetype.startsWith("image/")) {
//         return res
//           .status(400)
//           .json({ message: "Please upload a valid Image file." });
//       }
//       const imageupload = await uploadFile(subjectImage);
//       data.subjectImage = imageupload.fileUrl;
//     }
//     const update = await SubjectModel.findByIdAndUpdate(_id, data, {
//       new: true,
//     });
//     if (!update) {
//       return res.status(400).json({ message: "Id not found" });
//     }
//     return res
//       .status(200)
//       .json({ message: "SubGenre updated Successfullly", update });
//     // return res.status(200).json({ success: true, update });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong",
//     });
//   }
// };

export const updateSubject = async (req, res) => {
  try {
    const { _id } = req.params;
    const { subjectName, genreId } = req.body;

    let data = { subjectName, genreId };

    // Fetch old record
    const getoldimage = await SubjectModel.findById(_id);
    if (!getoldimage) {
      return res.status(400).json({ message: "Id not found" });
    }

    const subjectImage = req.files?.subjectImage;
    let imageupload;

    if (subjectImage) {
      if (!subjectImage.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Please upload a valid Image file." });
      }

      // Delete old file if exists
      if (getoldimage.subjectImage?.filePath) {
        await deleteFile(getoldimage.subjectImage.filePath);
      }

      // Upload new file
      imageupload = await uploadFile(subjectImage);

      // Save both url + path
      data.subjectImage = {
        fileUrl: imageupload.fileUrl,
        filePath: imageupload.filePath,
      };
    } else {
      // Keep old subject image
      data.subjectImage = getoldimage.subjectImage || null;
    }

    const update = await SubjectModel.findByIdAndUpdate(_id, data, {
      new: true,
    });

    return res.status(200).json({
      message: "SubGenre updated successfully",
      update,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "Please login!" });

    const { _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid subject ID format" });
    }

    const deletefromCloudinary = await SubjectModel.findOne({ _id });

    if (!deletefromCloudinary) {
      return res.status(404).json({
        error: "Cannot find the document with the provided ID to delete",
      });
    }

    // Check if subjectImage and public_id exist
    if (!deletefromCloudinary.subjectImage?.filePath) {
      return res
        .status(400)
        .json({ error: "No image associated with this subject" });
    }
    const delimage = deletefromCloudinary.subjectImage.filePath;

    await deleteFile(delimage);

    const deleteSubject = await SubjectModel.findOneAndDelete({ _id });
    if (!deleteSubject) {
      return res.status(404).json({
        message: "Cannot find the document with the provided ID to delete",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Subgenre Deleted Successfully" });
  } catch (error) {
    console.error("Error in deleteSubject:", {
      message: error.message,
      stack: error.stack,
      _id: req.params._id,
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
