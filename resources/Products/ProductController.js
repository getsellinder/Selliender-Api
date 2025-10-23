import { Product } from "./ProductModel.js";
import cloudinary from "../../Utils/cloudinary.js";
import { v4 as uuidv4 } from "uuid";
import { CategoryModel } from "../Category/CategoryModel.js";




export const createProduct = async (req, res) => {
  try {
    const Checkname = req.body?.name;
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${Checkname}$`, "i") }, // Case-insensitive match
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Name already exists. Please choose a different title.",
      });
    }

    let findProduct = "";
    let product = { _id: "" };

    if (req.body?.product_id) {
      findProduct = await Product.findById(req.body.product_id);
    }
    const name = req.body?.name;
    if (!findProduct) {
      const data = await Product.findOne({
        name: { $regex: new RegExp(`^${name}$`, "ig") },
      }).exec();
      if (data)
        return res
          .status(400)
          .json({ message: "Product name already exists!" });
      req.body.addedBy = req.user._id;
      product = await Product.create(req.body);
    } else {
      const data = await Product.findOne({
        _id: { $ne: findProduct._id },
        name: { $regex: new RegExp(`^${name}$`, "ig") },
      }).exec();
      if (data)
        return res
          .status(400)
          .json({ message: "Product name already exists!" });
      product = await Product.findByIdAndUpdate(req.body.product_id, req.body);
    }
    res.status(201).json({
      message: "Product details added successfully!",
      product_id: product._id,
    });
  } catch (error) {
    // Handle validation error
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation Error", details: error.errors });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate Key Error",
        message: `The name "${req.body.name}" already exists. Please use a different name.`,
      });
    }

    res.status(500).json({
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};
////
export const createNewProduct = async (req, res) => {
  try {
    // console.log("product", req.body);
    const {
      name,
      master_price,
      master_GST,
      category,
      description,
      product_Status,
      special_instructions,
      sale_price,
      shipping_charge,
      colors
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

    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive match
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Name already exists. Please choose a different title.",
      });
    }

    // Check for mandatory fields
    if (
      !name ||
      !master_price ||
      !category ||
      !description ||
      !sale_price ||
      !product_Status ||
      !parsedColors || // Ensure colors are provided
      parsedColors.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all mandatory fields, including at least one color." });
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
          folder: "Frameji/product",
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
    const product = new Product({
      name,
      addedBy: req.user._id,
      master_price,
      master_GST: master_GST || null,
      category,
      description,
      product_Status,
      special_instructions,
      image,
      shipping_charge,
      sale_price,
      colors: parsedColors,
    });

    await product.save();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message || "Something went wrong!" });
  }
};

///////////////////////////////////////////////////////////////////////////////////////
// export const updateProduct = async (req, res) => {
//   try {
//     if (req.body?.variants) {
//       const vars = req.body.variants || []; // Default to an empty array if req.body.variants is undefined or null
//       const product = await Product.findByIdAndUpdate(
//         req.params.id,
//         { variants: vars },
//         { new: true } // Return the updated document
//       );

//       // Send a JSON response back to the client
//       return res.status(201).json({
//         message: "Product variant saved successfully",
//         variants: product?.variants || [], // Return the updated variants or an empty array if product is undefined
//       });
//     }

//     if (req?.files) {
//       const getProduct = await Product.findById(req.params.id);

//       if (getProduct?.image?.length > 0) {
//         // Deleting Images From Cloudinary
//         for (let i = 0; i < getProduct.image.length; i++) {
//           await cloudinary.v2.uploader.destroy(getProduct.image[i]?.public_id);
//         }
//       }
//       let images = [];
//       let Allfiles = req.files.image;
//       if (typeof Allfiles.tempFilePath === "string") {
//         let filepath = Allfiles.tempFilePath;

//         images.push(filepath);
//       } else {
//         Allfiles.map((item) => {
//           images.push(item.tempFilePath);
//         });
//       }

//       const imagesLinks = [];
//       for (let i = 0; i < images.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(images[i], {
//           folder: "Frameji/product",
//         });

//       }
//       let product = await Product.findByIdAndUpdate(
//         req.params.id,
//         { image: imagesLinks },
//         { new: true } // Return the updated document
//       );
//       return res.status(201).json({
//         message: "Product image saved successfully",
//         images: product?.image || [], // Return the updated variants or an empty array if product is undefined
//       });
//     } imagesLinks.push({
//       public_id: result.public_id,
//       url: result.secure_url,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: error.message ? error.message : "Something went wrong!",
//     });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      master_price,
      master_GST,
      category,
      description,
      product_Status,
      special_instructions,
      shipping_charge,
      sale_price,
      colors
    } = req.body;

    // Parse and validate colors
    let parsedColors = [];
    try {
      parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
    } catch (error) {
      return res.status(400).json({ message: "Invalid format for colors field." });
    }

    // Check for mandatory fields
    if (
      !name ||
      !master_price ||
      !category ||
      !sale_price ||
      !description ||
      !product_Status ||
      !parsedColors || // Ensure colors are provided
      parsedColors.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all mandatory fields, including at least one color." });
    }

    // Check if a different product with the same name already exists
    const existingProduct = await Product.findOne({ name, _id: { $ne: id } });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "A product with this name already exists." });
    }

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
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
      for (const img of product.image) {
        await cloudinary.v2.uploader.destroy(img.public_id);
      }

      // Helper function to upload files to Cloudinary
      const uploadFile = async (file, resourceType) => {
        try {
          const result = await cloudinary.v2.uploader.upload(
            file.tempFilePath,
            {
              folder: "Frameji/product",
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
      category,
      description,
      product_Status,
      special_instructions,
      sale_price,
      colors: parsedColors,
      shipping_charge,
      ...(newImages.length > 0 && { image: newImages }), // Only replace images if new ones were uploaded
    };

    // Update the product using findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message || "Something went wrong!" });
  }
};


////////////////////////////////////////////////////////////////////////////
//get All Product
export const getAllProductAdmin = async (req, res) => {
  try {
    const PAGE_SIZE = parseInt(req.query?.show || "10");
    const page = parseInt(req.query?.page - 1 || "0");
    let obj = {};
    if (req.query?.name)
      obj.name = {
        $regex: new RegExp(req.query.name),
        $options: "i",
      };
    if (req.query?.category) obj.category = req.query.category;
    if (req.query?.FeatureProduct)
      obj.featured_Product = req.query.FeatureProduct;
    const total = await Product.countDocuments(obj);
    const product = await Product.find(obj)
      .populate({
        path: "category addedBy master_GST variants.gst_Id",
        select: "name categoryName tax active active ",
      })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      // .sort("name")
      .sort({
        featured_Product: -1,
        createdAt: -1,
      })
      .exec();

    if (product) {
      return res.status(200).json({
        success: true,
        total_data: total,
        total_pages: Math.ceil(total / PAGE_SIZE),
        product,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

//get All Product User(website)
export const getAllProductUser = async (req, res) => {
  try {
    const PAGE_SIZE = parseInt(req.query?.show || "10");
    const page = parseInt(req.query?.page - 1 || "0");
    let obj = {};
    if (req.query?.name)
      obj.name = {
        $regex: new RegExp(req.query.name),
        $options: "i",
      };
    if (req.query?.category) obj.category = req.query.category;
    if (req.query?.FeatureProduct)
      obj.featured_Product = req.query.FeatureProduct;
    obj.product_Status = "Active";
    const total = await Product.countDocuments(obj);
    const product = await Product.find(obj)
      .populate({
        path: "category addedBy master_GST variants.gst_Id",
        select: "name categoryName tax active iaActive",
      })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      // .sort("name")
      .sort({
        featured_Product: -1,
        createdAt: -1,
      })
      .exec();

    if (product) {
      return res.status(200).json({
        success: true,
        total_data: total,
        total_pages: Math.ceil(total / PAGE_SIZE),
        product,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
//Change Product status
export const ChangeProductStatus = async (req, res) => {
  try {
    const data = await Product.findById(req.params.id);
    if (data) {
      if (data?.product_Status === "Active") {
        let product = await Product.findByIdAndUpdate(
          req.params.id,
          { product_Status: "inActive" },
          { new: true } // Return the updated document
        );
        return res.status(200).json({
          success: true,
          msg: "Changed status inActive",
        });
      } else {
        let product = await Product.findByIdAndUpdate(
          req.params.id,
          { product_Status: "Active" },
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
//Change Product status
export const ChangeFeatueProductStatus = async (req, res) => {
  try {
    const data = await Product.findById(req.params.id);
    if (data) {
      if (data?.featured_Product === false) {
        const totalFeatueProduct = await Product.countDocuments({
          featured_Product: true,
        });
        if (totalFeatueProduct > 2) {
          return res.status(400).json({
            success: false,
            msg: "Maximum 3 Featue Product can be..",
          });
        }
        let product = await Product.findByIdAndUpdate(
          req.params.id,
          { featured_Product: true },
          { new: true } // Return the updated document
        );
        return res.status(200).json({
          success: true,
          msg: "Changed status as Featue Product",
        });
      } else {
        let product = await Product.findByIdAndUpdate(
          req.params.id,
          { featured_Product: false },
          { new: true } // Return the updated document
        );
        return res.status(200).json({
          success: true,
          msg: "Changed status as not Featue Product",
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
//get One Product
export const getOneProduct = async (req, res) => {
  try {
    const data = await Product.findById(req.params.id).populate({
      path: "category addedBy master_GST variants.gst_Id reviews.user",
      select: "name categoryName tax active ",
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

export const getProductByName = async (req, res) => {
  // console.log("name",req.params.name)
  try {
    // const data = await Product.findById(req.params.id)
    const data = await Product.findOne({ name: req.params.name }).populate({
      path: "category addedBy master_GST variants.gst_Id reviews.user",
      select: "name categoryName tax active ",
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

// get all product with device products first
export const getAllProductsDevicesFirst = async (req, res) => {
  try {
    // we want products with category name Device to be displayed first, so i have first found the products with category name Devices then made another request to find all products and filtered products with category devices , then merged both arrays so we get devices first then all other categories
    const categoryName = "Devices";
    // Find the category object by name first
    const category = await CategoryModel.findOne({ categoryName });
    if (!category) {
      throw new Error("Category not found");
    }
    // products with device category
    const deviceProducts = await Product.find({
      category: category._id,
    }).populate("category");

    // all products
    const allProducts = await Product.find()
      .populate({
        path: "category gst addedBy",
        select: "name categoryName tax",
      })
      .sort({
        createdAt: -1,
      });
    // filtering out products with device category
    const filteredProducts = allProducts.filter((ele) => {
      return ele.category?.categoryName !== categoryName;
    });

    // merging both deviceProcuts and filtered products
    const product = deviceProducts.concat(filteredProducts);
    if (product) {
      return res.status(200).json({
        success: true,
        product,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

// 3.update Product
// export const updateProduct = async (req, res) => {
//   const {
//     name,
//     description,
//     price,
//     category,
//     image,
//     gst_amount,
//     gst,
//     total_amount,
//   } = req.body;
//   console.log(gst_amount, gst, total_amount);

//   try {
//     // Prepare an array for the images
//     const jsonArray = JSON.parse(image);
//     const AllImages = jsonArray.map(({ public_id, url }) => ({
//       public_id,
//       url,
//     }));

//     if (req.files && req.files.newImages) {
//       const newuploadImages = Array.isArray(req.files.newImages)
//         ? req.files.newImages
//         : [req.files.newImages];

//       const imagesLinks = [];

//       for (let i = 0; i < newuploadImages.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(
//           newuploadImages[i].tempFilePath,
//           {
//             folder: "smellica/product",
//           }
//         );

//         imagesLinks.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }

//       // Combine the existing images and the newly uploaded images
//       const updatedImages = [...AllImages, ...imagesLinks];

//       // Perform the product update
//       const ModifyProduct = await Product.findOneAndUpdate(
//         { _id: req.params.id },
//         {
//           $set: {
//             name,
//             description,
//             price,
//             category,
//             image: updatedImages,
//             gst,
//             gst_amount,
//             total_amount,
//           },
//         },
//         { new: true }
//       );
//       return res.status(200).json({
//         success: true,
//         ModifyProduct,
//       });
//     } else {
//       const ModifyProduct = await Product.findOneAndUpdate(
//         { _id: req.params.id },
//         {
//           $set: {
//             name,
//             description,
//             price,
//             category,
//             image: AllImages,
//           },
//         },
//         { new: true }
//       );
//       return res.status(200).json({
//         success: true,
//         ModifyProduct,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       msg: error.message ? error.message : "Something went wrong!",
//     });
//   }
// };
// export const updateProduct = async (req, res) => {
//   const {
//     name,
//     description,
//     price,
//     category,
//     image,
//     gst_amount,
//     product_Status,
//     gst,
//     total_amount,
//   } = req.body;
//   try {
//     // Prepare an array for the images
//     const jsonArray = JSON.parse(image);
//     const AllImages = jsonArray.map(({ public_id, url }) => ({
//       public_id,
//       url,
//     }));

//     let updatedImages = AllImages;

//     if (req.files && req.files.newImages) {
//       const newUploadImages = Array.isArray(req.files.newImages)
//         ? req.files.newImages
//         : [req.files.newImages];

//       const imagesLinks = [];

//       for (let i = 0; i < newUploadImages.length; i++) {
//         const result = await cloudinary.v2.uploader.upload(
//           newUploadImages[i].tempFilePath,
//           {
//             folder: "smellica/product",
//           }
//         );

//         imagesLinks.push({
//           public_id: result.public_id,
//           url: result.secure_url,
//         });
//       }

//       // Combine the existing images and the newly uploaded images
//       updatedImages = [...AllImages, ...imagesLinks];
//     }

//     // Perform the product update
//     const updatedProduct = await Product.findOneAndUpdate(
//       { _id: req.params.id },
//       {
//         $set: {
//           name,
//           description,
//           product_Status,
//           price,
//           category,
//           image: updatedImages,
//           gst,
//           gst_amount,
//           total_amount,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ success: false, msg: "Product not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({
//       success: false,
//       msg: error.message ? error.message : "Something went wrong!",
//     });
//   }
// };

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
export const deleteProduct = async (req, res) => {
    try {
    const { id } = req.params;

    // Validate that a product ID is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Product ID!",
      });
    }

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not Found!",
      });
    }

    // Delete images from Cloudinary if they exist
    if (product.image && product.image.length > 0) {
      for (const img of product.image) {
        await cloudinary.v2.uploader.destroy(img.public_id);
      }
    }

    // Delete the product from the database
    await product.deleteOne();

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully!",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { categoryName } = req.params; // Assuming category name is in the route
  // console.log(categoryName);

  try {
    // Find the category object by name first
    const category = await CategoryModel.findOne({ categoryName });

    if (!category) {
      throw new Error("Category not found");
    }
    const products = await Product.find({ category: category._id }).populate(
      "category"
    );
    // console.log(products);

    if (products && products.length > 0) {
      return res.status(200).json({
        success: true,
        products,
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "No products found for this category",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};
// Add a review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req?.params?.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      user: req.user._id, // assuming user info is available in req.user
      rating,
      comment,
    };

    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
      product.numberOfReviews;

    await product.save();

    res.status(201).json({
      success: true,
      reviews: product.reviews,
      averageRating: product.averageRating,
      numberOfReviews: product.numberOfReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a product
export const getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "reviews.user",
      "name"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    product.averageRating =
      product.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
      product.numberOfReviews;

    await product.save();

    res.status(200).json({
      success: true,
      reviews: product.reviews,
      averageRating: product.averageRating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = product.reviews.filter(
      (rev) => rev.user.toString() !== req.user._id.toString()
    );

    product.reviews = reviews;
    product.numberOfReviews = reviews.length;
    product.averageRating =
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / (reviews.length || 1);

    await product.save();

    res.status(200).json({
      success: true,
      reviews: product.reviews,
      averageRating: product.averageRating,
      numberOfReviews: product.numberOfReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
