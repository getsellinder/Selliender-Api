// app.post("/checkout-session", handlePayment);
import bodyParser from "body-parser";
const { STRIPE_SECRET_KEY, WEBHOOK_SECRET_KEY } = process.env;
import crypto from "crypto";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const stripe = require("stripe")("Your Secret Key");
import { Order } from "./orderModel.js";
import Razorpay from "razorpay";

import { shippingAddress } from "../ShippingAddresses/ShippingAddressModel.js";
import sendEmail from "../../Utils/sendEmail.js";
import axios from "axios";
import { AffiliateModel } from "../Affiliate&Coupon/Affiliate/AffiliateModel.js";
// const endpointSecret = STRIPE_SECRET_KEY;
//generate unique order id
export const generateUniqueOrderId = async () => {
  const currentYear = new Date().getFullYear();
  let serialNumber = 1;

  try {
    // Attempt to find the latest order for the current year
    const latestOrder = await Order.findOne(
      { orderID: { $regex: `^${currentYear}` } }, // Find orders from the current year
      {},
      { sort: { orderID: -1 } } // Sort in descending order to get the most recent
    );

    if (latestOrder) {
      const lastYear = parseInt(latestOrder.orderID.substring(0, 4), 10);
      if (lastYear === currentYear) {
        // If the latest order is from the current year, increment the serial number
        serialNumber = parseInt(latestOrder.orderID.substring(4), 10) + 1;
      }
    }

    // Pad the serial number with leading zeros (8 digits) and concatenate with the current year
    const paddedSerialNumber = serialNumber.toString().padStart(8, "0");
    const newOrderId = `${currentYear}${paddedSerialNumber}`;

    // Ensure that the orderID is unique by checking if it already exists
    const existingOrder = await Order.findOne({ orderID: newOrderId });
    if (existingOrder) {
      // If the order ID exists, recursively generate a new unique ID
      return generateUniqueOrderId();
    }

    return newOrderId;
  } catch (error) {
    console.error("Error generating order ID:", error);
    throw new Error("Failed to generate unique order ID");
  }
};

//validate Discount  coupon-----------------------------------
const usedCoupon = async (orderId, coupon_code, userId) => {
  try {
    if (!orderId || !coupon_code || !userId) {
      return { success: false, message: "Error in getting OrderId or Coupon" };
    }

    // Validating Coupon
    const couponData = await AffiliateModel.findOne({
      coupon_code: coupon_code,
    });
    if (!couponData) {
      // Check if the coupon exists
      return { success: false, message: "Coupon not found" };
    }

    // Check if orderId is unique
    const isOrderIdUnique = await AffiliateModel.find(
      {},
      { coupon_used_history: 1 }
    );
    let orderIdFound = false;
    console.log("isOrderIdUnique", isOrderIdUnique);
    isOrderIdUnique.forEach((data) => {
      data.coupon_used_history.forEach((subItem) => {
        if (subItem.orderId == orderId) {
          orderIdFound = true;
        }
      });
    });

    if (orderIdFound) {
      return { success: false, message: "Error: OrderId already used" };
    }

    const {
      valid_till,
      is_coupon_active,
      is_affiliate_active,
      affiliate_discount_amount,
      _id,
    } = couponData;

    if (!is_coupon_active || !is_affiliate_active) {
      return { success: false, message: "Coupon Code Expired" };
    }

    const currentDate = new Date();
    const expirationDate = new Date(valid_till);

    if (currentDate > expirationDate) {
      return { success: false, message: "Coupon has expired" };
    }

    let fdata = await AffiliateModel.findByIdAndUpdate(
      _id,
      {
        $inc: { total_earning: affiliate_discount_amount, coupon_claimed: 1 },
        $push: {
          coupon_used_history: {
            orderId: orderId,
            userId: userId,
            date: currentDate,
            couponCode: coupon_code,
          },
        },
      },
      { new: true }
    );
    // console.log("fdata", fdata);
    return {
      success: true,
      message: "Coupon add success",
      AffiliateCouponID: fdata?._id,
      affiliate_discount_amount,
    };
  } catch (error) {
    console.error("Error processing webhook:", error);
    return { success: false, message: "Internal server error" };
  }
};

