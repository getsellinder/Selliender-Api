//Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  // consolelog(token)
  //options for cookie
  // const options = {
  //     expires: new Date(
  //         Date.now() + 20 * 24 * 60 * 60 * 1000
  //     ),
  //     httpOnly: true,
  // };

  res.status(statusCode).cookie("token", token).json({
    // res.status(statusCode).json({

    success: true,
    userId: user._id,
    name: user?.name,
    eamil: user?.email,

    // userName: user.name,
    // userEmail: user.email,
    // userPhone: user.phone,
    token,
  });
};

export default sendToken;
