import mongoose from "mongoose";
const { Schema, model } = mongoose;

const chapterSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: [35, "name cannot exceed 25 characters"],
      required: [true, "Please Enter Chapter Name"],
      trim: true,
      // unique: true,
    },

    master_price: {
      type: Number,
      required: true,
    },
    sale_price: { type: Number, required: true },
    master_GST: {
      type: mongoose.Schema.ObjectId,
      ref: "Tax",
      required: false,
    },
    description: {
      type: String,
      maxLength: [400, "description cannot exceed 100 characters"],
      required: [true, "Please Enter Chapter Description"],
    },
    shipping_charge: {
      type: Number,
      required: true,
    },

    special_instructions: {
      type: String,
    },
    variants: [
      {
        variant_Name: { type: String, default: "" },
        weight: { type: Number, default: 0 },
        volume: { type: Number, default: 0 },
        price: { type: String, default: "" },

        gst_Id: {
          type: mongoose.Schema.ObjectId,
          ref: "Tax",
        },
      },
    ],
    image: [
      {
        public_id: {
          type: String,
          // required: true,
        },
        url: {
          type: String,
          // required: true,
        },
      },
    ],

    // Rating and Review Functionality
    colors: [
      {
        _id: {
          type: String, // Can be a unique identifier for each color
          required: true,
        },
        colorName: {
          type: String,
          required: true,
        },
        colorCode: {
          type: String,
          required: true,
        },
      },
    ],
    defaultColor: {
      type: String,
      default: null, // Set default color to null initially
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxLength: [500, "Comment can not exceed 500 characters"],
        },
        reviewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    chapter_Status: {
      type: String,
      enum: ["Active", "inActive"],
      default: "Active",
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate the average rating and update the number of reviews
chapterSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.averageRating = totalRating / this.reviews.length;
    this.numberOfReviews = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.numberOfReviews = 0;
  }
  next();
});

// Create a case-insensitive unique index for title
chapterSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export const Chapter = model("Chapter", chapterSchema);
