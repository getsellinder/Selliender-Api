//Create Token and saving in cookie
import UserModel from "../resources/user/userModel.js";

const sendToken = async (user, statusCode, res) => {
  // create token from the provided user doc/object
  const token = user.getJWTToken ? user.getJWTToken() : null;

  // Try to fetch a fresh populated user so front-end immediately sees PlanId and SearchLimit
  try {
    const fresh = await UserModel.findById(user._id).populate(
      "PlanId",
      "Package SearchLimitMonthly SearchLimitYearly name"
    );

    if (fresh) {
      // If SearchLimit is not set but plan provides a monthly allowance, initialize it
      const planLimit = fresh?.PlanId?.SearchLimitMonthly ?? 0;
      if ((fresh.SearchLimit === 0 || fresh.SearchLimit == null) && planLimit > 0) {
        await UserModel.findByIdAndUpdate(fresh._id, { $set: { SearchLimit: planLimit } });
        fresh.SearchLimit = planLimit;
      }

      const userObj = fresh.toObject ? fresh.toObject() : fresh;
      // remove sensitive fields if any
      if (userObj.password) delete userObj.password;

      // set cookie and respond with full user object
      return res.status(statusCode).cookie("token", token).json({ success: true, token, user: userObj });
    }
  } catch (err) {
    console.warn("sendToken: failed to populate user or initialize SearchLimit:", err?.message || err);
    // fall through to minimal response
  }

  // fallback minimal response
  return res.status(statusCode).cookie("token", token).json({
    success: true,
    userId: user._id,
    name: user?.name,
    email: user?.email,
    token,
  });
};

export default sendToken;