// export const handlePayment = async (req, res) => {
//   try {
//     const { email } = req.user;
//     if (!email)
//       return res.status(400).send({ message: "Please enter the email" });
//     const { address, cart, subtotal, couponCode } = req.body;
//     // console.log(address, cart, subtotal, couponCode)

//     if (cart.length < 1)
//       return res.status(400).json({ message: "cart is empty!" });
//     switch (true) {
//       //validation
//       case !address: {
//         return res
//           .status(404)
//           .json({ message: "please Select shipping address" });
//       }
//       case !subtotal: {
//         return res
//           .status(404)
//           .json({ message: "please provide product subtotal" });
//       }
//     }
//     let addss = await shippingAddress.findById(address);

//     let shipping = {
//       first_Name: addss.first_Name,
//       last_Name: addss.last_Name,
//       phone_Number: addss.phone_Number,
//       street: addss.street,
//       city: addss.city,
//       state: addss.state,
//       postalCode: addss?.postalCode,
//       country: addss.country,
//       addressId: address,
//     };
//     let selectedCurrency = "gbp"; // Default currency
//     let currencySymbol = "£"; // Default symbol

//     try {
//       const response = await axios.get(
//         `${process.env.Backend_URL}/api/currency/getall`
//       );

//       if (response.status === 200) {
//         // Access the currency symbol safely
//         const symbol = response.data.currency[0]?.CurrencySymbol;

//         // Set currency based on the symbol
//         switch (symbol) {
//           case "$":
//             selectedCurrency = "usd";
//             currencySymbol = "$";
//             break;
//           case "£":
//             selectedCurrency = "gbp";
//             currencySymbol = "£";
//             break;
//           case "€":
//             selectedCurrency = "eur";
//             currencySymbol = "€";
//             break;
//           case "₹":
//             selectedCurrency = "inr";
//             currencySymbol = "₹";
//             break;
//           default:
//             // console.warn("Unsupported currency symbol received:", symbol);
//             selectedCurrency = "gbp"; // Fallback currency
//             currencySymbol = "£"; // Fallback symbol
//         }
//       } else {
//         console.error("Failed to fetch currency data:", response.status);
//       }
//     } catch (error) {
//       console.error("Error during API call for currency data:", error);
//     }

//     // Create order items

//     const orderItems = await cart.map((item) => ({
//       product: item._id,
//       name: item.name,
//       variant_Name: item?.variant?.variant_Name
//         ? item?.variant?.variant_Name
//         : "",
//       price: Number(item?.variant?.price ? item?.variant?.price : item?.price),
//       total_price:
//         item.quantity *
//         Number(item?.variant?.price ? item?.variant?.price : item?.price),

//       image: item?.image,
//       quantity: item?.quantity,
//       // gst_amount: Number(
//       //   (Number(
//       //     item?.variant?.price
//       //       ? item?.variant?.price
//       //       : item?.product?.master_price
//       //   ) *
//       //     Number(
//       //       item?.variant?.gst_Id?.tax
//       //         ? item?.variant?.gst_Id?.tax
//       //         : item?.product?.master_GST?.tax
//       //     )) /
//       //   100
//       // )?.toFixed(2),
//       // total_gst_amount: Number(
//       //   Number(item?.quantity) *
//       //   Number(
//       //     (Number(
//       //       item?.variant?.price
//       //         ? item?.variant?.price
//       //         : item?.product?.master_price
//       //     ) *
//       //       Number(
//       //         item?.variant?.gst_Id?.tax
//       //           ? item?.variant?.gst_Id?.tax
//       //           : item?.product?.master_GST?.tax
//       //       )) /
//       //     100
//       //   )
//       // )?.toFixed(2),
//       // gst_rate: item?.variant?.gst_Id?.tax
//       //   ? item?.variant?.gst_Id?.tax
//       //   : item?.product?.master_GST?.tax,
//       // gst_Name: item?.variant?.gst_Id?.name
//       //   ? item?.variant?.gst_Id?.name
//       //   : item?.product?.master_GST?.name,

