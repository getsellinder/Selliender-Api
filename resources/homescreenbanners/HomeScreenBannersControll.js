import cloudinary from "../../Utils/cloudinary.js";
export const uploadbanner = async (req, res) => {
  try {
    const { name, banner } = req.body;
  } catch (error) {
    console.log("error in uploadbanner", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getbanners = async (req, res) => {
  try {
  } catch (error) {
    console.log("error in uploadbanner", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
