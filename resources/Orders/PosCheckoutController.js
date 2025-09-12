import { shippingAddress } from "../ShippingAddresses/ShippingAddressModel.js";
import { Order } from "./orderModel.js";

import sendEmail from "../../Utils/sendEmail.js";
//generate unique order id
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

export const poscreateOrderCheckout = async (req, res) => {
  try {
    const { userr, address, cart, subtotal, orderType } = req.body;

    // Perform validation
    if (cart.length < 1)
      return res.status(400).json({ message: "Cart is empty!" });
    if (!address)
      return res
        .status(404)
        .json({ message: "Please select a shipping address!" });
    if (!subtotal)
      return res
        .status(404)
        .json({ message: "Please provide the product subtotal!" });
    if (!userr) return res.status(400).json({ message: "User is not defined" });

    // Retrieve shipping address from database
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

    // Construct order items array
    const orderItems = cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      variant_Name: item.variant.variant_Name,
      price: Number(item.variant.price),
      total_price: item.quantity * Number(item.variant.price),
      image: item.product.image,
      quantity: item.quantity,
      gst_amount: Number(
        (Number(item.variant.price) * item.variant.gst_Id?.tax) / 100
      )?.toFixed(3),
      total_gst_amount: Number(
        Number(item.quantity) *
          Number((Number(item.variant.price) * item.variant.gst_Id?.tax) / 100)
      )?.toFixed(3),
      gst_rate: item.variant.gst_Id?.tax,
      tax_Name: item.variant?.gst_Id?.name,
      product_Subtotal: Number(
        Number(item.quantity * Number(item.variant.price)) +
          Number(
            Number(item.quantity) *
              Number(
                (Number(item.variant.price) * item.variant.gst_Id?.tax) / 100
              )
          )
      ).toFixed(3),
    }));

    // Generate a unique order ID
    const Id = await generateUniqueOrderId();

    // Create the order document
    const order = await Order.create({
      orderID: Id,
      total_amount: subtotal,
      orderItems,
      shippingInfo: shipping,
      user: userr,
      orderType,
      paymentMode: "cod",
      payment_status: "success",
      isPaid: true,
      paidAt: new Date().toISOString(),
    });
    // console.log(order);
    // Find the user associated with the order
    const orderWithUser = await Order.findById(order._id).populate("user");

    if (!orderWithUser) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const user = orderWithUser.user;
    const userEmail = user.email;

    // Send email after order creation
    await sendEmail({
      to: userEmail,
      from: `${process.env.SEND_EMAIL_FROM}`,
      subject: `Your Order #${order?.orderID} Confirmation`,
      html: ` <h1 style="color: #333; text-align: center; font-family: Arial, sans-serif;">Welcome to Smellika - Let the Shopping Begin!</h1>
      <strong style="color: #1b03a3; font-size: 16px"> Hi ${
        order?.shippingInfo?.first_Name
      },</strong>
      
       <p style="color: #555; font-size: 15px;">Great news! Your order #${
         order?.orderID
       } has been confirmed. Here are the details</p>            
<h4 style="color: #333; font-family: Arial, sans-serif;">Shipping Address : ${
        order?.shippingInfo?.first_Name
      }  ${order?.shippingInfo?.last_Name} , ${order?.shippingInfo?.street} ${
        order?.shippingInfo?.city
      } ${order?.shippingInfo?.state} ${order?.shippingInfo?.country}, PIN-${
        order?.shippingInfo?.postalCode
      }, Phone Number: ${order?.shippingInfo?.phone_Number}
      ${
        order?.shippingInfo?.company_name
          ? ",Company Name :" + order?.shippingInfo?.company_name + ""
          : ""
      } ${
        order?.shippingInfo?.gst_number
          ? ", GST_NO:" + order?.shippingInfo?.gst_number
          : ""
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
   ${order?.orderItems
     ?.map(
       (product, index) => `
     <tr>
             <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
               index + 1
             }</td>

       <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
         product.name
       }</td>
         <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
           product?.variant_Name
         }</td>
               <td style="border: 1px solid #555; padding: 2px; text-align: center;"><img src="${
                 product?.image[0]?.url
               }" alt="${
         product.name
       }"  style="max-width: 40px; height: auto;"></td>

       <td style="border: 1px solid #555; padding: 2px; text-align: center;">${
         product.quantity
       }</td>
       <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${
         product.price
       }</td>
        <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${
          product?.gst_amount
        }</td>
               <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${
                 product?.product_Subtotal
               }</td>

     </tr>
   `
     )
     .join("")}
      <tr>
     <th colspan="7" style="border: 1px solid #555; padding: 2px; text-align: right;">Total Amount :</th>
     <td style="border: 1px solid #555; padding: 2px; text-align: center;">₹${
       order?.total_amount
     }</td>
   </tr>
 </tbody>
</table>

<br/>
       <span style="color: #555; font-size: 13px;">Best regards,</span><br/>
       
       <span style="color: #555; font-size: 13px;">Team Smellika</span>`,
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
