import cloudinary from "../../Utils/cloudinary.js";
import { Testimonial } from "./TestimonialModel.js";
export const AddNewTestimonial = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user);

    if (req.files) {
      let getImg = req.files.image;
      const result = await cloudinary.v2.uploader.upload(getImg?.tempFilePath, {
        folder: "GetSygnal/Testimonial",
      });

      let simage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
      req.body.image = simage;
    }

    req.body.user = req.user._id;
    const testimonial = await Testimonial.create(req.body);

    res.status(201).json({
      success: true,
      testimonial,
      message: "Testimonial Added",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const FindAllTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.find().sort({ createdAt: -1 });
    if (testimonial) {
      return res.status(200).json({
        success: true,
        testimonial,
        message: "Fetched All Testimonial",
      });
    } else {
      return res.status(404).json({
        success: true,

        message: "No Testimonial till Now",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
export const FindOneTestimonial = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)
    if (!req.params.id)
      return res.status(400).json({ message: "please give ID !" });

    const testimonial = await Testimonial.findById(req.params.id);
    // console.log(testimonial);
    if (testimonial) {
      return res.status(200).json({
        success: true,
        testimonial,
        message: "Fetched  Testimonial",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// 3.update testimonials
export const updatetesTimonial = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(400).json({ message: "Please login!" });
    }

    // Destructure request body
    const { name, company, testimonial } = req.body;

    // Get the authenticated user's ID
    const userId = req.user._id;

    // Prepare an object for the updated testimonial data
    const updatedTestimonialData = {
      name,
      company,
      testimonial,
      user: userId, // Assign the authenticated user's ID to the testimonial's user field
    };

    // Check if files are uploaded
    if (req.files && req.files.image) {
      // If image file is uploaded, upload it to cloudinary
      const uploadedImage = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        uploadedImage.tempFilePath,
        {
          folder: "GetSygnal/Testimonial",
        }
      );

      // Prepare the image object with public_id and url
      const image = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      // Assign the uploaded image to the testimonial's image field
      updatedTestimonialData.image = image;
    }
    // console.log(updatedTestimonialData);
    // Update the testimonial in the database
    const modifiedTestimonial = await Testimonial.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updatedTestimonialData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      ModifyTestimonial: modifiedTestimonial,
    });
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
        msg: "Product Deleted Successfully!!",
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
export const deleteTestimonial = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)
    if (!req.params.id)
      return res.status(400).json({ message: "please give ID !" });
    // console.log(req.params.id)
    const gettestimonial = await Testimonial.findById(req.params.id);
    // console.log(gettestimonial)
    if (!gettestimonial) {
      return res
        .status(404)
        .json({ success: false, msg: "Testimonial not Found!" });
    }
    // Deleting Images From Cloudinary
    await cloudinary.v2.uploader.destroy(gettestimonial.image.public_id);

    //-------------------------//
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial Not Found" });
    }
    await testimonial.remove();
    res
      .status(200)
      .json({ success: true, msg: "Testimonial Deleted Successfully!!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
