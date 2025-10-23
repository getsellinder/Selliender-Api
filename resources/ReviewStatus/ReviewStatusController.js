// controllers/reviewStatusController.js
import { ReviewStatusModel } from "./ReviewStatusModel.js";

// Get the review status (single global value)
export const getReviewStatus = async (req, res) => {
  
  try {
    // Find the review status (assuming only one record)
    const reviewStatus = await ReviewStatusModel.findOne();

    if (!reviewStatus) {
      return res.status(404).json({ message: "Review status not set yet." });
    }

    return res.status(200).json({
      success: true,
      review_status: reviewStatus.reviews_status,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Update the review status (single global value)
export const updateReviewStatus = async (req, res) => {
  const { status } = req.body; // The status value (true or false)
  
  // if (!req?.user) return res.status(400).json({ message: "please login !" });
  if (typeof status !== "boolean") {
    return res
      .status(400)
      .json({ message: "Invalid status value. It should be true or false." });
  }

  try {
    // If there is no existing record, create one (first-time setup)
    const existingStatus = await ReviewStatusModel.findOne();

    if (existingStatus) {
      // Update the existing review status
      existingStatus.reviews_status = status;
      await existingStatus.save();
    } else {
      // Create a new review status record if none exists
      const newStatus = new ReviewStatusModel({ reviews_status: status });
      await newStatus.save();
    }

    return res.status(200).json({
      success: true,
      message: `Review status updated to ${status ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};
