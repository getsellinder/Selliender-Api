import bodyParser from "body-parser";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Order } from "./orderModel.js";

import { shippingAddress } from "../ShippingAddresses/ShippingAddressModel.js";
import sendEmail from "../../Utils/sendEmail.js";
import { AffiliateModel } from "../Affiliate&Coupon/Affiliate/AffiliateModel.js";
const instance = new Razorpay({
  key_id: process.env.RAZERPAY_KEY_ID,
  key_secret: process.env.RAZERPAY_SECRET_KEY,
});
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
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error" };
  }
};
// ------------------------------------------------------
const generateUniqueOrderId = async () => {
  const currentYear = new Date().getFullYear();
  // Find the latest order to get the last serial number
  const latestOrder = await Order.findOne({}, {}, { sort: { orderID: -1 } });
  let serialNumber = 1;

  if (latestOrder) {
    const lastYear = parseInt(latestOrder.orderID.substring(0, 4), 10);
    if (lastYear === currentYear) {
      // If the last order was in the current year, increment the serial number
      serialNumber = parseInt(latestOrder.orderID.substring(4), 10) + 1;
    }
  }
  // Pad the serial number with zeros and concatenate with the current year
  const paddedSerialNumber = serialNumber.toString().padStart(7, "0");
  const orderId = `${currentYear}${paddedSerialNumber}`;
  return orderId;
};

