import dotenv from "dotenv";
dotenv.config()
import express from "express";

import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload"; // important pkg for file upload
import cors from "cors";

import cookieParser from "cookie-parser";
import { googleSigninAndLogin } from "./resources/user/userController.js";
import CustomerRoute from "./resources/customers/Customer.Route.js";
import ReferalRoute from "./resources/Referal/Referal.Route.js";
import BillingRoute from "./resources/Billing/Billing.Route.js"

import MessageRouter from "./resources/message/Message.Route.js";
import PackageRoute from "./resources/Plans/Package.Route.js";
import LinkedinRoute from "./resources/linkedin/Linkedin.Route.js";

// Design Route
import designRoute from "./resources/Design/designRouter.js";
const app = express();
app.use((req, res, next) => {
  if (req.originalUrl === "/api/order/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//handdle cores
// app.use(cors());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
//
app.use(cookieParser());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/design", designRoute);
app.get("/", (req, res) => {
  res.send({msg:"Server is running.."});
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the path to the public folder where static files are located
const publicPath = join(__dirname, "public");

// Serve static files from the 'public' directory
app.use(express.static(publicPath));
// app.use(
//   fileUpload({
//     useTempFiles: true,
//   })
// );

// const { STRIPE_SECRET_KEY, WEBHOOK_SECRET_KEY } = process.env;
// import { Stripe } from "stripe";
// const stripe = new Stripe(STRIPE_SECRET_KEY, {
//   apiVersion: "2020-08-27",
// });
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (request, response) => {
//     const sig = request.headers["stripe-signature"];

//     const signatureParts = sig.split(",");

//     // Initialize variables to store extracted values
//     let t, v1, v0;

//     // Iterate over signature parts
//     signatureParts.forEach((part) => {
//       // Split each part by "=" to separate key and value
//       const [key, value] = part.split("=");

//       // Assign value to the corresponding variable based on the key
//       if (key === "t") {
//         t = value;
//       } else if (key === "v1") {
//         v1 = value;
//       } else if (key === "v0") {
//         v0 = value;
//       }
//     });

//     // Log the extracted values
//     // console.log("t:", t);
//     // console.log("v1:", v1);
//     // console.log("v0:", v0);

//     let event;
//     // console.log("sig", sig);
//     // console.log(typeof request.body);
//     // console.log("request.body", request.body);
//     // const concatenatedString = t + "." + JSON.stringify(request.body);
//     const requestBodyString = JSON.stringify(request.body);
//     const concatenatedString = `${t}.${requestBodyString}`;
//     console.log("concatenatedString", concatenatedString);

//     try {
//       event = stripe.webhooks.constructEvent(
//         concatenatedString,
//         sig,
//         "whsec_dc9b9084fc764c806c8c5c06dd91de1ee809e9c8deab6d56e8e3ef2fc9c30c67"
//       );
//       console.log(
//         "+++++++++++++++event-----------------++=",
//         event,
//         "=================="
//       );
//     } catch (err) {
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         console.log("event.data.object", event.data.object);
//         const paymentIntentSucceeded = event.data.object;
//         // Then define and call a function to handle the event payment_intent.succeeded
//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   }
// );

//auth
import user from "./resources/user/userRoute.js";
// Product
import ProductRouter from "./resources/Products/ProductRoute.js";
// Chapter xx
import ChapterRouter from "./resources/Chapter/ChapterRoute.js";

//Businesses
// import BusinessRoute from "./resources/Businesses/BusinessRoute.js";

import orderRoute from "./resources/Orders/orderRoute.js";
import DepartureRouter from "./resources/Departure/DepartureRoute.js";
import InformationRoute from "./resources/Informations/InformationRoute.js";
import Testimonial from "./resources/Testimonials/TestimonialRoute.js";
import ContactRequest from "./resources/ContactRequests/ContactRequestRoute.js";

import StateRouter from "./resources/setting/state/state_routes.js";
//
import LanguageRoute from "./resources/setting/Language/language_routes.js";
//purpose
import PurposeRoute from "./resources/setting/Purpose/Purpose_routes.js";

// category Route
import categoryRoute from "./resources/Category/categoryRoutes.js";

import libraryRoute from "./resources/MyLibrary/MylibraryRoute.js";

import CollectionRoute from "./resources/Collections/CollectionRoute.js";
import ColorRoute from "./resources/color/colorRoutes.js";
import bannerRoute from "./resources/Banner/BannerRouter.js";
import RegistrationImageRoute from "./resources/RegistrationImage/RegistrationImageRoute.js";
import loginImageRoute from "./resources/LoginImage/LoginImageRoute.js";
import shopImageRoute from "./resources/ShopPageImage/ShopPageImageRoute.js";
import ContentRoute from "./resources/Content/ContentRoutes.js";
import UserAddressRoute from "./resources/userAddress/useAddressRoute.js";
import CurrencyRoute from "./resources/Currency/CurrencyRoute.js";
//business_Type
// import Business_TypeRoute from "./resources/setting/Business_Type/Business_routes.js";

import ConfigRouter from "./resources/setting/Configration/Config_routes.js";

import TaxRouter from "./resources/Tax/tax_routes.js";
//specialties
import SpecialtiesRouter from "./resources/Specialties/SpecialtiesRoute.js";
import ShippingAddressRoute from "./resources/ShippingAddresses/ShippingAddressRoute.js";
import stripeRoute from "./resources/StripePayment/stripeRoute.js";

import SeoRoute from "./resources/SEO&Analytics/SEORouter.js";

//Affiliate Routes
import AffiliateRoute from "./resources/Affiliate&Coupon/Affiliate/AffiliateRoute.js";
//Blog Routes
import BlogRoute from "./resources/Blog/BlogRoute.js";
// Panel Routes
import PanelRoute from "./resources/Panels/PanelRoutes.js";
//Coupon Routes
import CouponRoute from "./resources/Affiliate&Coupon/Coupon/CouponRoute.js";
//short urls
// import ShortUrlRouter from "./resources/Businesses/Short_Urls/ShortUrlRoute.js";
//support Ticket
import SupportRouter from "./resources/Supports/supportRoute.js";

import ReviewRoute from "./resources/ReviewStatus/reviewStatusRoutes.js";
import ReportsRoute from "./resources/report/reportsRouter.js";
import AuthRouter from "./resources/authentication/AuthenticationRoute.js";
import DISCProfileRoute from "./resources/DISCProfile/DISCProfileRoute.js";

// app.use(express.json({ limit: "50mb" }));

//handdle cores
// app.use(cors());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true, // saves uploaded files temporarily
    tempFileDir: "/tmp/", // optional temp folder
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
//

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/design", designRoute);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Define the path to the public folder where static files are located
// const publicPath = join(__dirname, "public");

// Serve static files from the 'public' directory
app.use(express.static(publicPath));

app.use((req, res, next) => {
  if (req.originalUrl === "/api/order/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Point of Sale router
app.use("/api/v1/", user);

app.use("/api/customer/", CustomerRoute);
//Product
app.use("/api", ProductRouter);
// Chapter
app.use("/api", ChapterRouter);
// Authentication rounter
app.use("/auth", AuthRouter);
app.use("/api/disc", DISCProfileRoute);

//businesses
// app.use("/api/businesses", BusinessRoute);
// Design

// Category
app.use("/api/category", categoryRoute);
// package

app.use("/api/package", PackageRoute);
app.use("/api/linked", LinkedinRoute);

app.use("/api/collection", CollectionRoute);
app.use("/api/color", ColorRoute);
app.use("/api/banner", bannerRoute);
// registration image
app.use("/api/registerImage", RegistrationImageRoute);
app.use("/api/loginImage", loginImageRoute);
app.use("/api/shopImage", shopImageRoute);
// Content
app.use("/api/content", ContentRoute);
// User Address
app.use("/api/user-address", UserAddressRoute);
app.use("/api/shipping/address", ShippingAddressRoute);
//Patient Routes
// app.use("/api/patient", PatientRoute);

//Patient Routes
// app.use("/api/patient/test", TestRoute);
//Order
app.use("/api/order", orderRoute);
//Departure
app.use("/api/departure/", DepartureRouter);
//Information
app.use("/api/information/", InformationRoute);
//Contact Requests
app.use("/api/contact/request/", ContactRequest);
//Complaints
app.use("/api/testimonial/", Testimonial);
//state
app.use("/api/state", StateRouter);
//language
app.use("/api/language", LanguageRoute);
//Purpose
app.use("/api/purpose", PurposeRoute);
app.use("/api/business", orderRoute);
// app.use("/auth", GoogleRounte);
//Tax
app.use("/api/tax", TaxRouter);
//Currency Route
app.use("/api/currency", CurrencyRoute);
//config
app.use("/api/config", ConfigRouter);

app.use("/api/stripe", stripeRoute);

app.use("/api/seo", SeoRoute);

//Affiliates
app.use("/api/v1/affiliate", AffiliateRoute);

//Coupons
app.use("/api/v1/coupon", CouponRoute);
//Blog
app.use("/api/v1/blog", BlogRoute);
// panels
app.use("/api/panel", PanelRoute);

app.use("/api/v1/reviews", ReviewRoute);

// library;
app.use("/", libraryRoute);

//config specialty
// app.use("/api/config/specialty", SpecialtiesRouter);
//specialties
// app.use("/api/specialist", SpecialistRouter);
//appointments
// app.use("/api/appointment", AppointmentRouter);
//short urls
// app.use("/api/shorturl", ShortUrlRouter);
//Support

// Email CMS
// app.use("/api", RegisterEmail);
app.use("/api", SupportRouter);
app.use("/api", MessageRouter);
app.use("/api/reports", ReportsRoute);
app.use("/api/referral", ReferalRoute)
app.use("/api/billing", BillingRoute)

export default app;
