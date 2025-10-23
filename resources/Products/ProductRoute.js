import express from "express";
import {
  createNewProduct,
  getAllProductAdmin,
  updateProduct,
  deleteProduct,
  getOneProduct,
  deleteImageFromCloudinary,
  getProductsByCategory,
  getAllProductUser,
  getAllProductsDevicesFirst,
  ChangeProductStatus,
  ChangeFeatueProductStatus,
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getProductByName,
} from "./ProductController.js";
const router = express.Router();
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
router
  .route("/product/create/")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    createNewProduct
  );
router
  .route("/product/getAll/admin/")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getAllProductAdmin
  );

//change Product status
router.route("/product/admin/status/:id").patch(ChangeProductStatus);
router
  .route("/product/admin/feature_product/status/:id")
  .patch(ChangeFeatueProductStatus);

//get all product user
router.route("/product/getAll/user/").get(getAllProductUser);

router
  .route("/product/getAllProductsDevicesFrist/")
  .get(getAllProductsDevicesFirst);
router.route("/product/getOne/:id").get(getOneProduct);
router.route("/product/getByName/:name").get(getProductByName);
router
  .route("/product/update/:id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateProduct
  );
router
  .route("/product/delete/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteProduct
  );
router
  .route("/product/deleteImage/jatinMor/product/:public_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteImageFromCloudinary
  );
router.route("/products/category/:categoryName").get(getProductsByCategory);
//review Functionality
router
  .route("/product/:productId/reviews")
  .post(isAuthenticatedUser, addReview);

// router.post('/products/:productId/reviews', );

// Route to get all reviews for a product
router.get("/product/:productId/reviews", getReviews);

// Route to update a review
router.put("/product/:productId/reviews", isAuthenticatedUser, updateReview);

// Route to delete a review
router.delete("/product/:productId/reviews", isAuthenticatedUser, deleteReview);

//
export default router;
