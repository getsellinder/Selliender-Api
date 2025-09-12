// import express from "express";
// import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

// import {
//   addDesign,
//   deleteDesign,
//   getDesign,
//   updateDesign,
// } from "./designController.js";
// const router = express.Router();

// router
//   .route("/add")
//   .post(isAuthenticatedUser,authorizeRoles("admin", "Customer"), addDesign);
// router.route("/getDesigns").get(getDesign);
// router
//   .route("/update/:_id")
//   .patch(isAuthenticatedUser,authorizeRoles("admin", "Customer"), updateDesign);
// router
//   .route("/delete/:_id")
//   .delete(isAuthenticatedUser,authorizeRoles("admin", "Customer"), deleteDesign);

// export default router;
import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../../middlewares/auth.js";

import {
  addDesign,
  deleteDesign,
  getDesign,
  updateDesign,
} from "./designController.js";
import multer from "multer";
import path from "path";
const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploades");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
// const jsonStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploades");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });
// const imageUpload = multer({ storage: imageStorage }).any();

// const jsonUpload = multer({ storage: jsonStorage }).fields([
//   { name: "designImageJson", maxCount: 1 },
// ]);

router
  .route("/add")
  .post(isAuthenticatedUser, authorizeRoles("admin", "Customer"), addDesign);
router.route("/getDesigns").get(getDesign);
router
  .route("/update/:_id")
  .patch(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    updateDesign
  );
router
  .route("/delete/:_id")
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "Customer"),
    deleteDesign
  );

export default router;
