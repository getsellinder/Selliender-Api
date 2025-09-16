import React from "react";

//  DashBoard
const Change_Password = React.lazy(() =>
  import("./views/pages/register/Change_password")
);


import EditProfile from "./views/Profile/EditProfile";
const Dashboard = React.lazy(() => import("./views/dashboard/Dashboard"));
const Reports = React.lazy(() => import("./views/reports/reports"));
///

//social media,address,logo
import Socialmedia from "./views/configuration/Socialmedia.js";
import Address from "./views/configuration/Address.js";
import Logo from "./views/configuration/Logo.js";
import Login from "./views/pages/login/Login";
import Web_Images from "./views/configuration/Web_Images";

// Appointments


//Businesses

// import Products from "./views/Products/Products";
// import Topics from "./views/Chapters/topics.js";

//product

import EditPrdAndImg from "./views/Products/EditPrdAndImg";
import ViewProduct from "./views/Products/ViewProduct";

//Order Management
import NewOrders from "./views/orders/NewOrders.js";

import ReturnedOrders from "./views/orders/ReturnedOrders.js";

import AddOrder from "./views/orders/AddOrder";


//Taxes
import Tax from "./views/configuration/tax/Tax";
import Addtax from "./views/configuration/tax/Addtax";
import Edittax from "./views/configuration/tax/Edittax";
import EditOrder from "./views/orders/EditOrder";
import ViewOrders from "./views/orders/ViewOrders";


import ApplicationName from "./views/configuration/ApplicationName";
import CopyrightMessage from "./views/configuration/CopyrightMessage";
import ContactRequests from "./views/ContactRequests/ContactRequests";
import AddContactRequest from "./views/ContactRequests/AddContactRequest";



import Testimonials from "./views/Testimonials/Testimonials";
import AddTestimonial from "./views/Testimonials/AddTestimonial";
import ViewTestimonial from "./views/Testimonials/ViewTestimonial";



// import Collections from "./views/Collections/collections";
// import Colors from "./views/Color/color";
import Content from "./views/Content/content";

import EditPrivacyPolicy from "./views/Content/editPrivacyPolicy";
import EditTermsConditions from "./views/Content/editTermsConditions";
import EditShippingPolicy from "./views/Content/editShippingPolicy";
import EditRefundpolicy from "./views/Content/editRefundPolicy";
import EditAboutUs from "./views/Content/editAboutUs";

// import EditUserAddress from "./views/customerDetails/editUserAddress";
// import AddUserAddress from "./views/customerDetails/addUserAddress";
import viewDetails from "./views/customerDetails/viewDetails";
import Design from "./views/Design/design";
import Banners from "./views/Banner/banner";
import RegisterImage from "./views/Images/RegisterImage";
import LoginImage from "./views/Images/LoginImage";
import ShopImage from "./views/Images/ShopImage";
//Affiliate
// import Coupons from "./views/Affiliate/Coupons";
// import Affiliates from "./views/Affiliate/Affiliates";
// import CreateCoupon from "./views/Affiliate/CreateCoupon";
// import CreateAffiliate from "./views/Affiliate/CreateAffiliate";
// import EditAffiliate from "./views/Affiliate/EditAffiliate";
// import EditCoupon from "./views/Affiliate/EditCoupon";
// import PayAffiliate from "./views/Affiliate/PayAffiliate";
// import AffiliateHistory from "./views/Affiliate/AffiliateHistory";
// import CouponHistory from "./views/Affiliate/CouponHistory";
import SupportRequest from "./views/CustomerSupport/SupportRequest";
import SupportReply from "./views/CustomerSupport/SupportReply";
import SupportRequestClosed from "./views/CustomerSupport/SupportRequestClosed";
import CloseRequestView from "./views/CustomerSupport/CloseRequestView";
import EditTestimonial from "./views/Testimonials/EditTestimonial";