//       // product_Subtotal: Number(
//       //   Number(
//       //     item.quantity *
//       //     Number(
//       //       item?.variant?.price
//       //         ? item?.variant?.price
//       //         : item?.price
//       //     )
//       //   ) +
//       //   Number(
//       //     Number(item.quantity) *
//       //     Number(
//       //       (Number(
//       //         item?.variant?.price
//       //           ? item?.variant?.price
//       //           : item?.price
//       //       ) *
//       //         Number(
//       //           item?.variant?.gst_Id?.tax
//       //             ? item?.variant?.gst_Id?.tax
//       //             : item?.product?.master_GST?.tax
//       //         )) /
//       //       100
//       //     )
//       //   )
//       // )?.toFixed(2),
//     }));

//     const Id = await generateUniqueOrderId();
//     // Create the order
//     const order = await Order.create({
//       orderID: Id,
//       total_amount: Number(subtotal).toFixed(2),
//       orderItems,
//       currency: currencySymbol,
//       shippingInfo: shipping,
//       user: req.user._id,
//     });
//     // console.log("order", order)
//     ///coupon functinality add

//     let discountAmount = 0;

//     if (couponCode) {
//       const couponResponse = await usedCoupon(
//         order?.orderID,
//         couponCode,
//         order?.user
//       );
//       if (couponResponse?.success === true) {
//         const saveData = await Order.findByIdAndUpdate(
//           { _id: order?._id },
//           {
//             isCouponUsed: true,
//             couponUsed: couponResponse?.AffiliateCouponID,
//           },
//           { new: true }
//         );
//         discountAmount += Number(couponResponse?.affiliate_discount_amount);
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: couponResponse?.message
//             ? couponResponse?.message
//             : "Something Wrong With Discount Coupon",
//         });
//       }
//     }
//     // const final = Number(subtotal).toFixed(2) + discountAmount
//     // const lineItems = await cart.map((item) => ({
//     //   price_data: {
//     //     currency: selectedCurrency,
//     //     // currency: "gbp",
//     //     product_data: {
//     //       name: item.product.name,

//     //       images: [item.product.image[0]?.url],
//     //     },

//     //     unit_amount: Math.round(((item.subtotal / item.quantity) * 100)),
//     //   },
//     //   quantity: Number(item.quantity),
//     // }));
//     const lineItems = [
//       {
//         price_data: {
//           currency: selectedCurrency,
//           product_data: {
//             name: "Total Amount",
//           },
//           unit_amount: Math.round(Number(subtotal).toFixed(2) * 100), // Ensure integer amount
//         },
//         quantity: 1,
//       },
//     ];

//     console.log(order);

//     if (order) {
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         line_items: lineItems,
//         mode: "payment",
//         customer_email: `${email}`,
//         metadata: {
//           orderId: order._id.toString(),

//           // Add any other key-value pairs as needed
//         },

//         shipping_address_collection: {
//           allowed_countries: ["GB", "US", "CA", "AU", "FR", "DE", "IN", "JP"],
//           // Allow only India for INR transactions
//         },
//         billing_address_collection: "required",
//         // success_url: `${process.env.FRONTEND_URL}`, // Provide your success URL here
//         // cancel_url: `${process.env.FRONTEND_URL}`,
//         success_url: `${process.env.FRONTEND_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`, // Redirect here on success
//         cancel_url: `${process.env.FRONTEND_URL}/order/failed`,

