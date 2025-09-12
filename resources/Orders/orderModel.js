import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    shippingInfo: {
      first_Name: {
        type: String,
        required: true,
      },
      last_Name: {
        type: String,
        required: true,
      },
      phone_Number: {
        type: Number,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
        trim: true,
        // Add a regular expression to enforce a specific postal code format
        // For example, assuming a 5-digit format for the United States
        match: /^\d{6}$/,
      },
      country: {
        type: String,
        required: true,
      },
      // company_name: {
      //   type: String,
      // },
      // gst_number: {
      //   type: String,
      // },
      addressId: {
        type: mongoose.Schema.ObjectId,
        ref: "ShippingAddress",
        required: true,
      },
    },
    orderItems: [
      {
        name: {
          type: String,
          default: "",
        },
        variant_Name: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          default: "",
        },
        total_price: {
          type: Number,
          default: "",
        },
        color: {
          colorCode: {
            type: String,
            default: "",
          },
          colorName: {
            type: String,
            default: "",
          },
        },
        quantity: {
          type: Number,
          default: "",
          default: 1,
        },
        image: [{}],

        product_Subtotal: {
          type: Number,
          default: "",
        },
        gst_amount: {
          type: Number,
          default: "",
        },
        gst_rate: {
          type: Number,
          default: "",
        },
        gst_Name: {
          type: String,
          default: "",
        },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
      },
    ],

    shipping_charge: { type: Number, default: 0 },
    gst_amount: { type: Number, default: 0 },
    total_amount: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },

    paymentMode: {
      type: String,
      enum: ["online", "cod"],
      default: "online",
    },
    currency: {
      type: String,
      default: "",
    },
    orderType: {
      type: String,
      enum: ["WebSite", "PointOfSale"],
      default: "WebSite",
    },
    payment_status: {
      type: String,
      enum: ["pending", "success", "failed"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isCouponUsed: {
      type: Boolean,
      default: false,
    },
    couponUsed: { type: mongoose.Schema.ObjectId, ref: "Affiliate" }, // Reference to the Coupon model

    orderStatus: {
      type: String,
      enum: [
        "new",
        "processing",
        "dispatched",
        "delivered",
        "cancelled",
        "returned",
        "unpaid",
      ],
      default: "new",
    },

    // paypal_payer_id: { type: String },
    // stripe_payment_id: { type: String },

    // stripe_Payment_session_Id: { type: String },
    // stripe_payment_intent: { type: String },
    // stripe_Payment_receipt_url: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String },
    // paypal_signature: { type: String },
    // order_used: { type: Boolean, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    DeliveredDate: { type: String, default: "" },

    // deliveredAt: { type: Date },
    status_timeline: {
      new: { type: Date },
      processing: { type: Date },
      dispatched: { type: Date },
      delivered: { type: Date },
      cancelled: { type: Date },
      returned: { type: Date },
    },
    iscancelled: {
      type: Boolean,
      default: false,
    },
    order_Cancelled_Reason: {
      type: String,
    },
    courier_name: { type: String },
    courier_tracking_id: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