import Home from "./views/Home/home";
import EditPanel1 from "./views/Home/editPanel1";
import EditPanel2 from "./views/Home/editPanel2";
import EditPanel3 from "./views/Home/editPanel3";
import Editpanel4 from "./views/Home/editPanel4";
import CustomerTable from "./views/customerDetails/customerTable";
import SingleUserAllDetails from "./views/customerDetails/singleUserAllDetails";
import Charts from "./views/Charts/RevenueCharts";
import UserCharts from "./views/Charts/UserChart";
import ProductrevenueCharts from "./views/Charts/ProductRevenue";
import StateRevenueCharts from "./views/Charts/Staterevenue";
import CityRevenueCharts from "./views/Charts/CityRevenue";
import { element } from "prop-types";
import OrderdayChart from "./views/Charts/OrderDaywise";
import RevenueCharts from "./views/Charts/RevenueCharts";
import AddCustomer from "./views/customerDetails/addCustomer";
import Pos from "./views/PointOfSale/Pos";
import InStoreCashOrders from "./views/orders/InStoreCashOrders";
import POSViewOrders from "./views/orders/POSViewOrders";
import InStoreQRCodeOrders from "./views/orders/InStoreQRCodeOrders";
import EmailCms from "./views/CustomerSupport/EmailCMS/EmailCms";
import RegistrationEmail from "./views/CustomerSupport/EmailCMS/RegistrationEmail";
import Employee from "./views/EmployeeAccess/Employee";
import AddEmployee from "./views/EmployeeAccess/addEmployee";
import EditEmployee from "./views/EmployeeAccess/editEmployee";
import ExportToExcel from "./views/exportExcel";
// import Currency from "./views/configuration/Currency";
import ReviewsStatus from "./views/reviews/ReviewsStatus";
import Chapters from "./views/Chapters/chapter.js";
import AddChapterAndImg from "./views/Chapters/addChapterAndImg.js";
import ViewChapter from "./views/Chapters/viewChapter";
import { Edit } from "@mui/icons-material";
import EditChapterAndImg from "./views/Chapters/editChapter";





import deleteChapterData from "./views/Chapters/deleteChapterData";

import {  GoogleOAuthProvider } from '@react-oauth/google'
import GoogleAuth from "./views/Users/googleAuth";



import Chat from "./views/chat/Chat";
import ViewAboutUs from "./views/Content/ViewContent/viewAboutUs";
import ViewRefundPolicy from "./views/Content/ViewContent/viewRefundPolicy";
import ViewShippingPolicy from "./views/Content/ViewContent/viewShippingPolicy";
import ViewPrivacyPolicy from "./views/Content/ViewContent/viewPrivacyPolicy";
import ViewTermsConditions from "./views/Content/ViewContent/viewTermsConditions";



