import { shordataformate, timeFormat } from "../../Utils/formatDateToIST .js";
import sendEmail from "../../Utils/sendEmail.js";
import Invoice from "../Plans/Invoice.js";
import packageModel from "../Plans/Package.model.js";
import UserModel from "../user/userModel.js";
import { Order } from "./orderModel.js";

export const getAllOrder = async (req, res) => {
  try {
    let limit = parseInt(req.query?.limit) || 4;
    let page = parseInt(req.query?.page) || 1;
    let search = req.query?.name || "";

    const searchRegex = new RegExp(search, "i");

    // ✅ 1. Find matching users and plans
    const users = await UserModel.find({
      name: { $regex: searchRegex },
    }).select("_id");
    const plans = await packageModel
      .find({ Package: { $regex: searchRegex } })
      .select("_id");

    const userIds = users.map((u) => u._id);
    const planIds = plans.map((p) => p._id);

    // ✅ 2. Build the invoice filter (either user name or plan name matches)
    const filter = {
      status: "success",
      $or: [{ userId: { $in: userIds } }, { PlanId: { $in: planIds } }],
    };

    // ✅ 3. Get invoices with populate
    let invoices = await Invoice.find(filter)
      .populate({
        path: "userId",
        select: "name email _id",
      })
      .populate({
        path: "PlanId",
        select: "Package _id",
      })
      .sort({ createdAt: -1 });

    // ✅ 4. Remove duplicates (one invoice per user)
    const seenUserIds = new Set();
    const uniqueInvoices = [];

    for (const inv of invoices) {
      if (inv.userId && !seenUserIds.has(inv.userId._id.toString())) {
        seenUserIds.add(inv.userId._id.toString());
        uniqueInvoices.push(inv);
      }
    }

    // ✅ 5. Pagination
    const totalItems = uniqueInvoices.length;
    const startIndex = (page - 1) * limit;
    const paginatedInvoices = uniqueInvoices.slice(
      startIndex,
      startIndex + limit
    );

    if (paginatedInvoices.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }

    // ✅ 6. Format response
    const data = paginatedInvoices.map((val) => ({
      ...val.toObject(),
      createdAt: shordataformate(val.createdAt),
      plan_start_date: shordataformate(val.plan_start_date),

      plan_expiry_date: shordataformate(val.plan_expiry_date),

      Amount: val.Amount?.toLocaleString(),
    }));

    res.status(200).json({
      success: true,
      data,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
export const getOrders = async (req, res) => {
  try {
    let limit = parseInt(req.query?.limit) || 4;
    let page = parseInt(req.query?.page) || 1;
    let search = req.query?.name || "";

    const searchRegex = new RegExp(search, "i");

    // ✅ 1. Find matching users and plans
    const users = await UserModel.find({
      name: { $regex: searchRegex },
    }).select("_id");
    const plans = await packageModel
      .find({ Package: { $regex: searchRegex } })
      .select("_id");

    const userIds = users.map((u) => u._id);
    const planIds = plans.map((p) => p._id);


    const filter = {
      // status: "success",
      $or: [{ userId: { $in: userIds } }, { PlanId: { $in: planIds } }],
    };

    // ✅ 3. Get invoices with populate
    let invoices = await Invoice.find(filter)
      .populate({
        path: "userId",
        select: "name email _id",
      })
      .populate({
        path: "PlanId",
        select: "Package _id",
      })
      .sort({ createdAt: -1 });

    // ✅ 4. Remove duplicates (one invoice per user)
    const seenUserIds = new Set();
    const uniqueInvoices = [];

    for (const inv of invoices) {
      if (inv.userId && !seenUserIds.has(inv.userId._id.toString())) {
        seenUserIds.add(inv.userId._id.toString());
        uniqueInvoices.push(inv);
      }
    }

    // ✅ 5. Pagination
    const totalItems = uniqueInvoices.length;
    const startIndex = (page - 1) * limit;
    const paginatedInvoices = uniqueInvoices.slice(
      startIndex,
      startIndex + limit
    );

    if (paginatedInvoices.length === 0) {
      return res.status(200).json({ message: "No Data Found" });
    }

    // ✅ 6. Format response
    const data = paginatedInvoices.map((val) => ({
      ...val.toObject(),
      createdAt: shordataformate(val.createdAt),
      plan_start_date: shordataformate(val.plan_start_date),

      plan_expiry_date: shordataformate(val.plan_expiry_date),

      Amount: val.Amount?.toLocaleString(),
    }));

    res.status(200).json({
      success: true,
      data,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};




export const getSingleOrder = async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).json({ message: "please Provide Order Id" });


    const order = await Order.findById(req.params.id)
      .populate({
        path: "user",
        select: "name email -_id ",
      })
      .populate({
        path: "couponUsed",
        select: "coupon_code discount_amount -_id", // Only select coupon_code and discount_amount from the couponUsed model
      })
      .populate({
        path: "shippingInfo.addressId",
      })
      .sort({ createdAt: -1 });
    if (order) {
      res.status(201).json({
        success: true,
        order,
        message: " Order Fetched",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

//get self User Order
export const getUserSelf = async (req, res) => {
  if (!req?.user) return res.status(400).json({ message: "please login !" });
  try {
    const order = await Order.find({
      user: req.user?._id,
      payment_status: "success",
    }).sort({ createdAt: -1 });

    if (order) {
      return res.status(200).json({
        success: true,
        order,
        message: "self Order fetched",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
//order success
export const getOrderSuccess = async (req, res) => {
  // console.log("req.params.sessionId", req.params.sessionId);
  try {
    const order = await Order.findOne({
      // payment_status: { $in: ["success", "failed"] },
      payment_status: "success",
      razorpay_payment_id: req.params.sessionId,
    })
      .populate({
        path: "user",
        select: "name -_id",
      })
      .populate({
        path: "couponUsed",
        select: "coupon_code discount_amount -_id", // Only select coupon_code and discount_amount from the couponUsed model
      })
      .populate({
        path: "shippingInfo.addressId",
      })
      .sort({ updatedAt: -1 });
    if (order) {
      res.status(200).json({
        success: true,
        order,
        message: " Order Fetched",
      });
      // console.log("order send", order);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
export const deleteOneOrder = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "please login !" });
    if (!req.params.id)
      return res.status(400).json({ message: "please Provide Order Id" });
    const getOrder = await Order.findById(req.params.id);
    if (!getOrder) {
      return res.status(404).json({
        success: false,
        message: "No Order  Found!",
      });
    }
    const order = await Order.findByIdAndDelete(req.params.id);

    await order.remove();
    res.status(200).json({
      success: true,
      message: "Order Deleted Successfully!!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
export const updateOrderStatusById = async (req, res) => {
  try {
    let body = { orderStatus: req.body.status };

    const currentDate = new Date();
    body["status_timeline." + req.body.status] = currentDate;
    // if (req.body?.package_weight) body.package_weight = req.body.package_weight;
    const order = await Order.findById(req.params.id)
      .populate({
        path: "user",
        select: "name email -_id",
      })
      .populate({
        path: "couponUsed",
        select: "coupon_code discount_amount -_id", // Only select coupon_code and discount_amount from the couponUsed model
      });
    // console.log("order", order);
    // const parentData = { email: order?.parent?.email };
    if (req.body.status === "cancelled") {
      body["order_Cancelled_Reason"] = req.body?.ReasonforCancellation;
      body["iscancelled"] = true;
      await Order.findByIdAndUpdate(order._id, body);

      const htmlContent = `<strong style="color: #1b03a3; font-size: 16px"> Hi ${order?.shippingInfo?.first_Name
        },</strong> 
        <h3 style="color: #333;  font-family: Arial, sans-serif;">We hope this message finds you well. We're writing to inform you that your order ${order?.orderID
        } has been canceled. We understand that circumstances may change, and we're here to assist you throughout the process.</h3>
         
         <h4 style="color: #333; font-family: Arial, sans-serif;">Any Discount : 
         ${order?.isCouponUsed
          ? `Yes  ,Amount:${order?.currency}` +
          Number(order?.couponUsed?.discount_amount) +
          " ,  COUPON_CODE:" +
          order?.couponUsed?.coupon_code
          : "No Discount"
        }</h4>   
          <div style="margin-bottom: 20px;">
    <p><strong>Shipping Address:</strong></p>
    <p>
      ${order?.shippingInfo?.first_Name || ""} ${order?.shippingInfo?.last_Name || ""
        }<br />
      ${order?.shippingInfo?.phone_Number || ""}<br />
      ${order?.shippingInfo?.street || ""}, ${order?.shippingInfo?.city || ""
        }<br />
      ${order?.shippingInfo?.state || ""}, ${order?.shippingInfo?.postalCode || ""
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
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity
              }</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.price.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.gst_amount.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.total_price.toFixed(2)}</td>
        </tr>
      `
          )
          .join("")}
    </tbody>
  </table>

  <div>
  <p style="font-size: 14px; color: #555;"><span>Subtotal (with GST):</span> ${order.currency
        }${order.total_amount.toFixed(2)}</p>
  <p style="font-size: 14px; color: #555;"><span>Total GST:</span> ${order.currency
        }${order.gst_amount.toFixed(2)}</p>
  <p style="font-size: 14px; color: #555;"><span>Shipping:</span> ${order.currency
        }${order.shipping_charge.toFixed(2) || "0.00"}</p>
  <p style="font-size: 16px; color: #555;"><strong>Total:</strong> ${order.currency
        }${order.total_amount.toFixed(2)}</p>
  </div>

  
  
  <div style="margin-top: 30px; font-size: 16px; color: #555;">
    <p>Best regards,</p>
    <p><strong>Team Frame Ji</strong></p>
    <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us at <a href="mailto:hello@frameji.com" style="color: #1a73e8;">support@frameji.com</a></p>
  </div> 
 `;

      await sendEmail({
        to: `${order?.user?.email}`, // Change to your recipient
        from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender
        subject: `Order #${order?.orderID} Update: Cancellation and Refund Process`,
        html: htmlContent,
        //         html: `<strong style="color: #1b03a3; font-size: 16px"> Hi ${
        //           order?.shippingInfo?.first_Name
        //         },</strong>
        //         <h3 style="color: #333;  font-family: Arial, sans-serif;">We hope this message finds you well. We're writing to inform you that your order ${
        //           order?.orderID
        //         } has been canceled. We understand that circumstances may change, and we're here to assist you throughout the process.</h3>

        //          <h4 style="color: #333; font-family: Arial, sans-serif;">Any Discount :
        //          ${
        //            order?.isCouponUsed
        //              ? `Yes  ,Amount:${order?.currency}` +
        //                Number(order?.couponUsed?.discount_amount) +
        //                " ,  COUPON_CODE:" +
        //                order?.couponUsed?.coupon_code
        //              : "No Discount"
        //          }</h4>
        //           <div style="margin-bottom: 20px;">
        //     <p><strong>Shipping Address:</strong></p>
        //     <p>
        //       ${order?.shippingInfo?.first_Name || ""} ${
        //           order?.shippingInfo?.last_Name || ""
        //         }<br />
        //       ${order?.shippingInfo?.phone_Number || ""}<br />
        //       ${order?.shippingInfo?.street || ""}, ${
        //           order?.shippingInfo?.city || ""
        //         }<br />
        //       ${order?.shippingInfo?.state || ""}, ${
        //           order?.shippingInfo?.postalCode || ""
        //         }<br />
        //       ${order?.shippingInfo?.country || ""}
        //     </p>
        //   </div>

        //   <div style="margin-bottom: 20px;">
        //     <p><strong>Billing Address:</strong></p>
        //     <p>
        //       Neonflake Enterprises (OPC) Pvt Ltd<br />
        //       Phone: 900000000<br />
        //       303, 3rd Floor, Meridian Plaza,<br />
        //       beside Lal Bungalow, Ameerpet,<br />
        //       Hyderabad, Telangana 500016
        //     </p>
        //   </div>

        //   <h4 style="color: #333; font-size: 20px; font-weight: 600;">Order Items:</h4>

        //   <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        //     <thead style="background-color: #f0f0f0;">
        //       <tr>
        //         <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product Name</th>
        //         <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
        //         <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Price</th>
        //         <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">GST</th>
        //         <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total</th>
        //       </tr>
        //     </thead>
        //     <tbody>
        //       ${order.orderItems
        //         .map(
        //           (item) => `
        //         <tr>
        //           <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
        //           <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${
        //             item.quantity
        //           }</td>
        //           <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
        //             order.currency
        //           }${item?.price.toFixed(2)}</td>
        //           <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
        //             order.currency
        //           }${item?.gst_amount.toFixed(2)}</td>
        //           <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
        //             order.currency
        //           }${item?.total_price.toFixed(2)}</td>
        //         </tr>
        //       `
        //         )
        //         .join("")}
        //     </tbody>
        //   </table>

        //   <div>
        //   <p style="font-size: 14px; color: #555;"><span>Subtotal (with GST):</span> ${
        //     order.currency
        //   }${order.total_amount.toFixed(2)}</p>
        //   <p style="font-size: 14px; color: #555;"><span>Total GST:</span> ${
        //     order.currency
        //   }${order.gst_amount.toFixed(2)}</p>
        //   <p style="font-size: 14px; color: #555;"><span>Shipping:</span> ${
        //     order.currency
        //   }${order.shipping_charge.toFixed(2) || "0.00"}</p>
        //   <p style="font-size: 16px; color: #555;"><strong>Total:</strong> ${
        //     order.currency
        //   }${order.total_amount.toFixed(2)}</p>
        //   </div>

        //   <div style="margin-top: 30px; font-size: 16px; color: #555;">
        //     <p>Best regards,</p>
        //     <p><strong>Team Frame Ji</strong></p>
        //     <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us at <a href="mailto:hello@frameji.com" style="color: #1a73e8;">support@frameji.com</a></p>
        //   </div>
        //  `,
      });
      return res
        .status(200)
        .json({ status: "ok", message: "Order status updated successfully!" });
    } else if (req.body.status === "processing") {
      await Order.findByIdAndUpdate(order._id, body);

      const htmlContent = `
      <h3 style="color: #333;">Exciting news! Your order #${order?.orderID
        } has entered the processing phase. Our team is diligently preparing your items for dispatch. Rest assured, we're working hard to ensure everything is perfect for you.</h3>
      
      <p><strong>Order ID:</strong> ${order.orderID}</p>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Shipping Address:</strong></p>
        <p>
          ${order?.shippingInfo?.first_Name || ""} ${order?.shippingInfo?.last_Name || ""
        }<br />
          ${order?.shippingInfo?.phone_Number || ""}<br />
          ${order?.shippingInfo?.street || ""}, ${order?.shippingInfo?.city || ""
        }<br />
          ${order?.shippingInfo?.state || ""}, ${order?.shippingInfo?.postalCode || ""
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
              <td style="padding: 10px; border: 1px solid #ddd;">${item.name
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.price.toFixed(2)}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.gst_amount.toFixed(2)}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.total_price.toFixed(2)}</td>
            </tr>
          `
          )
          .join("")}
        </tbody>
      </table>
    
      <div>
      <p style="font-size: 14px; color: #555;"><span>Subtotal (with GST):</span> ${order.currency
        }${order.total_amount.toFixed(2)}</p>
      <p style="font-size: 14px; color: #555;"><span>Total GST:</span> ${order.currency
        }${order.gst_amount.toFixed(2)}</p>
      <p style="font-size: 14px; color: #555;"><span>Shipping:</span> ${order.currency
        }${order.shipping_charge.toFixed(2) || "0.00"}</p>
      <p style="font-size: 16px; color: #555;"><strong>Total:</strong> ${order.currency
        }${order.total_amount.toFixed(2)}</p>
      </div>
    
      
      
      <div style="margin-top: 30px; font-size: 16px; color: #555;">
        <p>Best regards,</p>
        <p><strong>Team Frame Ji</strong></p>
        <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us at <a href="mailto:hello@frameji.com" style="color: #1a73e8;">support@frameji.com</a></p>
      </div>
    `;

      await sendEmail({
        to: `${order?.user?.email}`, // Change to your recipient
        from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender
        subject: `Your Order #${order?.orderID} is in Processing!`,
        html: htmlContent,

        //         html: ` <h3 style="color: #333;  font-family: Arial, sans-serif;">Exciting news! Your order #${
        //           order?.orderID
        //         } has entered the processing phase. Our team is diligently preparing your items for dispatch. Rest assured, we're working hard to ensure everything is perfect for you.</h3>
        //          <strong style="color: #1b03a3; font-size: 16px"> Hi ${
        //            order?.shippingInfo?.first_Name
        //          },</strong>
        //                <h4 style="color: #333; font-family: Arial, sans-serif;">Order Status : Processing</h4>

        //   <h4 style="color: #333; font-family: Arial, sans-serif;">Any Discount :
        //          ${
        //            order?.isCouponUsed
        //              ? `Yes  ,Amount:${order?.currency}` +
        //                Number(order?.couponUsed?.discount_amount) +
        //                " ,  COUPON_CODE:" +
        //                order?.couponUsed?.coupon_code
        //              : "No Discount"
        //          }</h4>

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
        //     ${order?.orderItems
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
        //           order?.currency
        //         }${product.price}</td>
        //          <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
        //            order?.currency
        //          }${product?.gst_amount ? product?.gst_amount : 0}
        //                 </td>
        //                 <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
        //                   order?.currency
        //                 }${product.product_Subtotal}</td>

        //       </tr>
        //     `
        //       )
        //       .join("")}
        //        <tr>
        //       <th colspan="6" style="border: 1px solid #555; padding: 2px; text-align: right;">Total Amount :</th>
        //       <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
        //         order?.currency
        //       }${order?.total_amount}</td>

        //     </tr>
        //   </tbody>
        // </table>
        //         <h5 style="color: #333; font-family: Arial, sans-serif;">We'll send you another email with the tracking details as soon as your order is dispatched. If you have any questions or need assistance, feel free to reply to this email.</h5>
        //                 <h5 style="color: #333; font-family: Arial, sans-serif;">Thank you for choosing Tavisa!</h5>
        // <br/>
        //         <span style="color: #555; font-size: 13px;">Best regards,</span><br/>

        //         <span style="color: #555; font-size: 13px;">Team Tavisa</span>`,
      });
      return res
        .status(200)
        .json({ status: "ok", message: "Order status updated successfully!" });
    }
    // else if (body.status === "dispatched") {
    //   const noBalanceRemaining =
    //     order?.sales_items?.filter((e) => Number(e?.balance_quantity) > 0)
    //       ?.length === 0
    //       ? true
    //       : false;
    //   if (!noBalanceRemaining)
    //     return res
    //       .status(400)
    //       .json({ message: "Few items still have balance quantity!" });
    //   await OrderDispatchedEmail(parentData.email, order.order_id, body);
    //   await Invoice.updateMany(
    //     { order: order._id, status: { $in: ["processing"] } },
    //     { status: body.status, "status_timeline.dispatched": currentDate }
    //   );
    // } else if (body.status === "delivered") {
    //   await OrderDeliveredEmail(parentData.email, order.order_id);
    //   await Invoice.updateMany(
    //     { order: order._id, status: { $in: ["processing", "dispatched"] } },
    //     { status: body.status, "status_timeline.delivered": currentDate }
    //   );
    // }
    else if (req.body.status === "dispatched") {
      body["courier_name"] = req.body.courierName;
      body["courier_tracking_id"] = req.body.TrackingID;
      await Order.findByIdAndUpdate(order._id, body);

      const htmlContent = `
      <h3 style="color: #333;">Exciting news! Your order #${order?.orderID
        } has been dispatched and is en route to you. 🚚 Here are the details:</h3>
     <h4 style="color: #333;  font-family: Arial, sans-serif;">Courier Name : ${req.body.courierName
        } </h4>
        <h4 style="color: #333;  font-family: Arial, sans-serif;">Courier Tracking ID : ${req.body.TrackingID
        }</h4>
      
      <p><strong>Order ID:</strong> ${order.orderID}</p>
          <p style="color: #333; font-family: Arial, sans-serif;">Any Discount :
         ${order?.isCouponUsed
          ? `Yes  ,Amount:${order?.currency}` +
          Number(order?.couponUsed?.discount_amount) +
          " ,  COUPON_CODE:" +
          order?.couponUsed?.coupon_code
          : "No Discount"
        }</p>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Shipping Address:</strong></p>
        <p>
          ${order?.shippingInfo?.first_Name || ""} ${order?.shippingInfo?.last_Name || ""
        }<br />
          ${order?.shippingInfo?.phone_Number || ""}<br />
          ${order?.shippingInfo?.street || ""}, ${order?.shippingInfo?.city || ""
        }<br />
          ${order?.shippingInfo?.state || ""}, ${order?.shippingInfo?.postalCode || ""
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
              <td style="padding: 10px; border: 1px solid #ddd;">${item.name
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.price.toFixed(2)}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.gst_amount.toFixed(2)}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
              }${item?.total_price.toFixed(2)}</td>
            </tr>
          `
          )
          .join("")}
        </tbody>
      </table>
    
      <div>
      <p style="font-size: 14px; color: #555;"><span>Subtotal (with GST):</span> ${order.currency
        }${order.total_amount.toFixed(2)}</p>
      <p style="font-size: 14px; color: #555;"><span>Total GST:</span> ${order.currency
        }${order.gst_amount.toFixed(2)}</p>
      <p style="font-size: 14px; color: #555;"><span>Shipping:</span> ${order.currency
        }${order.shipping_charge.toFixed(2) || "0.00"}</p>
      <p style="font-size: 16px; color: #555;"><strong>Total:</strong> ${order.currency
        }${order.total_amount.toFixed(2)}</p>
      </div>
    
      
      
      <div style="margin-top: 30px; font-size: 16px; color: #555;">
        <p>Best regards,</p>
        <p><strong>Team Frame Ji</strong></p>
        <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us at <a href="mailto:hello@frameji.com" style="color: #1a73e8;">support@frameji.com</a></p>
      </div>
    `;

      await sendEmail({
        to: `${order?.user?.email}`, // Change to your recipient
        from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender
        subject: `Your Order #${order?.orderID} is On Its Way!`,
        html: htmlContent,
        //         html: `<strong style="color: #1b03a3; font-size: 16px"> Hi ${
        //           order?.shippingInfo?.first_Name
        //         },</strong>
        //         <h3 style="color: #333;  font-family: Arial, sans-serif;">Exciting news! Your order #${
        //           order?.orderID
        //         } has been dispatched and is en route to you. 🚚 Here are the details:</h3>

        //         <h4 style="color: #333;  font-family: Arial, sans-serif;">Courier Name : ${
        //           req.body.courierName
        //         } </h4>
        //         <h4 style="color: #333;  font-family: Arial, sans-serif;">Courier Tracking ID : ${
        //           req.body.TrackingID
        //         }</h4>

        //           <h4 style="color: #333; font-family: Arial, sans-serif;">Any Discount :
        //          ${
        //            order?.isCouponUsed
        //              ? `Yes  ,Amount:${order?.currency}` +
        //                Number(order?.couponUsed?.discount_amount) +
        //                " ,  COUPON_CODE:" +
        //                order?.couponUsed?.coupon_code
        //              : "No Discount"
        //          }</h4>
        //         <h4 style="color: #333; font-family: Arial, sans-serif;"> Items :</h4>
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
        //     ${order?.orderItems
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
        //           order?.currency
        //         }${product.price}</td>
        //          <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
        //            order?.currency
        //          }${product?.gst_amount ? product?.gst_amount : 0}
        //                 </td>
        //                 <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
        //                   order?.currency
        //                 }${product.product_Subtotal}</td>

        //       </tr>
        //     `
        //       )
        //       .join("")}
        //        <tr>
        //       <th colspan="6" style="border: 1px solid #555; padding: 2px; text-align: right;">Total Amount :</th>
        //       <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
        //         order?.currency
        //       }${order?.total_amount}</td>
        //     </tr>
        //   </tbody>
        // </table>
        //  <h3 style="color: #333; font-family: Arial, sans-serif;">Order Status : Dispatched</h3>
        //         <h4 style="color: #333; font-family: Arial, sans-serif;">If you have any questions or need assistance, feel free to reply to this email.
        // </h4>
        // <h5 style="color: #333; font-family: Arial, sans-serif;">Thanks for choosing Tavisa! We hope you enjoy your purchase.
        // </h5>
        // <br/>
        //         <span style="color: #555; font-size: 13px;">Best regards,</span><br/>

        //         <span style="color: #555; font-size: 13px;">Team Tavisa</span>`,
      });
      return res
        .status(200)
        .json({ status: "ok", message: "Order status updated successfully!" });
    } else if (req.body.status === "delivered") {
      body["isDelivered"] = true;
      body["DeliveredDate"] = req.body.DDate;
      await Order.findByIdAndUpdate(order._id, body);
      await sendEmail({
        to: `${order?.user?.email}`, // Change to your recipient
        from: `${process.env.SEND_EMAIL_FROM}`, // Change to your verified sender
        subject: `Your Order #${order?.orderID} Has Been Delivered!`,
        html: `<strong style="color: #1b03a3; font-size: 16px"> Hi ${order?.shippingInfo?.first_Name
          },</strong>
              <h3 style="color: #333;  font-family: Arial, sans-serif;">Great news! Your order #${order?.orderID
          } has been successfully delivered to your doorstep. We hope everything is just as you expected!</h3>
              <h4 style="color: #333; font-family: Arial, sans-serif;">Any Discount :
         ${order?.isCouponUsed
            ? `Yes  ,Amount:${order?.currency}` +
            Number(order?.couponUsed?.discount_amount) +
            " ,  COUPON_CODE:" +
            order?.couponUsed?.coupon_code
            : "No Discount"
          }</h4> 

         <div style="margin-bottom: 20px;">
    <p><strong>Shipping Address:</strong></p>
    <p>
      ${order?.shippingInfo?.first_Name || ""} ${order?.shippingInfo?.last_Name || ""
          }<br />
      ${order?.shippingInfo?.phone_Number || ""}<br />
      ${order?.shippingInfo?.street || ""}, ${order?.shippingInfo?.city || ""
          }<br />
      ${order?.shippingInfo?.state || ""}, ${order?.shippingInfo?.postalCode || ""
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
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity
                }</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
                }${item?.price.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
                }${item?.gst_amount.toFixed(2)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${order.currency
                }${item?.total_price.toFixed(2)}</td>
        </tr>
      `
            )
            .join("")}
    </tbody>
  </table>

  <div>
  <p style="font-size: 14px; color: #555;"><span>Subtotal (with GST):</span> ${order.currency
          }${order.total_amount.toFixed(2)}</p>
  <p style="font-size: 14px; color: #555;"><span>Total GST:</span> ${order.currency
          }${order.gst_amount.toFixed(2)}</p>
  <p style="font-size: 14px; color: #555;"><span>Shipping:</span> ${order.currency
          }${order.shipping_charge.toFixed(2) || "0.00"}</p>
  <p style="font-size: 16px; color: #555;"><strong>Total:</strong> ${order.currency
          }${order.total_amount.toFixed(2)}</p>
  </div>

  
  
  <div style="margin-top: 30px; font-size: 16px; color: #555;">
    <p>Best regards,</p>
    <p><strong>Team Frame Ji</strong></p>
    <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact us at <a href="mailto:hello@frameji.com" style="color: #1a73e8;">support@frameji.com</a></p>
  </div> 
        `,
      });

      return res
        .status(200)
        .json({ status: "ok", message: "Order status updated successfully!" });
    } else {
      // await Order.findByIdAndUpdate(order._id, body);
      // console.log(order);
      res
        .status(200)
        .json({ status: "ok", message: "Order status updated successfully!" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error?.message || "Something went wrong!" });
  }
};
