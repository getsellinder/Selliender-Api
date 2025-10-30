import nodeMailer from "nodemailer";
import { createTransport } from "nodemailer";
import brevo from '@getbrevo/brevo';

let apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BRAVO_APIKEY)
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
export const sendBrevoEmail = async ({ to, subject, html, fromEmail, fromName }) => {
  try {

    const sendSmtpEmail = {
      sender: {
        email: fromEmail || "support@sellinder.com",
        name: fromName || "Sellinder"
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    }
    const respone = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log("✅ Email sent successfully to", to);
    return respone
  } catch (error) {
    console.error("❌ Error sending Brevo email:", error);
    throw error
  }

}
export default sendEmail;

// import sgMail from '@sendgrid/mail';
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// // console.log(process.env.SENDGRID_API_KEY)
// const sendEmail = async (options) => {
//     sgMail.send(options)

// }
// export default sendEmail

// from message bird  SMS send------------------------------------
// import { initClient } from "messagebird";
// const messagebird = initClient("p2YaqxU9uYx2F3d3dV8ywAFtk");

// export const sendOtp = async (recipient, message) => {
//   if (!recipient || !message) {
//     return;
//   }
//   const params = {
//     originator: "+447418314922",
//     recipients: [recipient],
//     body: message,
//   };


//   messagebird.messages.create(params, (err, response) => {
//     if (err) {
//       console.error("Error sending message-------:", err);
//       return;
//     }
//     // console.log("Message sent successfully:", response);
//     // console.log("Message details:", response, response?.recipients?.items);
//   });
// };