const GoogleAuthWrapper=()=>{
  return(
    <GoogleOAuthProvider clientId="706958433155-ohqku868vmbpchhk54gcm4vi9b3433mf.apps.googleusercontent.com">
      <GoogleAuth></GoogleAuth>
    </GoogleOAuthProvider>
  )
}
// import Patient from "./views/Patients/Patient";
// import ViewPatient from "./views/Patients/ViewPatient";
// import ViewPatientTest from "./views/Patients/Test/ViewPatientTest";
const routes = [
  // { path: "/", exact: true, name: "Home", navName: "" },
  //dashboard



  { path: "/dashboard", name: "Dashboard", element: Dashboard, navName: "" },
    { path: "/google/login", name: "googlelogin", element: GoogleAuthWrapper, navName: "" },
  { path: "/reports", name: "Reports", element: Reports, navName: "" },
  {
    path: "/change_password",
    name: "Change Password",
    element: Change_Password,
    navName: "",
  },
  {
    path: "/profile/edit",
    name: "Edit Profile",
    element: EditProfile,
    navName: "",
  },
  // { path: '/profile', name: 'Profile', element: Profile },
  //------------------Charts Routes------------------------------------
  {
    path: "/new-user-day-wise",
    name: "new user day wise",
    element: UserCharts,
    navName: "Charts",
  },
  {
    path: "/revenue-by-product",
    name: "Revenue By Product",
    element: ProductrevenueCharts,
    navName: "Charts",
  },
  {
    path: "/revenue-by-state",
    name: "Revenue By State",
    element: StateRevenueCharts,
    navName: "Charts",
  },
  {
    path: "/revenue-by-city",
    name: "Revenue By City",
    element: CityRevenueCharts,
    navName: "Charts",
  },
  {
    path: "/orders-day-wise",
    name: "Orders (Day Wise)",
    element: OrderdayChart,
    navName: "Charts",
  },
  {
    path: "/revenue-day-wise",
    name: "Revenue (Day Wise)",
    element: RevenueCharts,
    navName: "Charts",
  },
  //------------------ End Charts Routes------------------------------------
  //-----------------------Product Management Routes------------------------------------------------
  {
    path: "/chapters",
    name: "Chapters",
    element: Chapters,
    navName: "Product Management",
  },
  {
    path: "/chapter/add",
    name: "Add chapters",
    element: AddChapterAndImg,
    navName: "Product Management",
  },
  {
    path: "/chapter/view/:id",
    name: "view chapters",
    element: ViewChapter,
    navName: "Product Management",
  },
  {
    path: "/chapter/edit/:id",
    name: "Edit chapter",
    element: EditChapterAndImg,
    navName: "Product Management",
  },

  {
    path: "/product/edit/:id",
    name: "Edit products",
    element: EditPrdAndImg,
    navName: "Product Management",
  },
  {
    path: "/product/view/:id",
    name: "view products",
    element: ViewProduct,
    navName: "Product Management",
  },

 
  
 
 
 
 
  
 

  
 
  

      
   
   

  //Gst tax
  {
    path: "/gst",
    name: "Tax Rates",
    element: Tax,
    navName: "Product Management",
  },
  {
    path: "/tax/add",
    name: "Add Tax",
    element: Addtax,
    navName: "Product Management",
  },
  {
    path: "/tax/edit/:id",
    name: "Edit Tax",
    element: Edittax,
    navName: "Product Management",
  },
  //----------------------- End Product Management Routes------------------------------------------------

  //Departure
  // { path: "/departures", name: "Departures", element: Departures },
  // { path: "/departure/add", name: "Add Departure", element: AddDeparture },
  // { path: "/product/edit/:id", name: "Edit products", element: EditProduct },
  // { path: "/product/view/:id", name: "view products", element: ViewProduct },

  // Appointments
  // { path: "/appointments", name: "Appointments", element: Appointments },
  // {
  //   path: "/appointment/view/:id",
  //   name: "View Appointment",
  //   element: ViewAppointment,
  // },
  // {
  //   path: "/appointment/edit/:id",
  //   name: "Edit Appointment",
  //   element: EditAppointment,
  // },
  // {
  //   path: "/appointment/new",
  //   name: "Add Appointment",
  //   element: AddNewAppointment,
  // },
  //------------------customers Route-------------------------
  {
    path: "/customers-details",
    name: "Customers",
    element: CustomerTable,
    navName: "Customers",
  },
  {
    path: "/customers-details/:_id",
    name: "Customers",
    element: SingleUserAllDetails,
    navName: "Customers",
  },
    {
    path: "/chat/:name/:ticketId",
    name: "Customers",
    element: Chat,
    navName: "Customers",
  },
  {
    path: "/add-customer",
    name: "Customers",
    element: AddCustomer,
    navName: "Customers",
  },
  {
    path: "/deleteChapterData",
    name: "Customers",
    element: deleteChapterData,
    navName: "Customers",
  },
  //------------------ End customers Route-------------------------

  // {
  //   path: "/users-address/add",
  //   name: "User Address",
  //   element: AddUserAddress,
  // },
  // {
  //   path: "/users-address/edit/:id",
  //   name: "Edit user address",
  //   element: EditUserAddress,
  // },
  {
    path: "/users-address/view",
    name: "Customers",
    element: viewDetails,
  },

  // health care providers
  // {
  //   path: "//users",
  //   name: "healthcare providers",
  //   element: Businesses,
  // },
  // {
  //   path: "//users/add",
  //   name: "Add healthcare providers",
  //   element: AddBusiness,
  // },
  // {
  //   path: "/users/edit/:id",
  //   name: "Edit healthcare providers",
  //   element: EditBusiness,
  // },
  // {
  //   path: "/users/view/:id",
  //   name: "view healthcare providers",
  //   element: ViewHealthCareProvider,
  // },
  // Categories

  // Design
  // {
  //   path: "/design",
  //   name: "Design",
  //   element: Design,
  // },
  // {
  //   path: "/campaigns",
  //   name: "campaigns",
  //   element: Campaign,
  // },
  // {
  //   path: "/campaign/add",
  //   name: "Add Campaigns",
  //   element: AddCampaign,
  // },
  // {
  //   path: "/campaigns/edit/:id",
  //   name: "Edit healthcare providers",
  //   element: EditBusiness,
  // },
  // {
  //   path: "/campaigns/view/:id",
  //   name: "view healthcare providers",
  //   element: ViewHealthCareProvider,
  // },

  // { path: '/franchisee/view/:id', name: 'view franchisee', element: ViewFra },
  //Contact Requests
  // ----------------Customer Service  Routes-------------------------------
  {
    path: "/contact/request",
    name: "Customer Service",
    element: ContactRequests,
    navName: "Customer Service",
  },
  {
    path: "/contact/request/new",
    name: "Customer Service",
    element: AddContactRequest,
    navName: "Customer Service",
  },
  //Support Requests
  {
    path: "/email-cms",
    name: "CustomerSupport Requests",
    element: EmailCms,
    navName: "Customer Service",
  },
  {
    path: "/email-cms/registration-email",
    name: "CustomerSupport Requests",
    element: RegistrationEmail,
    navName: "Customer Service",
  },

  {
    path: "/support/request",
    name: "Customer Service",
    element: SupportRequest,
    navName: "Customer Service",
  },
  {
    path: "/support/request/closed",
    name: "Customer Service",
    element: SupportRequestClosed,
    navName: "Customer Service",
  },
  {
    path: "/support/request/closed/:ticketID",
    name: "Customer Service",
    element: CloseRequestView,
    navName: "Customer Service",
  },
  {
    path: "/support/request/reply/:ticketID",
    name: "Customer Service",
    element: SupportReply,
    navName: "Customer Service",
  },
  // ----------------  End Customer Service  Routes-------------------------------

  // { path: '/complaint/view/:id', name: 'view Complain', element: ViewComplaint },
  //Complaints

  //-------------------------------website related routes----------------------------------
  {
    path: "/banner",
    name: "Banners",
    element: Banners,
    navName: "Settings",
  },
  {
    path: "/registerImage",
    name: "RegisterImage",
    element: RegisterImage,
    navName: "Website Related",
  },

  // {
  //   path: "/web_images",
  //   name: "Web Images",
  //   element: Web_Images,
  //   navName: "Settings",
  // },
  {
    path: "/loginImage",
    name: "LoginImage",
    element: LoginImage,
    navName: "Website Related",
  },
  {
    path: "/shopImage",
    name: "ShopImage",
    element: ShopImage,
    navName: "Website Related",
  },
  {
    path: "/testimonials",
    name: "Testimonials",
    element: Testimonials,
    navName: "Website Related",
  },

  // {
  //   path: "/currency",
  //   name: "Currency",
  //   element: Currency,
  //   navName: "Settings",
  // },
  {
    path: "/testimonial/new",
    name: "AddTestimonial",
    element: AddTestimonial,
    navName: "Website Related",
  },
  {
    path: "/testimonial/view/:id",
    name: "ViewTestimonial",
    element: ViewTestimonial,
    navName: "Website Related",
  },
  {
    path: "/testimonial/edit/:id",
    name: "EditTestimonial",
    element: EditTestimonial,
    navName: "Website Related",
  },
  //seo
  // {
  //   path: "/seo/request/new",
  //   name: "seo Request",
  //   element: AddSeoRequest,
  //   navName: "Settings",
  // },

  // Content ---- >
  {
    path: "/content",
    name: "Website Related",
    element: Content,
    navName: "Settings",
  },
  // add
    {
    path: "/content/view/terms-and-conditions",
    name: "Website Related",
    element: ViewTermsConditions,
    navName: "Website Related",
  },
  {
    path: "/content/view/privacy-policy",
    name: "Website Related",
    element: ViewPrivacyPolicy,
    navName: "Website Related",
  },
  {
    path: "/content/view/shipping-policy",
    name: "Website Related",
    element: ViewShippingPolicy,
    navName: "Website Related",
  },
  {
    path: "/content/view/refund-policy",
    name: "Website Related",
    element: ViewRefundPolicy,
    navName: "Website Related",
  },
  {
    path: "/content/view/about-us",
    name: "Website Related",
    element: ViewAboutUs,
    navName: "Website Related",
  },
  // edit
  {
    path: "/content/terms-and-conditions",
    name: "Website Related",
    element: EditTermsConditions,
    navName: "Website Related",
  },
  {
    path: "/content/privacy-policy",
    name: "Website Related",
    element: EditPrivacyPolicy,
    navName: "Website Related",
  },
  {
    path: "/content/shipping-policy",
    name: "Website Related",
    element: EditShippingPolicy,
    navName: "Website Related",
  },
  {
    path: "/content/refund-policy",
    name: "Website Related",
    element: EditRefundpolicy,
    navName: "Website Related",
  },
  {
    path: "/content/about-us",
    name: "Website Related",
    element: EditAboutUs,
    navName: "Website Related",
  },
  // Home Pannel website
  {
    path: "/home",
    name: "Home",
    element: Home,
    navName: "Settings",
  },
  {
    path: "/home/panel-1",
    name: "EditPanel1",
    element: EditPanel1,
    navName: "Website Related",
  },
  {
    path: "/home/panel-2",
    name: "EditPanel2",
    element: EditPanel2,
    navName: "Website Related",
  },
  {
    path: "/home/panel-3",
    name: "EditPanel3",
    element: EditPanel3,
    navName: "Website Related",
  },
  // {
  //   path: "/home/panel-4",
  //   name: "EditPanel4",
  //   element: Editpanel4,
  //   navName: "Website Related",
  // },
  {
    path: "/reviewsStatus",
    name: "Reviews Status",
    element: ReviewsStatus,
    navName: "Settings",
  },
  //-------------------------------End website related routes----------------------------------

  //informations
  // { path: "/informations", name: "Informations", element: Informations },
  // {
  //   path: "/information/new",
  //   name: "Add Informations",
  //   element: AddInformations,
  // },

  //--------------Order Management Routes---------------------------------------
  {
    path: "/orders/new",
    name: "New Orders",
    element: NewOrders,
    navName: "Orders",
  },
  {
    path: "/order/add",
    name: "add Order",
    element: AddOrder,
    navName: "Orders",
  },
  {
    path: "/orders/edit/:id",
    name: "Edit Order",
    element: EditOrder,
    navName: "Orders",
  },
  {
    path: "/orders/:status/:id",
    name: "View Order",
    element: ViewOrders,
    navName: "Orders",
  },
  // {
  //   path: "/orders/processing",
  //   name: "Processing Orders",
  //   element: ProcessingOrders,
  //   navName: "Orders",
  // },
  // {
  //   path: "/orders/dispatched",
  //   name: "Dispatched Orders",
  //   element: DispatchedOrders,
  //   navName: "Orders",
  // },
  // {
  //   path: "/orders/delivered",
  //   name: "Delivered Orders",
  //   element: DeliveredOrders,
  //   navName: "Orders",
  // },
  // {
  //   path: "/orders/cancelled",
  //   name: "Cancelled Orders",
  //   element: CancelledOrders,
  //   navName: "Orders",
  // },

  {
    path: "/orders/returned",
    name: "Returned Orders",
    element: ReturnedOrders,
    navName: "Orders",
  },
  {
    path: "/inStoreCashOrders/new",
    name: "In Store Cash Orders",
    element: InStoreCashOrders,
    navName: "Orders",
  },
  {
    path: "/InStoreQRCodeOrders/new",
    name: "In Store QR Code Orders",
    element: InStoreQRCodeOrders,
    navName: "Orders",
  },
  {
    path: "/inStoreOrders/:status/:id",
    name: "View In Store Cash Orders",
    element: POSViewOrders,
    navName: "Orders",
  },

  // {
  //   path: "/abandoned-carts",
  //   name: "Abandone Carts",
  //   element: AbandonedCarts,
  //   navName: "",
  // },
  //-------------- End Order Management Routes---------------------------------------

  //----------Point of sale orders Routes-----------------------

  // { path: "/order/:status/:id", name: "View Order", element: ViewOdr },

  //------------settings------------------------//

  // { path: "/policies", name: "Policies", element: Policies },

  // { path: "/purpose", name: "Purpose", element: Purpose },
  // { path: "/purpose/add", name: "Add Purpose", element: AddPurpose },
  // //languge

  // { path: "/languages", name: "languages", element: Languages },
  // { path: "/language/add", name: "Add languages", element: AddLanguage },
  // { path: "/language/edit/:id", name: "Edit languages", element: EditLanguage },
  //business Type

  // { path: "/business_type", name: "business", element: BusinessType },
  // {
  //   path: "/business_type/add",
  //   name: "Add business",
  //   element: AddBusinessType,
  // },
  // {
  //   path: "/business_type/edit/:id",
  //   name: "Edit business",
  //   element: EditBusinessType,
  // },

  //purpose

  // { path: "/purpose", name: "purpose", element: Purpose },
  // { path: "/purpose/add", name: "Add purpose", element: AddPurpose },
  // { path: "/purpose/edit/:id", name: "Edit purpose", element: EditPurpose },

  //languge

  //-----------------Configuration Routes-----------------------------------
  {
    path: "/socialmedia",
    name: "Social Media",
    element: Socialmedia,
    navName: "Settings",
  },

  {
    path: "/application/name",
    name: "ApplicationName",
    element: ApplicationName,
    navName: "Settings",
  },
  {
    path: "/copyright/message",
    name: "Copyright Message",
    element: CopyrightMessage,
    navName: "Settings",
  },

  {
    path: "/address",
    name: "Address",
    element: Address,
    navName: "Settings",
  },
  { path: "/logo", name: "Logo", element: Logo, navName: "Settings" },
  //-----------------  End Configuration Routes-----------------------------------

  //-----------------Affiliate & Coupons  Routes-----------------------------------
  // {
  //   path: "/affiliate/coupons",
  //   name: "Coupon",
  //   element: Coupons,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/affiliates",
  //   name: "Affiliate",
  //   element: Affiliates,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/coupons/create",
  //   name: "Create Coupon",
  //   element: CreateCoupon,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/affiliates/create",
  //   name: "Create Affiliate",
  //   element: CreateAffiliate,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/affiliates/edit/:id",
  //   name: "Edit Affiliate",
  //   element: EditAffiliate,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/affiliates/pay/:id",
  //   name: "Pay Affiliate",
  //   element: PayAffiliate,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/affiliates/history/:id",
  //   name: "Pay Affiliate",
  //   element: AffiliateHistory,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/coupons/edit/:id",
  //   name: "Edit Coupon",
  //   element: EditCoupon,
  //   navName: "Affiliate & Coupons",
  // },
  // {
  //   path: "/affiliate/coupons/history/:id",
  //   name: "Edit Coupon",
  //   element: CouponHistory,
  //   navName: "Affiliate & Coupons",
  // },
  //-----------------  End Affiliate & Coupons  Routes-----------------------------------

  //---------- Blog Routes---------------------------------
  // {
  //   path: "/blogs",
  //   name: "Blogs",
  //   element: Blogs,
  //   navName: "Blog",
  // },
  // {
  //   path: "/blogs/create",
  //   name: "Blogs",
  //   element: CreateBlog,
  //   navName: "Blog",
  // },
  // {
  //   path: "/blog/edit/:id",
  //   name: "Blogs",
  //   element: UpdateBlog,
  //   navName: "Blog",
  // },
  // {
  //   path: "/blog/view/:id",
  //   name: "Blogs",
  //   element: ViewBlog,
  //   navName: "Blog",
  // },

  //----------End Blog Routes---------------------------------
  // ------------------------Employee Routes-----------------------
  {
    path: "/employee",
    name: "Employee",
    element: Employee,
    navName: "Employees & Access",
  },
  {
    path: "/add-employee",
    name: "Employee",
    element: AddEmployee,
    navName: "Employees & Access",
  },
  {
    path: "edit-employee/:id",
    name: "Employee",
    element: EditEmployee,
    navName: "Employees & Access",
  },
  // ------------------------ End Employee Routes-----------------------

  //---------Point of Sale Section Routes------------------------
  {
    path: "/pos",
    name: "Point of Sale",
    element: Pos,
    navName: "Point of Sale",
  },

  // Export to excel
  {
    path: "/exp",
    name: "Point of Sale",
    element: ExportToExcel,
    navName: "Point of Sale",
  },
  //--------- End Point of Sale Section Routes------------------------
];

export default routes;
