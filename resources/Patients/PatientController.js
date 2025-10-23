// import hashPassword from '../utils/hashPassword';

import crypto from "crypto";
import Patient from "./PatientModel.js";
import sendEmail, { sendOtp } from "../../Utils/sendEmail.js";
import validator from "validator";
import password from "secure-random-password";
import cloudinary from "../../Utils/cloudinary.js";

export const register = async (req, res) => {
  let { name, countryCode, mobileNumber } = req.body;
  // Trim the country code and mobile number
  countryCode = countryCode?.trim();
  mobileNumber = mobileNumber?.trim();
  const fullMobileNumber = `${countryCode}${mobileNumber}`;
  try {
    let patient = await Patient.findOne({ mobileNumber: fullMobileNumber });
    if (patient && patient.isVerified) {
      return res.status(400).json({
        message: "Patient already registered and verified for This Mobile No.",
      });
    }
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = Date.now() + 3 * 60 * 1000; // 3 minutes

    if (patient) {
      patient.otp = otp;
      patient.otpExpires = otpExpires;
    } else {
      patient = new Patient({
        name,
        mobileNumber: fullMobileNumber,
        otp,
        otpExpires,
      });
    }
    await patient.save();
    await sendOtp(fullMobileNumber, `Your tavisa verification OTP is: ${otp}`);

    return res.status(200).json({
      message: `OTP sent to your  mobile number ${fullMobileNumber} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  try {
    let mobileNmr = mobileNumber?.trim();
    const patient = await Patient.findOne({ mobileNumber: mobileNmr });

    if (!patient) {
      return res.status(400).json({ message: "Invalid mobile number or OTP" });
    }

    if (patient.otp !== otp || patient.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    patient.isVerified = true;
    patient.otp = undefined;
    patient.otpExpires = undefined;
    await patient.save();
    const token = patient.getJWTToken();
    res.status(200).json({
      success: true,
      token,
      message: "Mobile number verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};
// Login Patient
export const loginPatient = async (req, res) => {
  const { email, password } = req.body;
  // checking if patient has given password and email both

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please Enter Email & Password" });
    }

    const patient = await Patient.findOne({ email }).select("+password");

    if (!patient) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isPasswordMatched = await patient.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
    const token = patient.getJWTToken();

    return res.status(200).json({
      success: true,
      token,
      name: patient?.name,
      message: "Login Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};

//get All patient
export const getAllPatient = async (req, res) => {
  try {
    const PAGE_SIZE = parseInt(req.query?.show || "10");
    const page = parseInt(req.query?.page - 1 || "0");
    let obj = {};
    if (req.query?.name)
      obj.name = {
        $regex: new RegExp(req.query.name),
        $options: "i",
      };
    if (req.query?.mobileNumber)
      obj.mobileNumber = {
        $regex: new RegExp(req.query.mobileNumber),
        $options: "i",
      };

    if (req.query?.category) obj.category = req.query.category;
    if (req.query?.isVerified) obj.isVerified = req.query.isVerified;
    const total = await Patient.countDocuments(obj);
    const patient = await Patient.find(obj)
      // .populate({
      //   path: "category addedBy master_GST variants.gst_Id",
      //   select: "name categoryName tax",
      // })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page)
      // .sort("name")
      .sort({
        createdAt: -1,
      })
      .exec();

    if (patient) {
      return res.status(200).json({
        success: true,
        total_data: total,
        total_pages: Math.ceil(total / PAGE_SIZE),
        patient,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const getOnePatient = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Please provide patient ID" });
    }
    const data = await Patient.findById(req.params.id);
    if (data) {
      return res.status(200).json({
        success: true,
        message: "feched!",
        data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const create1RegistrationDetails = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });
  if (!confirmPassword)
    return res.status(400).json({ message: "Confirm password is required" });
  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and confirm password do not match" });
  }
  try {
    const patient = await Patient.findById(req.patient._id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found " });
    }
    if (!patient.isVerified) {
      return res.status(400).json({ message: "Patient not verified" });
    }

    // Check if another patient with the same email exists
    const emailExists = await Patient.findOne({ email });
    if (
      emailExists &&
      emailExists._id.toString() !== req.patient._id.toString()
    ) {
      return res.status(400).json({
        message: "This Email ID is already in use By Another patient",
      });
    }
    patient.email = email;
    patient.password = password;

    await patient.save();
    const patientResponse = patient.toObject();
    delete patientResponse.password;

    res.status(200).json({
      patient: patientResponse,
      message: "Registration details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};

export const EnterPatientDetails = async (req, res) => {
  const { gender, weightValue, weightUnit, heightValue, heightUnit, age } =
    req.body;

  switch (true) {
    case !gender:
      return res.status(400).json({ message: "Gender is required" });
    case !weightValue:
      return res.status(400).json({ message: "weight Value is required" });
    case !weightUnit:
      return res.status(400).json({ message: "weight Unit is required" });
    case !heightValue:
      return res.status(400).json({ message: "height Value is required" });
    case !heightUnit:
      return res.status(400).json({ message: "height Unit is required" });
    case !age:
      return res
        .status(400)
        .json({ message: "Age is required and Must Be a Number" });
    default:
      //gender Validate
      if (!["Male", "Female"].includes(gender)) {
        return res.status(400).json({
          message: 'Invalid gender:gender Must be "Male" or "Female"',
        });
      }
      // Validate weightUnit
      if (!["Kgs", "Lbs"].includes(weightUnit)) {
        return res
          .status(400)
          .json({ message: 'Invalid weight unit. Must be "Kgs" or "Lbs"' });
      }
      // Ensure weightValue is a number
      if (isNaN(weightValue)) {
        return res
          .status(400)
          .json({ message: "Weight value must be a number" });
      }
      // Validate heightUnit
      if (!["Ft", "Cm"].includes(heightUnit)) {
        return res
          .status(400)
          .json({ message: 'Invalid height unit. Must be "Ft" or "Cm"' });
      }
      // Ensure heightValue is a number
      if (isNaN(heightValue)) {
        return res
          .status(400)
          .json({ message: "Height value must be a number" });
      }
      if (isNaN(age)) {
        return res.status(400).json({ message: "age must be a number" });
      }

      try {
        const patient = await Patient.findById(req.patient._id);
        if (!patient) {
          return res.status(404).json({ message: "Patient not found " });
        }
        if (!patient.isVerified) {
          return res.status(400).json({ message: "Patient not verified" });
        }

        patient.gender = gender;
        patient.weight = {
          value: weightValue,
          unit: weightUnit,
        };
        patient.height = {
          value: heightValue,
          unit: heightUnit,
        };
        patient.age = age;
        await patient.save();
        const patientResponse = patient.toObject();
        delete patientResponse.password;
        res.status(200).json({
          patient: patientResponse,
          message: "Patient details updated successfully",
        });
      } catch (error) {
        res.status(500).json({
          message: error.message ? error.message : "Server error!",
        });
      }
  }
};

export const EnterPersonalDetails = async (req, res) => {
  const {
    commonHealthComplaints,
    familyHistory,
    personalHistory,
    dailyRoutine,
  } = req.body;

  try {
    const patient = await Patient.findById(req.patient._id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found " });
    }
    if (!patient.isVerified) {
      return res.status(400).json({ message: "Patient not verified" });
    }
    // Check if another patient with the same email exists

    patient.commonHealthComplaints = commonHealthComplaints;
    patient.familyHistory = familyHistory;
    patient.personalHistory = personalHistory;
    patient.dailyRoutine = dailyRoutine;
    await patient.save();
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    res.status(200).json({
      patient: patientResponse,
      message: "Patient Pesonal details updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};

// 4.Forgot Password

export const forgotPassword = async (req, res) => {
  const patient = await Patient.findOne({ email: req.body.email });
  if (!req.body.email) {
    return res.status(400).json({ message: "please Enter Email!" });
  }
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }
  // Get ResetPassword Token
  // const resetToken = patient.getResetPasswordToken(); //call function

  //save database reset token
  // await patient.save({ validateBeforeSave: false });

  const passwords = password.randomPassword({
    length: 12,
    characters: [
      { characters: password.upper, exactly: 1 },
      { characters: password.symbols, exactly: 1 },
      password.lower,
      password.digits,
    ],
  });

  patient.password = passwords;
  await patient.save();
  // const message = `Your password reset token are :- \n\n ${resetPasswordUrl} \n\nyour new password is:${password}\n\nIf you have not requested this email then, please ignore it.`;
  try {
    await sendEmail({
      to: `${patient?.email}`, // Change to your recipient

      from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

      subject: `Tavisa Password Recovery`,
      html: `your new password is: <br/> <strong> ${passwords}</strong><br/><br/>If you have not requested this email then, please ignore it.`,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${patient?.email} successfully`,
    });
  } catch (error) {
    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpire = undefined;

    await patient.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};

//update Patient Profile Image
export const UploadProfileImage = async (req, res) => {
  if (!req.files) {
    return res.status(404).json({ message: "Please Select Image" });
  }
  const patient = await Patient.findById(req.patient._id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found " });
  }
  if (!patient.isVerified) {
    return res
      .status(400)
      .json({ message: "Patient not verified First verify Mobile No." });
  }
  let newPatientData = {};
  try {
    if (req.files) {
      const patientImage = req.files?.avatar;
      const patient = await Patient.findById(req.patient._id);

      if (patient?.avatar?.public_id) {
        const imageId = patient?.avatar?.public_id;
        await cloudinary.uploader.destroy(imageId);
      }

      const myCloud = await cloudinary.v2.uploader.upload(
        patientImage.tempFilePath,
        {
          folder: "tavisa/patient-image",
        }
      );

      newPatientData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      let patientDetail = await Patient.findByIdAndUpdate(
        req.patient._id,
        newPatientData,
        { new: true } // Return the updated document
      );

      return res.status(200).json({
        success: true,
        message: "Image Uploaded Successfully!",
        patientDetail,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};
//Update mobile Number
export const updateMobileNumber = async (req, res) => {
  let { newCountryCode, newMobileNumber } = req.body;
  newCountryCode = newCountryCode?.trim();
  newMobileNumber = newMobileNumber?.trim();
  const newFullMobileNumber = `${newCountryCode}${newMobileNumber}`;

  try {
    if (req.patient?.mobileNumber === newFullMobileNumber) {
      return res.status(400).json({
        message:
          "New mobile number cannot be the same as the old mobile number",
      });
    }
    let patient = await Patient.findOne({
      mobileNumber: req.patient?.mobileNumber,
    });
    if (!patient) {
      return res.status(400).json({ message: "Patient not found" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = Date.now() + 3 * 60 * 1000; // 3 minutes

    patient.newMobileNumber = newFullMobileNumber;
    patient.otp = otp;
    patient.otpExpires = otpExpires;

    await patient.save();
    await sendOtp(
      newFullMobileNumber,
      `Your tavisa verification OTP is: ${otp}`
    );

    return res.status(200).json({
      message: `OTP sent to your new mobile number ${newFullMobileNumber} successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};
//verify Updated Number OTP
export const verifyUpdatedMobileOtp = async (req, res) => {
  const { newMobileNumber, otp } = req.body;
  try {
    let mobileNmr = newMobileNumber?.trim();
    const patient = await Patient.findOne({ newMobileNumber: mobileNmr });

    if (!patient) {
      return res.status(400).json({ message: "Invalid mobile number or OTP" });
    }

    if (patient.otp !== otp || patient.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    patient.mobileNumber = patient.newMobileNumber;
    patient.newMobileNumber = undefined;
    patient.isVerified = true;
    patient.otp = undefined;
    patient.otpExpires = undefined;
    await patient.save();
    const token = patient.getJWTToken();
    res.status(200).json({
      success: true,
      token,
      message: "Mobile number updated and verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};
//getmyProfile
export const getmyProfile = async (req, res) => {
  try {
    const myData = await Patient.findById(req.patient?._id);
    if (myData) {
      return res.status(200).json({
        success: true,
        message: "feched!",
        myData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};

//
export const deletePatient = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Patient ID!",
      });
    }
    const getPatient = await Patient.findById(req.params.id);
    if (!getPatient) {
      return res.status(404).json({
        success: false,
        message: "patient not Found!",
      });
    }

    // Deleting Images From Cloudinary
    if (getPatient?.avatar?.public_id) {
      await cloudinary.v2.uploader.destroy(getPatient.avatar?.public_id);
    }

    //-------------------------//
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "patient Not Found" });
    }
    await patient.remove();
    res.status(200).json({
      success: true,
      message: "patient Deleted Successfully!!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong!",
    });
  }
};

export const UpdateProile = async (req, res) => {
  const {
    name,
    email,
    gender,
    weightValue,
    weightUnit,
    heightValue,
    heightUnit,
    age,
    commonHealthComplaints,
    familyHistory,
    personalHistory,
    dailyRoutine,
  } = req.body;
  // Validate email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  //gender Validate
  if (gender && !["Male", "Female"].includes(gender)) {
    return res
      .status(400)
      .json({ message: 'Invalid gender:gender Must be "Male" or "Female"' });
  }
  // Validate weightUnit
  if (weightUnit && !["Kgs", "Lbs"].includes(weightUnit)) {
    return res
      .status(400)
      .json({ message: 'Invalid weight unit. Must be "Kgs" or "Lbs"' });
  }
  // Ensure weightValue is a number
  if (weightValue && isNaN(weightValue)) {
    return res.status(400).json({ message: "Weight value must be a number" });
  }
  // Validate heightUnit
  if (heightUnit && !["Ft", "Cm"].includes(heightUnit)) {
    return res
      .status(400)
      .json({ message: 'Invalid height unit. Must be "Ft" or "Cm"' });
  }
  // Ensure heightValue is a number
  if (heightValue && isNaN(heightValue)) {
    return res.status(400).json({ message: "Height value must be a number" });
  }
  if (age && isNaN(age)) {
    return res.status(400).json({ message: "age must be a number" });
  }

  try {
    const patient = await Patient.findById(req.patient._id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found " });
    }
    if (!patient.isVerified) {
      return res.status(400).json({ message: "Patient not verified" });
    }
    if (email) {
      const emailExists = await Patient.findOne({ email });
      if (
        emailExists &&
        emailExists._id.toString() !== req.patient._id.toString()
      ) {
        return res.status(400).json({
          message: "This Email ID is already in use By Another patient",
        });
      }
    }

    const updateData = {
      weight: {
        value: weightValue,
        unit: weightUnit,
      },
      height: {
        value: heightValue,
        unit: heightUnit,
      },
      ...req.body,
    };
    let NewPatientDetail = await Patient.findByIdAndUpdate(
      req.patient._id,
      updateData,
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      patient: NewPatientDetail,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};
//change Patient password
export const ChangePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword) {
    return res.status(400).json({ message: "Please Enter Old password" });
  }
  if (!newPassword) {
    return res.status(400).json({ message: "Please Enter New Password " });
  }
  if (!confirmPassword) {
    return res.status(400).json({ message: "Please Enter Confirm Password" });
  }
  try {
    const patient = await Patient.findById(req.patient._id).select("+password");

    const isPasswordMatched = await patient.comparePassword(
      req.body.oldPassword
    );

    if (!isPasswordMatched) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm Password does not match" });
    }
    patient.password = req.body.newPassword;
    await patient.save();
    // const token = patient.getJWTToken();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });

    // sendToken(patient, 200, res);
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};

export const Otp = async (req, res) => {
  // const { name, mobileNumber } = req.body;
  try {
    // let patient = await Patient.findOne({ mobileNumber });

    // if (patient && patient.isVerified) {
    //   return res.status(400).json({ message: 'Patient already registered and verified for This Mobile No.' });
    // }

    //      const otp = crypto.randomInt(100000, 1000000).toString();

    //     // const otp ="123456";

    // const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // if (patient) {
    //   patient.otp = otp;
    //   patient.otpExpires = otpExpires;
    // } else {
    //   patient = new Patient({ name, mobileNumber, otp, otpExpires });
    // }

    // await patient.save();
    await sendOtp();

    // res.status(200).json({patient, message: `OTP  ${otp} sent to your  mobile number successfully` });
  } catch (error) {
    res.status(500).json({
      message: error.message ? error.message : "Server error!",
    });
  }
};
