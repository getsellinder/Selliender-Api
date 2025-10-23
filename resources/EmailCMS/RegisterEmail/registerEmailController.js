import { RegisterEmail } from "./registerEmailModal.js";

export const RegisterEmailSend = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    req.body.user = req.user._id;
    const registerEmailFindDoc = await RegisterEmail.find();
    if (registerEmailFindDoc.length === 0) {
      const registerEmaildata = await RegisterEmail.create({
        subject: req.body.subject,
        description: req.body.description,
        addedBy: req.user._id,
      });

      if (registerEmaildata) {
        return res.status(200).json({
          success: true,
          registerEmaildata,
          message: "Added successfully",
        });
      }
    } else {
      const updateEmailData = await RegisterEmail.updateOne({
        subject: req.body.subject,
        description: req.body.description,
        addedBy: req.user._id,
      });
      if (updateEmailData) {
        return res.status(200).json({
          success: true,
          RegisterEmaildata: updateEmailData,
          message: "updated successfully ",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const GetRegisterEamilData = async (req, res) => {
  try {
    // if (!req?.user) return res.status(400).json({ message: "please login !" });
    // console.log(req?.user)

    const registerEmaildata = await RegisterEmail.find();

    res.status(200).json({
      success: true,
      registerEmaildata,
      message: "Found successfully ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