//         // discounts: [{ coupon: "PPPP1234" }]// Add your coupon ID here
//       });
//       res
//         .status(200)
//         .send({ message: "order created", url: session.url, id: session.id });
//     }
//   } catch (error) {
//     console.log(err);
//     res.status(500).send({
//       message: error.message ? error.message : "Something went Wrong",
//     });
//   }
// };

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const handlePayment = async (req, res) => {
  try {
    const { email } = req.user;
    if (!email)
      return res.status(400).send({ message: "Please enter the email" });

    const { address, cart, subtotal, tax_amount, couponCode } = req.body;
    // console.log(req.body);

    if (cart.length < 1)
      return res.status(400).json({ message: "cart is empty!" });
    switch (true) {
      //validation
      case !address: {
        return res
          .status(404)
          .json({ message: "please Select shipping address" });
      }
      case !subtotal: {
        return res
          .status(404)
          .json({ message: "please provide product subtotal" });
      }
    }
    let addss = await shippingAddress.findById(address);

    let shipping = {
      first_Name: addss.first_Name,
      last_Name: addss.last_Name,
      phone_Number: addss.phone_Number,
      street: addss.street,
      city: addss.city,
      state: addss.state,
      postalCode: addss?.postalCode,
      country: addss.country,
      addressId: address,
    };
    let selectedCurrency = "INR"; // Default currency
    let currencySymbol = "₹"; // Default symbol

    try {
      const response = await axios.get(
        `${process.env.Backend_URL}/api/currency/getall`
      );

      if (response.status === 200) {
        // Access the currency symbol safely
        const symbol = response.data.currency[0]?.CurrencySymbol;

        // Set currency based on the symbol
        switch (symbol) {
          case "$":
            selectedCurrency = "USD";
            currencySymbol = "$";
            break;
          case "£":
            selectedCurrency = "GBP";
            currencySymbol = "£";
            break;
          case "€":
            selectedCurrency = "EUR";
            currencySymbol = "€";
            break;
          case "₹":
            selectedCurrency = "INR";
            currencySymbol = "₹";
            break;
          default:
            // console.warn("Unsupported currency symbol received:", symbol);
            selectedCurrency = "INR";
            currencySymbol = "₹";
        }
      } else {
        console.error("Failed to fetch currency data:", response.status);
      }
    } catch (error) {
      console.error("Error during API call for currency data:", error);
    }

    // Create order items

    const orderItems = cart.map((item) => ({
      product: item.id,
      name: item.name,
      variant_Name: item?.variant?.variant_Name
        ? item?.variant?.variant_Name
        : "",
      price: Number(item?.variant?.price ? item?.variant?.price : item?.price),
      gst_amount: Number(item?.vat_Amount) || "",
      gst_rate: Number(item?.vat_Rate) || "",
      gst_Name: item?.vat_Name || "",
      product_Subtotal: Number(item.price + item.vat_Amount),
      total_price:
        item?.quantity *
        (Number(item?.variant?.price || item?.price) +
          Number(item?.vat_Amount || 0)),
      image: item?.image,
      quantity: item?.quantity,
    }));

    const Id = await generateUniqueOrderId();
    // console.log("Id", Id);

    // Create the order
    const order = await Order.create({
      orderID: Id,
      gst_amount: Number(tax_amount).toFixed(2),
      total_amount: Number(subtotal).toFixed(2),
      orderItems,
      currency: currencySymbol,
      shippingInfo: shipping,
      user: req.user._id,
    });

    // console.log("order", order);

    //coupon functinality add
    let discountAmount = 0;

    if (couponCode) {
      const couponResponse = await usedCoupon(
        order?.orderID,
        couponCode,
        order?.user
      );

      console.log(couponResponse);

      if (couponResponse?.success === true) {
        const saveData = await Order.findByIdAndUpdate(
          { _id: order?._id },
          {
            isCouponUsed: true,
            couponUsed: couponResponse?.AffiliateCouponID,
          },
          { new: true }
        );
        discountAmount += Number(couponResponse?.affiliate_discount_amount);
      } else {
        return res.status(400).json({
          success: false,
          message: couponResponse?.message
            ? couponResponse?.message
            : "Something Wrong With Discount Coupon",
        });
      }
    }

    const amountInPaise = Math.round(Number(subtotal).toFixed(2) * 100);

    // Razorpay Order Creation
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise, // Amount in paise
      currency: selectedCurrency,
      receipt: order.orderID.toString(),
      notes: {
        orderId: order._id.toString(),
        email,
      },
    });

    if (!razorpayOrder) {
      return res.status(500).json({
        message: "Failed to create Razorpay order",
      });
    }

    // Sending the Razorpay order details to frontend
    const razorpayOrderDetails = {
      orderId: razorpayOrder.id,
      currency: selectedCurrency,
      amount: amountInPaise,
      email,
      shippingAddress: shipping,
    };

    res.status(200).send({
      message: "order created",
      razorpayOrderDetails,
      orderID: order._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// export const webhook = async (req, res) => {
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//   const signature = req.headers["stripe-signature"];
//   let event;
//   if (webhookSecret) {
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         signature,
//         webhookSecret
//       );
//     } catch (err) {
//       console.log(`❌ Error message: ${err.message}`);
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }
//   }
//   // console.log(url)
//   let url;
//   if (event.type === "charge.succeeded") {
//     // console.log(event.data.object.receipt_url)
//     url = event.data.object.receipt_url;
//   }
//   if (event.type === "checkout.session.completed") {
//     const findOrder = await Order.findById(event.data.object.metadata?.orderId)
//       .populate({
//         path: "user",
//         select: "name email -_id",
//       })
//       .populate({
//         path: "couponUsed",
//         select: "coupon_code discount_amount -_id", // Only select coupon_code and discount_amount from the couponUsed model
//       });
//     findOrder.paypal_payer_id = event.data.object.id;
//     // console.log(findOrder)

//     (findOrder.stripe_Payment_session_Id = event.data.object.id),
//       (findOrder.stripe_payment_intent = event.data.object?.payment_intent),
//       (findOrder.paidAt = new Date(event.data.object.created * 1000));
//     findOrder.stripe_Payment_receipt_url = url ? url : "";

//     findOrder.isPaid = true;
//     if (event.data.object?.payment_status === "paid") {
//       findOrder.payment_status = "success";
//     } else {
//       findOrder.payment_status = "failed";
//     }
//     findOrder.orderStatus = "new";
//     await findOrder.save();

//     // Construct the HTML for the email

//     // console.log('findOrder', findOrder)
//     const itemRows = findOrder?.orderItems
//       .map(
//         (item) =>
//           `<tr><td>${item?.name}</td><td>${item?.quantity}</td><td>₹${item?.price}</td></tr>`
//       )
//       .join("");
//     // <h4 style="color: #333; font-family: Arial, sans-serif;"> Any Discount : ${findOrder?.isCouponUsed
//     //   ? "Yes  ,₹" +
//     //   Number(findOrder?.couponUsed?.discount_amount) +
//     //   " ,  COUPON_CODE:" +
//     //   findOrder?.couponUsed?.coupon_code
//     //   : "No Discount"
//     // }</h4>
//     // console.log('findOrder?.couponUsed?', findOrder?.couponUsed)
//     const htmlContent = `
//     <h1 style="color: #333; text-align: center; font-family: Arial, sans-serif;">Welcome to Tavisa - Let the Shopping Begin!</h1>
//        <strong style="color: #1b03a3; font-size: 16px"> Hi ${
//          findOrder?.shippingInfo?.first_Name
//        },</strong>

//         <p style="color: #555; font-size: 15px;">Great news! Your order #${
//           findOrder?.orderID
//         } has been confirmed. Here are the details</p>
//  <h4 style="color: #333; font-family: Arial, sans-serif;">Shipping Address : ${
//    findOrder?.shippingInfo?.first_Name
//  }  ${findOrder?.shippingInfo?.last_Name} , ${
//       findOrder?.shippingInfo?.street
//     } ${findOrder?.shippingInfo?.city} ${findOrder?.shippingInfo?.state} ${
//       findOrder?.shippingInfo?.country
//     }, PIN-${findOrder?.shippingInfo?.postalCode}, Phone Number: ${
//       findOrder?.shippingInfo?.phone_Number
//     }
//        ${
//          findOrder?.shippingInfo?.company_name
//            ? ",Company Name :" + findOrder?.shippingInfo?.company_name + ""
//            : ""
//        } ${
//       findOrder?.shippingInfo?.gst_number
//         ? ", VAT_NO:" + findOrder?.shippingInfo?.gst_number
//         : ""
//     }</h4>
//       <h4 style="color: #333; font-family: Arial, sans-serif;"> Any Discount : ${
//         findOrder?.isCouponUsed
//           ? `Yes  ,Amount:${findOrder?.currency}` +
//             Number(findOrder?.couponUsed?.discount_amount) +
//             " ,  COUPON_CODE:" +
//             findOrder?.couponUsed?.coupon_code
//           : "No Discount"
//       }</h4>

//         <h4 style="color: #333; font-family: Arial, sans-serif;">Order Items :</h4>
//         <table style="border-collapse: collapse; width: 100%;">
//   <thead>
//     <tr>
//           <th style="border: 1px solid #555; padding: 2px; text-align: center;">S No.</th>

//       <th style="border: 1px solid #555; padding: 2px; text-align: center;">Product Name</th>

//             <th style="border: 1px solid #555; padding: 2px; text-align: center;">Image</th>

//       <th style="border: 1px solid #555; padding: 2px; text-align: center;">Quantity</th>
//       <th style="border: 1px solid #555; padding: 2px; text-align: center;">Price</th>
//             <th style="border: 1px solid #555; padding: 2px; text-align: center;">VAT Amount</th>

//             <th style="border: 1px solid #555; padding: 2px; text-align: center;">SubTotal</th>

//     </tr>
//   </thead>
//   <tbody>
//     ${findOrder?.orderItems
//       ?.map(
//         (product, index) => `
//       <tr>
//               <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//                 index + 1
//               }</td>

//         <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//           product.name
//         }</td>

//                 <td style="border: 1px solid #555; padding: 2px; text-align: center;"><img src="${
//                   product?.image[0]?.url
//                 }" alt="${
//           product.name
//         }"  style="max-width: 40px; height: auto;"></td>

//         <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//           product.quantity
//         }</td>
//         <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//           findOrder?.currency
//         }${product.price}</td>
//          <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//            findOrder?.currency
//          }${product?.gst_amount ? product?.gst_amount : 0}</td>
//                 <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//                   findOrder?.currency
//                 }${product?.product_Subtotal}</td>

//       </tr>
//     `
//       )
//       .join("")}
//        <tr>
//       <th colspan="6" style="border: 1px solid #555; padding: 2px; text-align: right;">Total Amount :</th>
//       <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
//         findOrder?.currency
//       }${findOrder?.total_amount}</td>
//     </tr>
//   </tbody>
// </table>

// <br/>
//         <span style="color: #555; font-size: 13px;">Best regards,</span><br/>

//         <span style="color: #555; font-size: 13px;">Team Tavisa</span>`;

//     // Send the email
//     await sendEmail({
//       to: `${event.data.object.customer_email}`, // Change to your recipient
//       from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender
//       subject: `Your Order #${findOrder?.orderID} Confirmation`,
//       html: htmlContent,
//     });
//     // console.log(
//     //   "event.data.object",
//     //   event.data.object,
//     //   "---------------------"
//     // );

//     // console.log(`💰 Payment status: ${event.data.object?.payment_status}`);
//   }

//   // Return a 200 res to acknowledge receipt of the event
//   res.status(200).end();
//   //   res.send().end();
// };

// Verify the Razorpay webhook signature

// This function verifies the webhook signature

const verifyWebhookSignature = (payload, signature, secret) => {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest("hex");
  return calculatedSignature === signature;
};

export const webhook = async (req, res) => {
  try {
    // Razorpay Webhook Secret (ensure this is set in your environment variables)
    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Webhook payload is coming as a Buffer. We need to convert it to a string and then parse JSON.
    const rawBody = req.body; // This should be the raw payload, not a JSON object yet
    const webhookPayload = JSON.parse(rawBody.toString()); // Parse the JSON string

    // console.log("Webhook payload received:", webhookPayload);

    // Razorpay signature sent in the headers (x-razorpay-signature)
    const razorpaySignature = req.headers["x-razorpay-signature"];

    // Verifying webhook signature to ensure it's from Razorpay
    const isVerified = verifyWebhookSignature(
      rawBody,
      razorpaySignature,
      razorpayWebhookSecret
    );

    if (!isVerified) {
      console.error("Webhook signature verification failed");
      return res.status(400).send("Invalid signature");
    }

    // Now that the payload is parsed, check the event
    // console.log(webhookPayload.event);

    // Process the webhook payload based on the event type
    switch (webhookPayload.event) {
      case "payment.captured":
        const payment = webhookPayload.payload.payment.entity;
        // console.log("Payment captured:", payment);

        // Fetch the order using the payment ID or order ID
        const orderId = payment?.notes?.orderId;
        // console.log("Order ID from Razorpay:", orderId);

        const order = await Order.findById(orderId)
          .populate("user", "name email -_id")
          .populate("couponUsed", "coupon_code discount_amount -_id");

        if (!order) {
          console.error("Order not found with ID:", orderId);
          return res.status(400).send("Order not found");
        }

        const paymentCreatedAt = payment.created_at * 1000; // Convert from seconds to milliseconds
        const paidAtDate = new Date(paymentCreatedAt);

        // Validate if the date is valid
        if (isNaN(paidAtDate.getTime())) {
          console.error(
            "Invalid date for payment.created_at:",
            paymentCreatedAt
          );
          return res.status(400).send("Invalid payment date");
        }

        // Update the order with payment details
        order.razorpay_payment_id = payment.id;
        order.razorpay_order_id = payment.order_id;
        order.razorpay_payment_receipt = payment.receipt || payment.id;

        order.paidAt = paidAtDate;
        order.isPaid = true;
        order.payment_status =
          payment.status === "captured" ? "success" : "failed";
        order.orderStatus = "new"; // Update the order status as needed
        await order.save();

        // Send a confirmation email to the user
        //         const htmlContent = `
        //           <h1>Thank you for your purchase!</h1>
        //           <p>Your payment of ${order.currency}${
        //           payment.amount / 100
        //         } was successful.</p>
        //           <p>Order ID: ${order.orderID}</p>
        //           <div>
        //         <p>Shipping Address:</p>
        // <p>
        //   ${order?.shippingInfo?.first_Name || ""} ${
        //           order?.shippingInfo?.last_Name || ""
        //         }<br />
        //   ${order?.shippingInfo?.phone_Number || ""}<br />
        //   ${order?.shippingInfo?.street || ""}, ${order?.shippingInfo?.city || ""}<br />
        //   ${order?.shippingInfo?.state || ""}, ${
        //           order?.shippingInfo?.postalCode || ""
        //         }<br />
        //   ${order?.shippingInfo?.country || ""}
        // </p>
        //         </div>
        //           <h4>Order Items:</h4>
        //           <table border="1">
        //             <thead>
        //               <tr>
        //                 <th>Product Name</th>
        //                 <th>Quantity</th>
        //                 <th>Price</th>
        //                 <th>GST</th>
        //                 <th>Total</th>
        //               </tr>
        //             </thead>
        //             <tbody>
        //               ${order.orderItems
        //                 .map(
        //                   (item) => `
        //                   <tr>
        //                     <td>${item.name}</td>
        //                     <td>${item.quantity}</td>
        //                     <td>${order.currency}${item?.price}</td>
        //                     <td>${order.currency}${item?.gst_amount}</td>
        //                     <td>${order.currency}${item?.total_price}</td>
        //                   </tr>
        //                 `
        //                 )
        //                 .join("")}
        //             </tbody>
        //           </table>
        //           <p>Total: ${order.currency}${order.total_amount}</p>
        //           <span>Best regards,</span><br/>
        //           <span>Team Frame Ji</span>`;

        const htmlContent = `
  <h1 style="color: #333;">Thank you for your purchase!</h1>
  <p style="font-size: 16px; color: #555;">Your payment of ${order.currency}${
          payment.amount / 100
        } was successful.</p>
  
  <p><strong>Order ID:</strong> ${order.orderID}</p>

      <p style="color: #333; font-family: Arial, sans-serif;">Any Discount :
         ${
           order?.isCouponUsed
             ? `Yes  ,Amount:${order?.currency}` +
               Number(order?.couponUsed?.discount_amount) +
               " ,  COUPON_CODE:" +
               order?.couponUsed?.coupon_code
             : "No Discount"
         }</p>
  
  <div style="margin-bottom: 20px;">
    <p><strong>Shipping Address:</strong></p>
    <p>
      ${order?.shippingInfo?.first_Name || ""} ${
          order?.shippingInfo?.last_Name || ""
        }<br />
      ${order?.shippingInfo?.phone_Number || ""}<br />
      ${order?.shippingInfo?.street || ""}, ${
          order?.shippingInfo?.city || ""
        }<br />
      ${order?.shippingInfo?.state || ""}, ${
          order?.shippingInfo?.postalCode || ""
        }<br />
      ${order?.shippingInfo?.country || ""}
    </p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>Billing Address:</strong></p>
    <p>
      Neonflake Enterprises (OPC) Pvt Ltd<br />
      Phone: 900000000<br />
      303, 3rd Floor, Meridian Plaza,<br />
      beside Lal Bungalow, Ameerpet,<br />
      Hyderabad, Telangana 500016
    </p>
  </div>
  
  <h4 style="color: #333; font-size: 20px; font-weight: 600;">Order Items:</h4>
  
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead style="background-color: #f0f0f0;">
      <tr>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product Name</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Price</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">GST</th>
        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.orderItems
        .map(
          (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
            item.quantity
          }</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
            order.currency
          }${item?.price.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
            order.currency
          }${item?.gst_amount.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
            order.currency
          }${item?.total_price.toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div>
  <p style="font-size: 14px; color: #555;"><span>Subtotal (with GST):</span> ${
    order.currency
  }${order.total_amount.toFixed(2)}</p>
  <p style="font-size: 14px; color: #555;"><span>Total GST:</span> ${
    order.currency
  }${order.gst_amount.toFixed(2)}</p>
  <p style="font-size: 14px; color: #555;"><span>Shipping:</span> ${
    order.currency
  }${order.shipping_charge.toFixed(2) || "0.00"}</p>
  <p style="font-size: 16px; color: #555;"><strong>Total:</strong> ${
    order.currency
  }${order.total_amount.toFixed(2)}</p>
  </div>

  
  
  <div style="margin-top: 30px; font-size: 16px; color: #555;">
    <p>Best regards,</p>
    <p><strong>Team Frame Ji</strong></p>
    <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us at <a href="mailto:hello@frameji.com" style="color: #1a73e8;">support@frameji.com</a></p>
  </div>
`;

        await sendEmail({
          to: order.user.email,
          from: process.env.SEND_EMAIL_FROM,
          subject: `Your Order #${order.orderID} Confirmed`,
          html: htmlContent,
        });

        break;

      case "payment.failed":
        const failedPayment = webhookPayload.payload.payment.entity;
        // console.log("Payment failed:", failedPayment);

        // Fetch the order to update payment status
        const failedOrderId = failedPayment.notes.orderId;
        const failedOrder = await Order.findById(failedOrderId);

        if (!failedOrder) {
          console.error("Order not found with ID:", failedOrderId);
          return res.status(400).send("Order not found");
        }
        failedOrder.payment_status = "failed";
        failedOrder.isPaid = false;
        failedOrder.orderStatus = "unpaid";
        await failedOrder.save();

        // Optionally, send an email to notify the user of the payment failure
        const failureHtmlContent = `
          <h1>Payment Failed</h1>
          <p>Your payment for order #${failedOrder.orderID} was unsuccessful.</p>
          <p>Please try again or contact support for assistance.</p>
          <span>Best regards,</span><br/>
          <span>Team Frame Ji</span>`;

        await sendEmail({
          to: failedPayment.email,
          from: process.env.SEND_EMAIL_FROM,
          subject: `Payment Failure for Order #${failedOrder.orderID}`,
          html: failureHtmlContent,
        });

        break;

      default:
        console.log("Unhandled webhook event:", webhookPayload.event);
    }

    // Respond to Razorpay to acknowledge receipt of the event
    res.status(200).send("Webhook received and processed");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};
