import cloudinary from "../../Utils/cloudinary.js";
import { Panel1 } from "./Panel1Model.js";
import { Panel2 } from "./Panel2Model.js";
import { Panel3 } from "./Panel3Model.js";
import { Panel4 } from "./Panel4Model.js";


export const AddPanel1 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content,title,displayPanel} = req.body;
    let image; // To store Cloudinary image details

    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "smellica/blog",
        }
      );

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create the blog post
    const panel1 = await Panel1.create({
      title,
      image,
      content,
      displayPanel,
      addedBy: req.user._id,
    });



    res.status(201).json({
      success: true,
      panel1,
      message: "Added successfully",
    });
  } catch (error) {
      console.error(error)
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getPanel1 = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const panel1 = await Panel1.find();

    res.status(200).json({
      success: true,
      panel1,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updatePanel1 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

      // Check if the user is authenticated
      if (!req.user) {
        return res.status(400).json({ message: "Please login!" });
      }
  
      // Destructure request body
      const { title, content,displayPanel } = req.body;
  
      // Prepare an object for the updated testimonial data
      const updatedPanel1Data = {
        title,
        content,
        displayPanel
      };
  
      // Check if files are uploaded
      if (req.files && req.files.image) {
        // If image file is uploaded, upload it to cloudinary
        const uploadedImage = req.files.image;
        const result = await cloudinary.v2.uploader.upload(
          uploadedImage.tempFilePath,
          {
            folder: "smellica/blog",
          }
        );
  
        // Prepare the image object with public_id and url
        const image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
  
        // Assign the uploaded image to the Blog's image field
        updatedPanel1Data.image = image;
    }
      const modifiedPanel = await Panel1.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updatedPanel1Data },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        ModifyBlog: modifiedPanel,
      });

  
  } catch (error) { 
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};



export const AddPanel2 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content,title,displayPanel} = req.body;
    let image; // To store Cloudinary image details

    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "smellica/blog",
        }
      );

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create the blog post
    const panel2 = await Panel2.create({
      title,
      image,
      content,
      displayPanel,
      addedBy: req.user._id,
    });



    res.status(201).json({
      success: true,
      panel2,
      message: "Added successfully",
    });
  } catch (error) {
      console.error(error)
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getPanel2 = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const panel2 = await Panel2.find();

    res.status(200).json({
      success: true,
      panel2,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updatePanel2 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

      // Check if the user is authenticated
      if (!req.user) {
        return res.status(400).json({ message: "Please login!" });
      }
  
      // Destructure request body
      const { title, content,displayPanel } = req.body;
  
      // Prepare an object for the updated testimonial data
      const updatedPanel2Data = {
        title,
        content,
        displayPanel
      };
  
      // Check if files are uploaded
      if (req.files && req.files.image) {
        // If image file is uploaded, upload it to cloudinary
        const uploadedImage = req.files.image;
        const result = await cloudinary.v2.uploader.upload(
          uploadedImage.tempFilePath,
          {
            folder: "smellica/blog",
          }
        );
  
        // Prepare the image object with public_id and url
        const image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
  
        // Assign the uploaded image to the Blog's image field
        updatedPanel2Data.image = image;
    }
      const modifiedPanel = await Panel2.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updatedPanel2Data },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        ModifyBlog: modifiedPanel,
      });

  
  } catch (error) { 
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};




export const AddPanel3 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content,title,displayPanel} = req.body;
    let image; // To store Cloudinary image details

    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "smellica/blog",
        }
      );

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create the blog post
    const panel3 = await Panel3.create({
      title,
      image,
      content,
      displayPanel,
      addedBy: req.user._id,
    });



    res.status(201).json({
      success: true,
      panel3,
      message: "Added successfully",
    });
  } catch (error) {
      console.error(error)
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getPanel3 = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const panel3 = await Panel3.find();

    res.status(200).json({
      success: true,
      panel3,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updatePanel3 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

      // Check if the user is authenticated
      if (!req.user) {
        return res.status(400).json({ message: "Please login!" });
      }
  
      // Destructure request body
      const { title, content,displayPanel } = req.body;
  
      // Prepare an object for the updated testimonial data
      const updatedPanel3Data = {
        title,
        content,
        displayPanel
      };
  
      // Check if files are uploaded
      if (req.files && req.files.image) {
        // If image file is uploaded, upload it to cloudinary
        const uploadedImage = req.files.image;
        const result = await cloudinary.v2.uploader.upload(
          uploadedImage.tempFilePath,
          {
            folder: "smellica/blog",
          }
        );
  
        // Prepare the image object with public_id and url
        const image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
  
        // Assign the uploaded image to the Blog's image field
        updatedPanel3Data.image = image;
    }
      const modifiedPanel = await Panel3.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updatedPanel3Data },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        ModifyBlog: modifiedPanel,
      });

  
  } catch (error) { 
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
export const AddPanel4 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const { content,title,displayPanel} = req.body;
    let image; // To store Cloudinary image details

    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      const result = await cloudinary.v2.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "smellica/blog",
        }
      );

      image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // Create the blog post
    const panel4 = await Panel4.create({
      title,
      image,
      content,
      displayPanel,
      addedBy: req.user._id,
    });



    res.status(201).json({
      success: true,
      panel4,
      message: "Added successfully",
    });
  } catch (error) {
      console.error(error)
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const getPanel4 = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const panel4 = await Panel4.find();

    res.status(200).json({
      success: true,
      panel4,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const updatePanel4 = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });

      // Check if the user is authenticated
      if (!req.user) {
        return res.status(400).json({ message: "Please login!" });
      }
  
      // Destructure request body
      const { title, content,displayPanel } = req.body;
  
      // Prepare an object for the updated testimonial data
      const updatePanel4Data = {
        title,
        content,
        displayPanel
      };
  
      // Check if files are uploaded
      if (req.files && req.files.image) {
        // If image file is uploaded, upload it to cloudinary
        const uploadedImage = req.files.image;
        const result = await cloudinary.v2.uploader.upload(
          uploadedImage.tempFilePath,
          {
            folder: "smellica/blog",
          }
        );
  
        // Prepare the image object with public_id and url
        const image = {
          public_id: result.public_id,
          url: result.secure_url,
        };
  
        // Assign the uploaded image to the Blog's image field
        updatePanel4Data.image = image;
    }
      const modifiedPanel = await Panel4.findOneAndUpdate(
        { _id: req.params.id },
        { $set: updatePanel4Data },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        ModifyBlog: modifiedPanel,
      });

  
  } catch (error) { 
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
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
          msg: "Deleted Successfully!!",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: error.message ? error.message : "Something went wrong!",
      });
    }
  };