export const getRzpkey = async (req, res) => {
  const { name, email } = req.user;
  // console.log(name);
  // console.log(email);
  res.status(200).json({
    success: true,
    key: process.env.RAZERPAY_KEY_ID,
    name,
    email,
  });
};
//point of sale order
export const getRazerpayKey = async (req, res) => {
  try {
    const { name, email } = req.params;
    // console.log("name", name, "email", email);
    if (!name || !email) {
      throw new Error("Name and email are required parameters");
    }
    res.status(200).json({
      success: true,
      key: process.env.RAZERPAY_KEY_ID,
      name,
      email,
    });
  } catch (error) {
    console.error("Error in getRzpKey:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const checkout = async (req, res) => {
  try {
    const { userr, address, cart, subtotal, orderType, couponCode } = req.body;
    // console.log(req.body.cart[0].product);
    if (cart.length < 1)
      return res.status(400).json({ message: "cart is empty!" });
    if (!address)
      return res
        .status(404)
        .json({ message: "please select shipping address!" });
    if (!subtotal)
      return res
        .status(404)
        .json({ message: "please provide product subtotal!" });
    const options = {
      amount: Number(req.body.subtotal * 100),
      currency: "INR",
    };
    // Determine the user ID
    let User;
    if (userr) {
      User = userr; // Use provided user ID
    } else {
      User = req.user._id; // Use authenticated user ID
    }
    // console.log(User);
    const order = await instance.orders.create(options);
    // console.log(order);
    //save order in database
    if (order?.id) {
      // const { email } = req.user;
      // if (!email)
      //   return res.status(400).send({ message: "Please enter the email" });
      let addss = await shippingAddress.findById(address);

      let shipping = {
        first_Name: addss.first_Name,
        last_Name: addss?.last_Name,
        phone_Number: addss?.phone_Number,
        street: addss?.street,
        city: addss?.city,
        state: addss?.state,
        postalCode: addss?.postalCode,
        country: addss?.country,
        company_name: addss?.company_name,
        gst_number: addss?.gst_number,
        addressId: address,
      };
      // console.log("cart", cart[0]?.product?.gst);
      const orderItems = await cart.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        variant_Name: item?.variant?.variant_Name
          ? item?.variant?.variant_Name
          : "",
        price: Number(
          item?.variant?.price
            ? item?.variant?.price
            : item?.product?.master_price
        ),
        total_price:
          item.quantity *
          Number(
            item?.variant?.price
              ? item?.variant?.price
              : item?.product?.master_price
          ),
        color: item?.color || {                   // Extract color (colorCode & colorName)
          colorCode: item?.color?.colorCode || "", // If colorCode exists, use it; otherwise, default to ""
          colorName: item?.color?.colorName || "", // If colorName exists, use it; otherwise, default to ""
        },
        image: item.product?.image,
        quantity: item?.quantity,
        gst_amount: Number(
          (Number(
            item?.variant?.price
              ? item?.variant?.price
              : item?.product?.master_price
          ) *
            Number(
              item?.variant?.gst_Id?.tax
                ? item?.variant?.gst_Id?.tax
                : item?.product?.master_GST?.tax
            )) /
          100
        )?.toFixed(2),
        total_gst_amount: Number(
          Number(item?.quantity) *
          Number(
            (Number(
              item?.variant?.price
                ? item?.variant?.price
                : item?.product?.master_price
            ) *
              Number(
                item?.variant?.gst_Id?.tax
                  ? item?.variant?.gst_Id?.tax
                  : item?.product?.master_GST?.tax
              )) /
            100
          )
        )?.toFixed(2),
        gst_rate: item?.variant?.gst_Id?.tax
          ? item?.variant?.gst_Id?.tax
          : item?.product?.master_GST?.tax,
        tax_Name: item?.variant?.gst_Id?.name
          ? item?.variant?.gst_Id?.name
          : item?.product?.master_GST?.name,
        product_Subtotal: Number(
          Number(
            item.quantity *
            Number(
              item?.variant?.price
                ? item?.variant?.price
                : item?.product?.master_price
            )
          ) +
          Number(
            Number(item.quantity) *
            Number(
              (Number(
                item?.variant?.price
                  ? item?.variant?.price
                  : item?.product?.master_price
              ) *
                Number(
                  item?.variant?.gst_Id?.tax
                    ? item?.variant?.gst_Id?.tax
                    : item?.product?.master_GST?.tax
                )) /
              100
            )
          )
        )?.toFixed(2),
      }));

      // console.log("Order", orderItems[0]);
      const Id = await generateUniqueOrderId();
      const orders = await Order.create({
        orderID: Id,
        total_amount: subtotal,
        orderItems,
        shippingInfo: shipping,
        user: User,
        razorpay_order_id: order?.id,
        orderType,
      });
      // console.log(
      //   "orders",
      //   orders,
      //   "-------------------------------------------------"
      // );
      if (couponCode) {
        const couponResponse = await usedCoupon(
          orders?.orderID,
          couponCode,
          orders?.user
        );
        if (couponResponse?.success === true) {
          const saveData = await Order.findByIdAndUpdate(
            { _id: orders?._id },
            {
              isCouponUsed: true,
              couponUsed: couponResponse?.AffiliateCouponID,
            },
            { new: true }
          );
        } else {
          return res.status(400).json({
            success: false,
            message: couponResponse?.message
              ? couponResponse?.message
              : "Something Wrong With Discount Coupon",
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Failled to order Create",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      success: false,
      message: error?.description
        ? "Razorpay" + error?.description
        : "Something went wrong!",
    });
  }
};

export const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZERPAY_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here
    let findSameOrder = await Order.findOne({
      razorpay_order_id: razorpay_order_id,
    })
      .populate({
        path: "user",
        select: "name email -_id",
      })
      .populate({
        path: "couponUsed",
        select: "coupon_code discount_amount -_id", // Only select coupon_code and discount_amount from the couponUsed model
      });

    if (findSameOrder) {
      (findSameOrder.razorpay_payment_id = razorpay_payment_id), // await Payment.create({
        (findSameOrder.isPaid = true),
        (findSameOrder.paidAt = Date.now()),
        (findSameOrder.razorpay_signature = razorpay_signature);
      // await Payment.create({
      findSameOrder.payment_status = "success";

      findSameOrder.orderStatus = "new";
      await findSameOrder.save();
    }
    //send email to customer
    await sendEmail({
      to: `${findSameOrder?.user?.email}`, // Change to your recipient

      from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

      subject: `Your Order #${findSameOrder?.orderID} Confirmation`,
      html: ` <h1 style="color: #333; text-align: center; font-family: Arial, sans-serif;">Welcome to Tavisa - Let the Shopping Begin!</h1>
       <strong style="color: #1b03a3; font-size: 16px"> Hi ${findSameOrder?.shippingInfo?.first_Name
        },</strong>
       
        <p style="color: #555; font-size: 15px;">Great news! Your order #${findSameOrder?.orderID
        } has been confirmed. Here are the details</p>            
 <h4 style="color: #333; font-family: Arial, sans-serif;">Shipping Address : ${findSameOrder?.shippingInfo?.first_Name
        }  ${findSameOrder?.shippingInfo?.last_Name} , ${findSameOrder?.shippingInfo?.street
        } ${findSameOrder?.shippingInfo?.city} ${findSameOrder?.shippingInfo?.state
        } ${findSameOrder?.shippingInfo?.country}, PIN-${findSameOrder?.shippingInfo?.postalCode
        }, Phone Number: ${findSameOrder?.shippingInfo?.phone_Number}
       ${findSameOrder?.shippingInfo?.company_name
          ? ",Company Name :" + findSameOrder?.shippingInfo?.company_name + ""
          : ""
        } ${findSameOrder?.shippingInfo?.gst_number
          ? ", GST_NO:" + findSameOrder?.shippingInfo?.gst_number
          : ""
        }</h4>
      <h4 style="color: #333; font-family: Arial, sans-serif;"> Any Discount : ${findSameOrder?.isCouponUsed
          ? "Yes  ,₹" +
          Number(findSameOrder?.couponUsed?.discount_amount) +
          " ,  COUPON_CODE:" +
          findSameOrder?.couponUsed?.coupon_code
          : "No Discount"
        }</h4>
        <h4 style="color: #333; font-family: Arial, sans-serif;">Order Items :</h4>
        <table style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
          <th style="border: 1px solid #555; padding: 2px; text-align: center;">S No.</th>

      <th style="border: 1px solid #555; padding: 2px; text-align: center;">Product Name</th>
            <th style="border: 1px solid #555; padding: 2px; text-align: center;">Variant</th>

            <th style="border: 1px solid #555; padding: 2px; text-align: center;">Image</th>

      <th style="border: 1px solid #555; padding: 2px; text-align: center;">Quantity</th>
      <th style="border: 1px solid #555; padding: 2px; text-align: center;">Price</th>
            <th style="border: 1px solid #555; padding: 2px; text-align: center;">GST Amount</th>

            <th style="border: 1px solid #555; padding: 2px; text-align: center;">SubTotal</th>

    </tr>
  </thead>
  <tbody>
    ${findSameOrder?.orderItems
          ?.map(
            (product, index) => `
      <tr>
              <td style="border: 1px solid #555; padding: 2px; text-align: center;">${index + 1
              }</td>

        <td style="border: 1px solid #555; padding: 2px; text-align: center;">${product.name
              }</td>
          <td style="border: 1px solid #555; padding: 2px; text-align: center;">${product?.variant_Name
              }</td>
                <td style="border: 1px solid #555; padding: 2px; text-align: center;"><img src="${product?.image[0]?.url
              }" alt="${product.name
              }"  style="max-width: 40px; height: auto;"></td>

        <td style="border: 1px solid #555; padding: 2px; text-align: center;">${product.quantity
              }</td>
        <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${product.price
              }</td>
         <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${product?.gst_amount
              }</td>
                <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${product?.product_Subtotal
              }</td>

      </tr>
    `
          )
          .join("")}
       <tr>
      <th colspan="7" style="border: 1px solid #555; padding: 2px; text-align: right;">Total Amount :</th>
      <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${findSameOrder?.total_amount
        }</td>
    </tr>
  </tbody>
</table>

<br/>
        <span style="color: #555; font-size: 13px;">Best regards,</span><br/>
        
        <span style="color: #555; font-size: 13px;">Team Tavisa</span>`,
    });
    // console.log("findSameOrder", findSameOrder);

    //     //             findSameOrder.razorpay_payment_id=razorpay_payment_id,// await Payment.create({
    //   findOrder.paidAt = new Date(event.data.object.created * 1000);
    //     findOrder.isPaid = true;

    // razorpay_signature: { type: String },
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    res.redirect(`https://ayurpulse-website.netlify.app/shop`);
    // res.redirect(
    //   `http://localhost:5173/cart/paymentsuccess?reference=${razorpay_payment_id}`
    // );
  } else {
    res.status(400).json({
      success: false,
    });
  }
};

