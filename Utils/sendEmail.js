import nodeMailer from "nodemailer";
import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: process.env.SMPT_HOST,
  port: process.env.SMPT_PORT,
  // service: process.env.SMPT_SERVICE,
  auth: {
    user: process.env.SMPT_MAIL,
    pass: process.env.SMPT_PASSWORD,
  },
});

const sendEmail = async (options) => {
  await transporter.sendMail(options, function (error, info) {
    if (error) {
      console.log(error);
    }

  });
};
export default sendEmail;

// import sgMail from '@sendgrid/mail';
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// // console.log(process.env.SENDGRID_API_KEY)
// const sendEmail = async (options) => {
//     sgMail.send(options)

// }
// export default sendEmail

// from message bird  SMS send------------------------------------
import { initClient } from "messagebird";
const messagebird = initClient("p2YaqxU9uYx2F3d3dV8ywAFtk");

export const sendOtp = async (recipient, message) => {
  if (!recipient || !message) {
    return;
  }
  const params = {
    originator: "+447418314922",
    recipients: [recipient],
    body: message,
  };


  messagebird.messages.create(params, (err, response) => {
    if (err) {
      console.error("Error sending message-------:", err);
      return;
    }
    // console.log("Message sent successfully:", response);
    // console.log("Message details:", response, response?.recipients?.items);
  });
};



