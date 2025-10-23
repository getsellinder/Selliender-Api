import User from "../resources/user/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHander from "../Utils/errorhander.js";
import { Franchisee } from "../resources/Temple/FranchiseeModel.js";
import { OAuth2Client } from "google-auth-library";
// import { Business } from "../resources/Businesses/BusinessModel.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// export const isAuthenticatedUser = async (req, res, next) => {
//   try {
//     if (!req.headers.authorization) {
//       return res.status(400).json({
//         success: false,
//         message: "Login to Access this resource",
//       });
//     }
//     const getToken = req.headers;

//     //remove Bearer from token
//     const fronttoken = getToken.authorization.slice(7);
//     console.log(fronttoken);
//     const frontdecoded = jwt.decode(fronttoken, process.env.JWT_SECRET);
//     console.log(frontdecoded);
//     if (!frontdecoded) {
//       return res.status(400).json({
//         success: false,
//         message: "incorrect token",
//       });
//     }
//     const fuser = await User.findById(frontdecoded._id);
//     console.log(fuser);
//     req.user = fuser;

//     next();
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json({
        success: false,
        message: "Login to Access this resource",
      });
    }
    const token = req.headers.authorization.split(" ")[1];
    let decodedData;
    console.log("token", token);
    if (token.split(".").length === 3) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        decodedData = ticket.getPayload();
      } catch (error) {
        decodedData = jwt.verify(token, process.env.JWT_SECRET);
      }
    } else {
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
    }
    if (!decodedData) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    console.log("decodedData", decodedData);
    const userId = decodedData.id || decodedData._id; // _id for your login, sub for Google
    console.log(`google id ${decodedData._id}`);
    console.log(`user id ${decodedData.id}`);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("isAuthenticatedUser", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
export const isFranchiAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(400).json({
        success: false,
        message: "Login to Access this resource",
      });
    }
    const getToken = req.headers;
    //remove Bearer from token

    const fronttoken = getToken.authorization.slice(7);

    const frontdecoded = jwt.verify(fronttoken, process.env.JWT_SECRET);

    if (!frontdecoded) {
      return res.status(400).json({
        success: false,
        message: "incorrect token",
      });
    }
    // console.log(frontdecoded)
    const fuser = await Franchisee.findById(frontdecoded.id);

    req.franchi = fuser;

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// isBusinessAuthenticated

// export const isBusinessAuthenticated = async (req, res, next) => {
//   try {
//     if (!req.headers.authorization) {
//       return res.status(400).json({
//         success: false,
//         message: "Login to Access this resource",
//       });
//     }
//     const getToken = req.headers;
//     //remove Bearer from token

//     const fronttoken = getToken.authorization.slice(7);

//     const frontdecoded = jwt.verify(fronttoken, process.env.JWT_SECRET);

//     if (!frontdecoded) {
//       return res.status(400).json({
//         success: false,
//         message: "incorrect token",
//       });
//     }
//     // console.log(frontdecoded)
//     const fuser = await Business.findById(frontdecoded.id);

//     req.business = fuser;

//     next();
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const authorizeRoles = (...roles) => {
  //pass admin
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new ErrorHander("User not authenticated or role missing", 401)
      );
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};
