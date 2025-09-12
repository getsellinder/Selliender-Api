import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    blog_content: {
      type: Object,
      required: [true, "Content is required"],
    },
  },
  { timestamps: true }
);

// Create a case-insensitive unique index for title
blogSchema.index(
  { title: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

const Blog = model("Blog", blogSchema);

export default Blog;