// point of sale payment varification
export const pospaymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZERPAY_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here
    let findSameOrder = await Order.findOne({
      razorpay_order_id: razorpay_order_id,
    }).populate({
      path: "user",
      select: "name email -_id",
    });
    // console.log("findSameOrder", findSameOrder);
    if (findSameOrder) {
      (findSameOrder.razorpay_payment_id = razorpay_payment_id), // await Payment.create({
        (findSameOrder.isPaid = true),
        (findSameOrder.paidAt = Date.now()),
        (findSameOrder.razorpay_signature = razorpay_signature);
      // await Payment.create({
      findSameOrder.payment_status = "success";

      findSameOrder.orderStatus = "new";
      await findSameOrder.save();
    }
    //send email to customer
    // console.log("findSameOrder", findSameOrder);
    await sendEmail({
      to: `${findSameOrder?.user?.email}`, // Change to your recipient

      from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

      subject: `Your Order #${findSameOrder?.orderID} Confirmation`,
      html: ` <h1 style="color: #333; text-align: center; font-family: Arial, sans-serif;">Welcome to Tavisa - Let the Shopping Begin!</h1>
       <strong style="color: #1b03a3; font-size: 16px"> Hi ${findSameOrder?.shippingInfo?.first_Name
        },</strong>
       
        <p style="color: #555; font-size: 15px;">Great news! Your order #${findSameOrder?.orderID
        } has been confirmed. Here are the details</p>            
 <h4 style="color: #333; font-family: Arial, sans-serif;">Shipping Address : ${findSameOrder?.shippingInfo?.first_Name
        }  ${findSameOrder?.shippingInfo?.last_Name} , ${findSameOrder?.shippingInfo?.street
        } ${findSameOrder?.shippingInfo?.city} ${findSameOrder?.shippingInfo?.state
        } ${findSameOrder?.shippingInfo?.country}, PIN-${findSameOrder?.shippingInfo?.postalCode
        }, Phone Number: ${findSameOrder?.shippingInfo?.phone_Number}
       ${findSameOrder?.shippingInfo?.company_name
          ? ",Company Name :" + findSameOrder?.shippingInfo?.company_name + ""
          : ""
        } ${findSameOrder?.shippingInfo?.gst_number
          ? ", GST_NO:" + findSameOrder?.shippingInfo?.gst_number
          : ""
        }</h4>
        <h4 style="color: #333; font-family: Arial, sans-serif;"> Any Discount: ${findSameOrder?.isCouponUsed
          ? "Yes  ,₹" +
          Number(findSameOrder?.couponUsed?.discount_amount) +
          " ,  COUPON_CODE:" +
          findSameOrder?.couponUsed?.coupon_code
          : "No Discount"
        }</h4>
        <h4 style="color: #333; font-family: Arial, sans-serif;">Order Items :</h4>
        <table style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
          <th style="border: 1px solid #555; padding: 2px; text-align: center;">S No.</th>

      <th style="border: 1px solid #555; padding: 2px; text-align: center;">Product Name</th>
            <th style="border: 1px solid #555; padding: 2px; text-align: center;">Variant</th>

            <th style="border: 1px solid #555; padding: 2px; text-align: center;">Image</th>

      <th style="border: 1px solid #555; padding: 2px; text-align: center;">Quantity</th>
      <th style="border: 1px solid #555; padding: 2px; text-align: center;">Price</th>
            <th style="border: 1px solid #555; padding: 2px; text-align: center;">GST Amount</th>

            <th style="border: 1px solid #555; padding: 2px; text-align: center;">SubTotal</th>

    </tr>
  </thead>
  <tbody>
    ${findSameOrder?.orderItems
          ?.map(
            (product, index) => `
      <tr>
              <td style="border: 1px solid #555; padding: 2px; text-align: center;">${index + 1
              }</td>

        <td style="border: 1px solid #555; padding: 2px; text-align: center;">${product.name
              }</td>
          <td style="border: 1px solid #555; padding: 2px; text-align: center;">${product?.variant_Name
              }</td>
                <td style="border: 1px solid #555; padding: 2px; text-align: center;"><img src="${product?.image[0]?.url
              }" alt="${product.name
              }"  style="max-width: 40px; height: auto;"></td>

        <td style="border: 1px solid #555; padding: 2px; text-align: center;">${product.quantity
              }</td>
        <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${product.price
              }</td>
         <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${product?.gst_amount
              }</td>
                <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${product?.product_Subtotal
              }</td>

      </tr>
    `
          )
          .join("")}
       <tr>
      <th colspan="7" style="border: 1px solid #555; padding: 2px; text-align: right;">Total Amount :</th>
      <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${findSameOrder?.total_amount
        }</td>
    </tr>
  </tbody>
</table>

<br/>
        <span style="color: #555; font-size: 13px;">Best regards,</span><br/>
        
        <span style="color: #555; font-size: 13px;">Team Tavisa</span>`,
    });
    // console.log("findSameOrder", findSameOrder);

    //     //             findSameOrder.razorpay_payment_id=razorpay_payment_id,// await Payment.create({
    //   findOrder.paidAt = new Date(event.data.object.created * 1000);
    //     findOrder.isPaid = true;

    // razorpay_signature: { type: String },
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    res.redirect(`https://admin.smellika.com/#/pos`);
    //  res.redirect(`http://localhost:3000/#/pos`);
  } else {
    res.status(400).json({
      success: false,
    });
  }
};

