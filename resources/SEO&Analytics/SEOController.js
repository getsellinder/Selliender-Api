import { SeoRequest } from "./SEOModel.js";

export const AddNewSeoRequest = async (req, res) => {
  try {
    // Check if an SEO request already exists
    let existingSeoRequest = await SeoRequest.findOne();

    // console.log(req.body);

    if (existingSeoRequest) {
      // Update the existing SEO request with new values
      existingSeoRequest.GoogleTag = req.body.GoogleTag;
      existingSeoRequest.FacebookPixel = req.body.FacebookPixel;
      existingSeoRequest.GoogleAnalytics = req.body.GoogleAnalytics;
      existingSeoRequest.MicrosoftClarity = req.body.MicrosoftClarity;

      // Save the updated SEO request
      await existingSeoRequest.save();

      // Send response indicating the SEO request was updated
      return res.status(200).json({
        success: true,
        seorequest: existingSeoRequest,
        message: "SEO Request Updated Successfully",
      });
    } else {
      // If no existing SEO request, create a new one
      const newSeoRequest = await SeoRequest.create(req.body);

      // Send response indicating the SEO request was added
      return res.status(201).json({
        success: true,
        seorequest: newSeoRequest,
        message: "SEO Request Added Successfully",
      });
    }
  } catch (error) {
    // Handle any errors and send a 500 response
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
export const ViewSeoRequest = async (req, res) => {
  try {
    // Fetch the existing SEO request (assuming only one record exists)
    const seoRequest = await SeoRequest.findOne();
    // console.log("seoRequest", seoRequest);

    if (seoRequest) {
      // If SEO request is found, send it in the response
      return res.status(200).json({
        success: true,
        seorequest: seoRequest,
      });
    } else {
      // If no SEO request exists, send a response indicating no data
      return res.status(404).json({
        success: false,
        message: "No SEO Request Found",
      });
    }
  } catch (error) {
    // Handle any errors and send a 500 response
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
