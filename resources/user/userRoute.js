import express from "express";
import {
  registerUser,
  loginUser,
  AddCusstomer,
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

const router = express.Router();

router.route("/user/register").post(registerUser);
router.route("/user/otp").post(VarificationOTP);

//login and signin from google
router.route("/user/googleLoginSingin").post(googleSigninAndLogin);
// router.route("/google/callback").get(googlelogin);
router.route("/google/callback").post(googlelogin);

// router.get("/google", (req, res) => {
//   const scope = [
//     "https://www.googleapis.com/auth/userinfo.email",
//     "https://www.googleapis.com/auth/userinfo.profile",
//   ].join(" ");

//   const redirectUri = "http://localhost:5000/google/callback";

//   const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

//   res.redirect(authUrl);
// });

router.route("/user/login").post(loginUser);

router.route("/user/password/forgot").post(forgotPassword);

router.route("/user/password/reset/:token").put(resetPassword);

router.route("/user/logout").get(logout);

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
  .route("/admin/employee")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    getAllEmployee
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

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "Customer"), getSingleUser);

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