export const handlePayment = async (req, res) => {
  try {
    const { email } = req.user;
    if (!email)
      return res.status(400).send({ message: "Please enter the email" });
    const { address, cart, subtotal } = req.body;
    if (cart.length < 1)
      return res.status(400).json({ message: "cart is empty!" });
    switch (true) {
      //validation
      case !address: {
        return res.status(404).json({ msg: "please provide shipping address" });
      }
      case !subtotal: {
        return res.status(404).json({ msg: "please provide product subtotal" });
      }
    }
    let addss = await shippingAddress.findById(address);
    // console.log(addss?.postalCode);
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
    const orderItems = await cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.total_amount,
      image: item.product.image,
      quantity: item.quantity,
      product_Subtotal: item.subtotal,
    }));

    // console.log("line", lineItems[0]);
    const Id = await generateUniqueOrderId();
    const order = await Order.create({
      orderID: Id,
      total_amount: subtotal,
      orderItems,
      shippingInfo: shipping,
      user: req.user._id,
    });
    const lineItems = await cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,

          images: [item.product.image[0]?.url],
        },
        unit_amount: Number(item.product.total_amount) * 100,
      },
      quantity: Number(item.quantity),
    }));
    if (order) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: `${email}`,
        metadata: {
          orderId: order._id.toString(),

          // Add any other key-value pairs as needed
        },
        success_url: `${process.env.FRONTEND_URL}/cart`,
        cancel_url: `${process.env.FRONTEND_URL}/error`,
      });
      //   res.json({ sessionId: session.id });

      res.status(200).send({ message: "order created", url: session.url });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong", err });
  }
};

