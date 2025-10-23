import { Chapter } from "./ChapterModel.js";

import cloudinary from "../../Utils/cloudinary.js";

import UserModel from "../user/userModel.js";
import bcrypt from "bcryptjs";

export const createNewChapter = async (req, res) => {
  try {
    const {
      name,
      master_price,
      master_GST,
      genre,
      description,
      chapter_Status,
      special_instructions,
      sale_price,
      shipping_charge,
      colors,
      subject,
    } = req.body;

    // Parse and validate colors
    let parsedColors = [];
    console.log("Received colors:", req.body.colors); // Log raw input
    try {
      parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
      console.log("Parsed colors:", parsedColors); // Log parsed result
    } catch (error) {
      console.error("Color parsing error:", error.message);
      return res.status(400).json({ message: "Invalid color data." });
    }

    const existingChapter = await Chapter.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive match
    });

    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: "Name already exists. Please choose a different title.",
      });
    }

    // Check for mandatory fields, including subject
    if (
      !name ||
      !master_price ||
      !genre ||
      !description ||
      !sale_price ||
      !chapter_Status ||
      !parsedColors ||
      // Ensure colors are provided
      parsedColors.length === 0 ||
      !subject // Ensure subject is provided
    ) {
      return res.status(400).json({
        message:
          "Please fill all mandatory fields, including at least one color and subject.",
      });
    }

    // Initialize array for storing image and video URLs
    const image = [];

    // Validate at least one image file and limit to four files
    const fileFields = ["main", "img2", "img3", "img4"];
    const uploadedFiles = fileFields.filter(
      (field) => req.files && req.files[field]
    );

    if (uploadedFiles.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required." });
    }
    if (uploadedFiles.length > 4) {
      return res
        .status(400)
        .json({ message: "You can upload a maximum of four files." });
    }

    // Helper function to upload files to Cloudinary
    const uploadFile = async (file, resourceType) => {
      try {
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
          folder: "Frameji/chapter",
          resource_type: resourceType,
        });
        return result;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Error uploading to Cloudinary.");
      }
    };

    // Process each file field for Cloudinary upload
    for (const field of uploadedFiles) {
      const file = req.files[field];

      // Ensure 'main' is an image
      if (field === "main" && !file.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "The main file must be an image." });
      }

      const resourceType =
        field === "main" || file.mimetype.startsWith("image/")
          ? "image"
          : "video";
      const result = await uploadFile(file, resourceType);

      image.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    // Create the new product in the database

    const chapter = new Chapter({
      name,
      addedBy: req.user._id,
      master_price,
      master_GST: master_GST || null,
      genre,
      description,
      chapter_Status,
      special_instructions,
      image,
      shipping_charge,
      sale_price,
      colors: parsedColors,
      subject,
    });

    await chapter.save();

    res.status(201).json({ message: "Chapter created successfully", chapter });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message || "Something went wrong!" });
  }
};

