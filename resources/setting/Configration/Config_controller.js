import { Config } from "./Config_model.js";
import cloudinary, { deleteOldImage } from "../../../Utils/cloudinary.js";
import { uploadFile } from "../../../Utils/uploadeFile.js";

//Add app Name

export const addApplicationName = async (req, res) => {
  try {
    if (req.body === "") {
      return res.status(201).json({
        status: "false",
        message: "please enter application  Name",
      });
    }
    const { appName } = req.body;

    const applicationNam = await Config.find();
    if (applicationNam.length === 0) {
      const applicationName = await Config.create({
        appName,
      });

      if (applicationName) {
        return res.status(201).json({
          status: "success",
          message: "Added application Name Successfully",
        });
      }
    } else {
      const updateApp = await Config.updateOne({
        appName: appName,
      });

      if (updateApp) {
        return res.status(200).json({
          status: "success",
          message: "Updated Application Name Successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//add copyright msg
export const addCopyRightMessage = async (req, res) => {
  try {
    if (req.body === "") {
      return res.status(201).json({
        status: "false",
        message: "please enter CopyRight Message",
      });
    }
    const { copyright } = req.body;

    const application = await Config.find();
    if (application.length === 0) {
      const applicationName = await Config.create({
        copyrightMessage: copyright,
      });

      if (applicationName) {
        return res.status(201).json({
          status: "success",
          message: "Added copyright message Successfully",
        });
      }
    } else {
      const updateApp = await Config.updateOne({
        copyrightMessage: copyright,
      });

      if (updateApp) {
        return res.status(200).json({
          status: "success",
          message: "Updated copyright message Successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const addSocialMedia = async (req, res) => {
  const { facebook, twitter, instagram, linkedin, mail, youtube, pinterest } =
    req.body;

  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "failed",
        message: "Please Provide Social Links",
      });
    }

    const socialMediaLink = await Config.find();
    if (socialMediaLink.length === 0) {
      const createSocialLinks = await Config.create({
        socialMedia: {
          facebook,
          twitter,
          instagram,
          linkedin,
          youtube,
          mail,
          pinterest,
        },
      });

      if (createSocialLinks) {
        return res.status(201).json({
          status: "success",
          message: "Added Social Media Links Successfully",
        });
      }
    } else {
      const updateSocial = await Config.updateOne(
        {},
        {
          $set: {
            socialMedia: {
              facebook,
              twitter,
              instagram,
              linkedin,
              mail,
              youtube,
              pinterest,
            },
          },
        }
      );
      if (updateSocial) {
        return res.status(200).json({
          status: "success",
          message: "Updated Social Media Links Successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// add Address

const addAddress = async (req, res) => {
  const {
    company,
    address,
    city,
    state,
    country,
    pincode,
    website,
    contact,
    email,
    longitude,
    gstNumber,
  } = req.body;

  // if (
  //   !company ||
  //   !address ||
  //   !city ||
  //   !state ||
  //   !country ||
  //   !pincode ||
  //   !contact ||
  //   !email
  // ) {
  //   return res.status(400).json({
  //     status: "failed",
  //     message: "Please Provide All Fields",
  //   });
  // }
  try {
    const getAddress = await Config.find();
    if (getAddress.length === 0) {
      const createAddress = await Config.create({
        address: {
          company,
          address,
          city,
          state,
          country,
          pincode,
          website,
          contact,
          email,
          longitude,
          gstNumber,
        },
      });

      if (createAddress) {
        return res.status(201).json({
          status: "success",
          message: "created address successfully",
        });
      }
    } else {
      const updateAddress = await Config.updateOne(
        {},
        {
          $set: {
            address: {
              company,
              address,
              city,
              state,
              country,
              pincode,
              website,
              contact,
              email,
              longitude,
              gstNumber,
            },
          },
        }
      );

      if (updateAddress) {
        return res.status(200).json({
          status: "success",
          message: "Updated Address Successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// get configuration

const getConfig = async (req, res) => {
  try {
    const configration = await Config.find({});
    if (configration) {
      res.status(200).json({
        status: "success",
        result: configration,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// add logo

// const addLogo = async (req, res) => {
//   try {
//     const configuration = await Config.findOne();
//     let Headerlogo, Footerlogo, Adminlogo;

//     // ✅ HEADER LOGO
//     if (req.files?.Headerlogo) {
//       if (configuration?.logo?.Headerlogo?.public_id) {
//         await deleteOldImage(configuration.logo.Headerlogo.public_id);
//       }
//       const result = await cloudinary.v2.uploader.upload(
//         req.files.Headerlogo.tempFilePath,
//         { folder: "bolo/log" }
//       );
//       Headerlogo = { url: result.secure_url, public_id: result.public_id };
//     }

//     // ✅ FOOTER LOGO
//     if (req.files?.Footerlogo) {
//       if (configuration?.logo?.Footerlogo?.public_id) {
//         await deleteOldImage(configuration.logo.Footerlogo.public_id);
//       }
//       const result = await cloudinary.v2.uploader.upload(
//         req.files.Footerlogo.tempFilePath,
//         { folder: "bolo/log" }
//       );
//       Footerlogo = { url: result.secure_url, public_id: result.public_id };
//     }

//     // ✅ ADMIN LOGO
//     if (req.files?.Adminlogo) {
//       if (configuration?.logo?.Adminlogo?.public_id) {
//         await deleteOldImage(configuration.logo.Adminlogo.public_id);
//       }
//       const result = await cloudinary.v2.uploader.upload(
//         req.files.Adminlogo.tempFilePath,
//         { folder: "bolo/log" }
//       );
//       Adminlogo = { url: result.secure_url, public_id: result.public_id };
//     }

//     // ✅ If no config, create new one
//     if (!configuration) {
//       const createLogo = await Config.create({
//         logo: {
//           Headerlogo: Headerlogo || {},
//           Footerlogo: Footerlogo || {},
//           Adminlogo: Adminlogo || {},
//         },
//       });
//       return res.status(200).json({
//         status: "success",
//         message: "Created Logos Successfully",
//         logo: createLogo.logo,
//       });
//     }

//     // ✅ Otherwise, update existing
//     const updatedLogos = {
//       Headerlogo: Headerlogo || configuration.logo.Headerlogo,
//       Footerlogo: Footerlogo || configuration.logo.Footerlogo,
//       Adminlogo: Adminlogo || configuration.logo.Adminlogo,
//     };

//     await Config.updateOne({}, { $set: { logo: updatedLogos } });

//     return res.status(200).json({
//       status: "success",
//       message: "Updated Logos Successfully",
//       logo: updatedLogos,
//     });
//   } catch (error) {
//     console.error("Error in addLogo:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Something went wrong while uploading logos",
//       error: error.message,
//     });
//   }
// };

const addLogo = async (req, res) => {
  try {
    const configuration = await Config.findOne();
    let Headerlogo, Footerlogo, Adminlogo;
    const oldLogos = configuration?.logo?.[0];

    if (req.files?.Headerlogo && oldLogos?.Headerlogo?.public_id) {
      await deleteOldImage(oldLogos.Headerlogo.public_id);
    }

    if (req.files?.Footerlogo && oldLogos?.Footerlogo?.public_id) {
      await deleteOldImage(oldLogos.Footerlogo.public_id);
    }

    if (req.files?.Adminlogo && oldLogos?.Adminlogo?.public_id) {
      await deleteOldImage(oldLogos.Adminlogo.public_id);
    }
    // console.log("Footerlogo", configuration.logo.Footerlogo.public_id);
    // console.log("Adminlogo", configuration.logo.Adminlogo.public_id);

    // ✅ HEADER LOGO
    if (req.files?.Headerlogo) {
      if (configuration?.logo?.Headerlogo?.public_id) {
        await deleteOldImage(configuration.logo.Headerlogo.public_id);
      }
      const result = await cloudinary.v2.uploader.upload(
        req.files.Headerlogo.tempFilePath,
        { folder: "bolo/log" }
      );
      Headerlogo = { url: result.secure_url, public_id: result.public_id };
    }

    // ✅ FOOTER LOGO
    if (req.files?.Footerlogo) {
      if (configuration?.logo?.Footerlogo?.public_id) {
        await deleteOldImage(configuration.logo.Footerlogo.public_id);
      }
      const result = await cloudinary.v2.uploader.upload(
        req.files.Footerlogo.tempFilePath,
        { folder: "bolo/log" }
      );
      Footerlogo = { url: result.secure_url, public_id: result.public_id };
    }

    // ✅ ADMIN LOGO
    if (req.files?.Adminlogo) {
      if (configuration?.logo?.Adminlogo?.public_id) {
        await deleteOldImage(configuration.logo.Adminlogo.public_id);
      }
      const result = await cloudinary.v2.uploader.upload(
        req.files.Adminlogo.tempFilePath,
        { folder: "bolo/log" }
      );
      Adminlogo = { url: result.secure_url, public_id: result.public_id };
    }

    // ✅ If no config, create new one
    if (!configuration) {
      const createLogo = await Config.create({
        logo: {
          Headerlogo: Headerlogo || {},
          Footerlogo: Footerlogo || {},
          Adminlogo: Adminlogo || {},
        },
      });
      return res.status(200).json({
        status: "success",
        message: "Created Logos Successfully",
        logo: createLogo.logo,
      });
    }

    // ✅ Otherwise, update existing
    const updatedLogos = {
      Headerlogo: Headerlogo || configuration.logo.Headerlogo,
      Footerlogo: Footerlogo || configuration.logo.Footerlogo,
      Adminlogo: Adminlogo || configuration.logo.Adminlogo,
    };

    await Config.updateOne({}, { $set: { logo: updatedLogos } });

    return res.status(200).json({
      status: "success",
      message: "Updated Logos Successfully",
      logo: updatedLogos,
    });
  } catch (error) {
    console.error("Error in addLogo:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong while uploading logos",
      error: error.message,
    });
  }
};

//terms of use
const addTermsOfUse = async (req, res) => {
  try {
    const config = await Config.find();
    if (config.length === 0) {
      const createScrollText = await Config.create(req.body);
      if (createScrollText) {
        return res.status(201).json({
          status: "success",
          message: "Added Terms of Use Successfully",
        });
      }
    } else {
      const updateScroll = await Config.updateOne(
        {},
        {
          $set: {
            terms_of_use: req.body?.terms_of_use,
          },
        }
      );
      if (updateScroll) {
        return res.status(200).json({
          status: "success",
          message: "Updated Terms of Use Successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getTermsOfUse = async (req, res) => {
  try {
    let configration = await Config.findOne({});
    if (!configration) configration = await Config.create({});
    res
      .status(200)
      .json({ status: "success", data: configration?.terms_of_use || "" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const deleteConfig = async (req, res) => {
  const deleteConfig = await Config.deleteMany({});

  console.log(deleteConfig);
};

export {
  // addGST,
  addSocialMedia,
  addAddress,
  getConfig,
  addLogo,
  deleteConfig,
  // addScrollText,
  addTermsOfUse,
  getTermsOfUse,
};