export const webhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"];
  let event;
  if (webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  }

  if (event.type === "checkout.session.completed") {
    // console.log("dddddddddddd", event.data);
    const findOrder = await Order.findById(event.data.object.metadata?.orderId);
    findOrder.paypal_payer_id = event.data.object.id;
    findOrder.paidAt = new Date(event.data.object.created * 1000);
    findOrder.isPaid = true;
    if (event.data.object?.payment_status === "paid") {
      findOrder.payment_status = "success";
    } else {
      findOrder.payment_status = "failed";
    }
    findOrder.orderStatus = "new";
    await findOrder.save();
    await sendEmail({
      to: `${event.data.object.customer_email}`, // Change to your recipient

      from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender

      subject: `Your Order #${findOrder?.orderID} Confirmation`,
      html: ` <h1 style="color: #333; text-align: center; font-family: Arial, sans-serif;">Welcome to Tavisa - Let the Shopping Begin!</h1>
       <strong style="color: #1b03a3; font-size: 16px"> Hi ${findOrder?.shippingInfo?.first_Name},</strong>
       
        <p style="color: #555; font-size: 15px;">Great news! Your order #${findOrder?.orderID} has been confirmed. Here are the details</p>
        <br/>
        <span style="color: #555; font-size: 13px;">Best regards,</span><br/>
        
        <span style="color: #555; font-size: 13px;">Team Tavisa</span>`,
    });

    // Items: [List of Purchased Items]
    // Total Amount: [Total Amount]
    // Shipping Address: [Shipping Address]

    // We'll keep you updated on the shipping progress. Thanks for choosing Tavisa!

    // Best regards
    // Team Tavisa
    console.log(
      "event.data.object",
      event.data.object,
      "---------------------"
    );

    console.log(`💰 Payment status: ${event.data.object?.payment_status}`);

    // Saving the payment details in the database
    // const payment = await Payment.create({
    //   customer_email: event.data.object.customer_email,
    //   amount: event.data.object.amount_total / 100,
    //   paymentId: event.data.object.id,
    //   paymentStatus: event.data.object.payment_status,
    //   createdAt: event.data.object.created,
    // });
  }
  // if (event.type === "checkout.session.completed") {
  //   console.log("dddddddddddd", event.data);
  //   console.log("event.data.object", event.data.object);
  //   console.log(`💰 Payment status: ${event.data.object?.payment_status}`);
  //   payment_intent.payment_failed;

  //   // Saving the payment details in the database
  //   // const payment = await Payment.create({
  //   //   customer_email: event.data.object.customer_email,
  //   //   amount: event.data.object.amount_total / 100,
  //   //   paymentId: event.data.object.id,
  //   //   paymentStatus: event.data.object.payment_status,
  //   //   createdAt: event.data.object.created,
  //   // });
  // }

  // Return a 200 res to acknowledge receipt of the event
  res.status(200).end();
  //   res.send().end();
};
