import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getSingleUser,
  getUserOrderForAdmin,
  getAllEmployee,
  deleteEmployeeById,
  updateEmployeeById,
  googleSigninAndLogin,
  Mywishlist,
  removeFromWishlist,
  AddproductTowishlist,
  getAllAdminUsers,
  getAllUsers,
  VarificationOTP,
  googlelogin,
  AddEmploye,
} from "./userController.js";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";
import { rolesAdmin } from "../../Utils/authorizeRoles.js";
import { AddCusstomer } from "../customers/Customer.Controller.js";

const router = express.Router();

router.route("/user/register").post(registerUser);
router.route("/user/login").post(loginUser);

router.route("/user/otp").post(VarificationOTP);

//login and signin from google
router.route("/user/googleLoginSingin").post(googleSigninAndLogin);
// router.route("/google/callback").get(googlelogin);
router.route("/google/callback").post(googlelogin);

router.route("/user/password/forgot").post(forgotPassword);

router.route("/user/password/reset").put(resetPassword);

router.route("/user/logout").get(logout);
// router
//   .route("/admin/customer")
//   .get(
//     isAuthenticatedUser,
//     authorizeRoles("admin", "Customer"),
//     getAllCustomer
//   );

router.route("/user/details").get(isAuthenticatedUser, getUserDetails);

// router.route("/getAllUsers").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers);

router.route("/getAllUsers").get(getAllUsers);

router
  .route("/admin/users")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getAllAdminUsers
  );

router
  .route("/admin/delete-employee/:id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteEmployeeById
  );

router
  .route("/admin/update-employee/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateEmployeeById
  );
router
  .route("/admin/users/orders/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getUserOrderForAdmin
  );

router.route("/admin/user/:id").get(getSingleUser);

router.route("/user/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/user/update/profile").put(isAuthenticatedUser, updateProfile);
///my wishList Fuctionality
router
  .route("/user/wishlist/add")
  .post(isAuthenticatedUser, AddproductTowishlist);
router
  .route("/user/wishlist/remove")
  .post(isAuthenticatedUser, removeFromWishlist);
router.route("/user/my_wishlist").get(isAuthenticatedUser, Mywishlist);

router.post(
  "/create/customer",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  AddCusstomer
);

router.post(
  "/add/employe",
  isAuthenticatedUser,
  authorizeRoles(...rolesAdmin),
  AddEmploye
);

export default router;