export const RestoreChapter = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that a product ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Chapter ID!",
      });
    }

    // Find the product by ID
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not Found!",
      });
    }

    chapter.isDeleted = false;
    await chapter.save();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Chapter Restored Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const ChangeChapterStatus = async (req, res) => {
  try {
    const data = await Chapter.findById(req.params.id);
    if (data) {
      if (data?.chapter_Status === "Active") {
        let chapter = await Chapter.findByIdAndUpdate(
          req.params.id,
          { chapter_Status: "inActive" },
          { new: true } // Return the updated document
        );
        return res.status(200).json({
          success: true,
          msg: "Changed status inActive",
        });
      } else {
        let chapter = await Chapter.findByIdAndUpdate(
          req.params.id,
          { chapter_Status: "Active" },
          { new: true } // Return the updated document
        );
        return res.status(200).json({
          success: true,
          msg: "Changed status Active",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const getAllChapterUser = async (req, res) => {
  try {
    const PAGE_SIZE = parseInt(req.query?.show || "10");
    const page = parseInt(req.query?.page - 1 || "0");
    let obj = {};
    if (req.query?.name)
      obj.name = {
        $regex: new RegExp(req.query.name),
        $options: "i",
      };
    if (req.query?.genre) obj.genre = req.query.genre;
    // if (req.query?.FeatureProduct)
    //   obj.featured_Product = req.query.FeatureProduct;
    obj.chapter_Status = "Active";
    const total = await Chapter.countDocuments(obj);
    const chapter = await Chapter.find(obj)
      .populate({
        path: "genre addedBy master_GST variants.gst_Id",
        select: "name genreName tax active iaActive",
      })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      // .sort("name")
      .sort({
        // featured_Product: -1,
        createdAt: -1,
      })
      .exec();

    if (chapter) {
      return res.status(200).json({
        success: true,
        total_data: total,
        total_pages: Math.ceil(total / PAGE_SIZE),
        chapter,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

// export const getOneChapter = async (req, res) => {
//   try {
//     const data = await Chapter.findById(req.params.id).populate({
//       path: "genre addedBy master_GST variants.gst_Id reviews.user",
//       select: "name genreName tax active ",
//       path: "subject addedBy master_GST variants.gst_Id reviews.user",
//       select: "name subjectName tax active ",
//     });
//     if (data) {
//       return res.status(200).json({
//         success: true,
//         data,
//       });
//     }
//   } catch (error) {
//     // console.log(error)
//     res.status(500).json({
//       success: false,
//       msg: error.message ? error.message : "Something went wrong!",
//     });
//   }
// };

export const getOneChapter = async (req, res) => {
  try {
    const data = await Chapter.findById(req.params.id).populate([
      {
        path: "addedBy",
        select: "name", // assuming you want the 'name' field from User
      },
      {
        path: "master_GST",
        select: "tax active name", // adjust based on Tax model fields
      },
      {
        path: "variants.gst_Id",
        select: "tax active name", // adjust based on Tax model fields
      },
      {
        path: "reviews.user",
        select: "name", // assuming you want the 'name' field from User
      },
    ]);

    if (data) {
      return res.status(200).json({
        success: true,
        data,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
export const getChapterByName = async (req, res) => {
  try {
    // const data = await Product.findById(req.params.id)
    const data = await Chapter.findOne({ name: req.params.name }).populate({
      path: "genre addedBy master_GST variants.gst_Id reviews.user",
      select: "name genreName tax active ",
    });

    if (data) {
      return res.status(200).json({
        success: true,
        data,
      });
    }
  } catch (error) {
    // console.log(error)
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      subject,
      master_price,
      master_GST,
      genre,
      description,
      chapter_Status,
      special_instructions,
      shipping_charge,
      sale_price,
      colors,
    } = req.body;

    // Parse and validate colors
    let parsedColors = [];
    try {
      parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid format for colors field." });
    }

    // Check for mandatory fields
    if (
      !name ||
      !master_price ||
      !subject ||
      !genre ||
      !sale_price ||
      !description ||
      !chapter_Status ||
      !parsedColors || // Ensure colors are provided
      parsedColors.length === 0
    ) {
      return res.status(400).json({
        message:
          "Please fill all mandatory fields, including at least one color.",
      });
    }

    // Check if a different product with the same name already exists
    const existingChapter = await Chapter.findOne({ name, _id: { $ne: id } });
    if (existingChapter) {
      return res
        .status(400)
        .json({ message: "A Chapter with this name already exists." });
    }

    // Find the product by ID
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found." });
    }

    // Check if req.files is provided
    const fileFields = ["main", "img2", "img3", "img4"];
    const uploadedFiles = fileFields.filter(
      (field) => req.files && req.files[field]
    );

    // Initialize an array to hold new image URLs if files are uploaded
    const newImages = [];

    // If req.files contains files, delete old images and upload new ones
    if (uploadedFiles.length > 0) {
      // Delete existing images from Cloudinary (only if new files are provided)
      for (const img of chapter.image) {
        await cloudinary.v2.uploader.destroy(img.public_id);
      }

      // Helper function to upload files to Cloudinary
      const uploadFile = async (file, resourceType) => {
        try {
          const result = await cloudinary.v2.uploader.upload(
            file.tempFilePath,
            {
              folder: "Frameji/chapter",
              resource_type: resourceType,
            }
          );
          return result;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          throw new Error("Error uploading to Cloudinary.");
        }
      };

      // Process and upload new files
      for (const field of uploadedFiles) {
        const file = req.files[field];

        // Ensure 'main' is an image
        if (field === "main" && !file.mimetype.startsWith("image/")) {
          return res
            .status(400)
            .json({ message: "The main file must be an image." });
        }

        const resourceType =
          field === "main" || file.mimetype.startsWith("image/")
            ? "image"
            : "video";
        const result = await uploadFile(file, resourceType);

        newImages.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    // Prepare update fields, updating the image only if new images are uploaded
    const updateData = {
      name,
      master_price,
      master_GST: master_GST || null,
      genre,
      subject,
      description,
      chapter_Status,
      special_instructions,
      sale_price,
      colors: parsedColors,
      shipping_charge,
      ...(newImages.length > 0 && { image: newImages }), // Only replace images if new ones were uploaded
    };

    // Update the Chapter using findByIdAndUpdate
    const updatedChapter = await Chapter.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedChapter) {
      return res.status(404).json({ message: "Chapter not found." });
    }

    res.status(200).json({
      message: "chapter updated successfully",
      chapter: updatedChapter,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message || "Something went wrong!" });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { enteredPassword } = req.body;

    // Validate that a product ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Chapter ID!",
      });
    }

    // Find the product by ID
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not Found!",
      });
    }

    // // Delete images from Cloudinary if they exist
    // if (chapter.image && chapter.image.length > 0) {
    //   for (const img of chapter.image) {
    //     await cloudinary.v2.uploader.destroy(img.public_id);
    //   }
    // }

    const findeuser = await UserModel.findById(userId).select("+password");
    if (!findeuser) {
      return res.status(401).json({ message: " password not found" });
    }

    const isMatch = await bcrypt.compare(enteredPassword, findeuser.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Delete the chapter from the database
    chapter.isDeleted = true;
    await chapter.save();
    //  await chapter.deleteOne();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Chapter Deleted Successfully!",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

// TODO: FIx this api endpoint
export const deleteImageFromCloudinary = async (req, res) => {
  const { public_id } = req.params;

  try {
    if (!public_id) {
      return res.status(400).json({
        success: false,
        msg: "Please Provide Chapter ID!",
      });
    }
    const response = await cloudinary.v2.uploader.destroy(public_id);
    if (response) {
      res.status(200).json({
        success: true,
        msg: "Chapter Deleted Successfully!!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const getChaptersByGenre = async (req, res) => {
  const { genreName } = req.params; // Assuming category name is in the route
  // console.log(categoryName);

  try {
    if (!genre) {
      throw new Error("Genre not found");
    }
    const chapters = await Chapter.find({ genre: genre._id }).populate("");
    // console.log(products);

    if (chapters && chapters.length > 0) {
      return res.status(200).json({
        success: true,
        chapters,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "No chapters found for this genre",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const chapter = await Chapter.findById(req?.params?.chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const review = {
      user: req.user._id, // assuming user info is available in req.user
      rating,
      comment,
    };

    chapter.reviews.push(review);
    chapter.numberOfReviews = chapter.reviews.length;
    chapter.averageRating =
      chapter.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
      chapter.numberOfReviews;

    await chapter.save();

    res.status(201).json({
      success: true,
      reviews: chapter.reviews,
      averageRating: chapter.averageRating,
      numberOfReviews: chapter.numberOfReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId).populate(
      "reviews.user",
      "name"
    );

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json({
      success: true,
      reviews: chapter.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const review = chapter.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    chapter.averageRating =
      chapter.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
      chapter.numberOfReviews;

    await chapter.save();

    res.status(200).json({
      success: true,
      reviews: chapter.reviews,
      averageRating: chapter.averageRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const reviews = chapter.reviews.filter(
      (rev) => rev.user.toString() !== req.user._id.toString()
    );

    chapter.reviews = reviews;
    chapter.numberOfReviews = reviews.length;
    chapter.averageRating =
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / (reviews.length || 1);

    await chapter.save();

    res.status(200).json({
      success: true,
      reviews: chapter.reviews,
      averageRating: chapter.averageRating,
      numberOfReviews: chapter.numberOfReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
