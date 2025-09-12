import { Order } from "./orderModel.js";
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";
import axios from "axios";
import mongoose from "mongoose";
import { shippingAddress } from "../ShippingAddresses/ShippingAddressModel.js";
//paypal client id get
export const getClientId = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      clientId: PAYPAL_CLIENT_ID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
//generate unique order id
const generateOrderId = async () => {
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

//* Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
//  https://developer.paypal.com/api/rest/authentication/
//  */
const generateAccessToken = async () => {
  const credentials = `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`;
  const base64Credentials = Buffer.from(credentials).toString("base64");

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${base64Credentials}`,
  };

  const data = "grant_type=client_credentials";

  try {
    const response = await axios.post(`${base}/v1/oauth2/token`, data, {
      headers: headers,
    });
    // console.log("response.data", response.data);
    const accessToken = response.data?.access_token;
    return accessToken;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response ? error.response.data : error.message
    );
  }
};

const handleResponse = async (response) => {
  try {
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        responseData: response.data,
        httpStatusCode: response.status,
      };
    }
  } catch (err) {
    const errorMessage = await response.statusText;
    throw new Error(errorMessage);
  }
};

// https://developer.paypal.com/docs/api/orders/v2/#orders_create

export const createOrderCheckout = async (req, res) => {
  try {
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
    const orderItems = await cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
      product_subtotal: item.subtotal,
      price_With_Tax: 0,
      taxId: "",
    }));
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
    req.body.user = req.user._id;
    const Id = await generateOrderId();
    const order = await Order.create({
      orderID: Id,
      total_amount: subtotal,
      orderItems,
      shippingInfo: shipping,
      user: req.user._id,
    });
    if (order) {
      const accessToken = await generateAccessToken();
      const url = `${base}/v2/checkout/orders`;
      const createOrderRequest = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: subtotal, //"60.00" Replace with the actual amount
              //optional product product total value
              // breakdown: {
              //   item_total: {
              //     currency_code: "USD",
              //     value: "60.00", // Replace with the total value of all items
              //   },
              // },
            },
            //optional give product product also show in paypal dashboard
            // items: [
            //   {
            //     name: "Apple",
            //     unit_amount: {
            //       currency_code: "USD",
            //       value: "60.00", // Replace with the actual item price
            //     },
            //     quantity: 1,
            //   },
            // ],
          },
        ],
      };
      const response = await axios.post(
        url,
        JSON.stringify(createOrderRequest),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        let paymentOrderId = await Order.findById(order?._id);
        paymentOrderId.paypal_payment_id = response.data?.id;
        await paymentOrderId.save();
        return res.status(201).json({
          success: true,
          responseData: response.data,
          product_orderId: order?._id,
          httpStatusCode: response.status,
        });
      } else {
        // Handle errors or unexpected status codes
        console.error("Error:", response.status, response.statusText);

        //  Optionally, you can parse the error response as JSON if available
        try {
          const errorData = response.data;
          console.error("Error Data:", errorData);
        } catch (error) {
          console.error("Error parsing error data:", error.message);
        }
      }
    }
  } catch (error) {
    const errorMessage = await error.message;
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Capture payment for the created order to complete the transaction.
 * //see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */

const captureOrder = async (orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;
  const response = await axios.post(
    url,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      },
    }
  );
  return handleResponse(response);
};

export const captureOrderPayment = async (req, res) => {
  try {
    const { orderID } = req.params;

    const { responseData, httpStatusCode } = await captureOrder(orderID);
    const payment = await Order.findOne({
      paypal_payment_id: responseData?.id,
    });
    // Handle different transaction statuses
    if (responseData?.status === "COMPLETED") {
      payment.paypal_payer_id = responseData.payer?.payer_id;
      payment.paidAt = Date.now();
      payment.isPaid = true;
      payment.payment_status = "success";
      payment.orderStatus = "new";
      await payment.save();
    } else if (responseData?.status === "PENDING") {
      console.log("Payment is pending.");
      payment.paypal_payer_id = responseData.payer?.payer_id;
      payment.paidAt = Date.now();
      payment.payment_status = "pending";
      await payment.save();
    } else if (responseData?.status === "FAILED") {
      payment.paypal_payer_id = responseData.payer?.payer_id;
      payment.paidAt = Date.now();
      payment.payment_status = "failed";
      await payment.save();
    }

    return res.status(httpStatusCode).json(responseData);
  } catch (error) {
    // console.error("Failed to create order:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to capture order." });
  }
};
