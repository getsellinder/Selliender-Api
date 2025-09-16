import catchAsyncErrors from "../../../middlewares/catchAsyncErrors.js";
import User from "../userModel.js";

export const AddCusstomer = async (req, res) => {
  try {
    const { name, email, password, ConfirmPassword } = req.body;

    if (!name || !email || !password || !ConfirmPassword) {
      return res.status(404).json({ message: "All The Fileds Are Required" });
    }

    if (password.trim() !== ConfirmPassword.trim()) {
      return res
        .status(404)
        .json({ message: "Password Should be match with confirm Password" });
    }

    let findUser = await User.findOne({ email });
    if (findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(200).json({
      message: "Customer created successfully",
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal Servar Error" });
  }
};

export const getAllCustomer = catchAsyncErrors(async (req, res, next) => {
  let limit = parseInt(req.query?.limit) || 4;
  let page = parseInt(req.query?.page) || 1;
  let obj = {
    role: "Customer",
  };
  if (req.query?.name) {
    obj.name = {
      $regex: new RegExp(req.query?.name),
      $options: "i",
    };
  }
  let total = await User.countDocuments(obj);

  const customers = await User.find(obj)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({
      createdAt: -1,
    });

  res.status(200).json({
    success: true,
    customers,
    total_data: total,
    total_pages: Math.ceil(total / limit),
  });
});
