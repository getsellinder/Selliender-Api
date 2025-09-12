import Blog from "./BlogModel.js";
import cloudinary from "../../Utils/cloudinary.js";

export const createBlog = async (req, res) => {
  const { title, tags, blog_content } = req.body;

  try {
    const existingBlog = await Blog.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") }, // Case-insensitive match
    });

    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "Title already exists. Please choose a different title.",
      });
    }

    let image; // To store Cloudinary image details

    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "smellica/Blog",
        }
      );

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create the blog post
    const blog = await Blog.create({
      title,
      tags: tags.split(/\s*,\s*|\s+/).filter((tag) => tag.trim() !== ""), // Splitting tags string into array
      image,
      blog_content,
    });

    res.status(201).json({
      success: true,
      blog,
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Error creating blog:", error);

    // Handle Mongoose validation error
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation Error", details: error.errors });
    }

    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate Key Error",
        message: `The title "${req.body.title}" is already taken. Please choose a different title.`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
export const getAllBlog = async (req, res) => {
  try {
    const BlogData = await Blog.find().sort({ createdAt: -1 });
    if (BlogData) {
      return res.status(200).json({
        success: true,
        BlogData,
        message: "Fetched All Blog",
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "No Blog till Now",
      });
    }
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//get single Blog
export const getOneBlog = async (req, res) => {
  try {
    // console.log(req.params.id);
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      return res.status(200).json({
        success: true,
        blog,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "Blog not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const getBlogByTitle = async (req, res) => {
  try {
    // console.log(req.params.id);
    const blog = await Blog.findOne({ title: req.params.title });
    if (blog) {
      return res.status(200).json({
        success: true,
        blog,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "Blog not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const deleteImageFromCloudinary = async (req, res) => {
  const { public_id } = req.params;

  try {
    if (!public_id) {
      return res.status(400).json({
        success: false,
        msg: "Please Provide Product ID!",
      });
    }
    const response = await cloudinary.v2.uploader.destroy(public_id);
    if (response) {
      res.status(200).json({
        success: true,
        msg: "Image Deleted Successfully!!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
//delete one Product
export const deleteBlog = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)
    if (!req.params.id)
      return res.status(400).json({ message: "please give Blog ID !" });
    // console.log(req.params.id)
    const getblog = await Blog.findById(req.params.id);
    // console.log(getblog)
    if (!getblog) {
      return res
        .status(404)
        .json({ success: false, msg: "Testimonial not Found!" });
    }
    // Deleting Images From Cloudinary
    await cloudinary.v2.uploader.destroy(getblog.image.public_id);

    //-------------------------//
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "blog Not Found" });
    }
    await blog.remove();
    res.status(200).json({ success: true, msg: "blog Deleted Successfully!!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

//update blog
export const updateBlog = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({ message: "Please login!" });
    }

    // Destructure request body
    const { title, tags, blog_content } = req.body;

    // Prepare an object for the updated testimonial data
    const updatedBlogData = {
      title,
      tags: tags.split(/\s*,\s*|\s+/).filter((tag) => tag.trim() !== ""), // Splitting tags string into array
      blog_content,
    };

    // Check if files are uploaded
    if (req.files && req.files.image) {
      // If image file is uploaded, upload it to cloudinary
      const uploadedImage = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        uploadedImage.tempFilePath,
        {
          folder: "smellica/Blog",
        }
      );

      // Prepare the image object with public_id and url
      const image = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      // Assign the uploaded image to the Blog's image field
      updatedBlogData.image = image;
    }
    const modifiedBlog = await Blog.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updatedBlogData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      ModifyBlog: modifiedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
