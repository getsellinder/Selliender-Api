import { isAuthenticatedUser } from "./auth.js";
import { isAuthenticatedPatient } from "./PatientAuth.js";

export const isAuthenticatedUserOrPatient = async (req, res, next) => {
  try {
    await isAuthenticatedUser(req, res, async (err) => {
      if (err || !req.user) {
        // If there was an error in user authentication or req.user is not defined,
        // try authenticating as a patient.
        await isAuthenticatedPatient(req, res, next);
      } else {
        next();
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "An internal error occurred." });
  }
};
