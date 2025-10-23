import jwt from "jsonwebtoken";
import Patient from "../resources/Patients/PatientModel.js";

export const isAuthenticatedPatient = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "Please Login to access this resource",
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
    const fpatient = await Patient.findById(frontdecoded.id);
    if (fpatient) {
      req.patient = fpatient;
      return next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    } else if (error.name === "JsonWebTokenError") {
      if (error.message === "invalid signature") {
        return res.status(401).json({ message: "Invalid token!." });
      } else {
        return res.status(401).json({ message: "Invalid token." });
      }
    } else {
      return res
        .status(500)
        .json({
          message: "An internal error occurred while verifying the token.",
        });
    }
    // return res.status(401).json({
    //     success: false,
    //     message: error.message,
    // });
  }
};
