// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { isAutheticated } from "src/auth";

// const ViewProduct = () => {
//   const location = useLocation();
//   const { currencyDetails } = location.state || {};

//   const { id } = useParams();
//   const token = isAutheticated();

//   const [productData, setProductData] = useState({});
//   const [SAW, setSAW] = useState([
//     { volume: "", weight: "" },
//     { volume: "", weight: "" },
//     { volume: "", weight: "" },
//     { volume: "", weight: "" },
//     { volume: "", weight: "" },
//   ]);
//   const navigate = useNavigate();

//   const getProductData = async () => {
//     axios
//       .get(`/api/product/getOne/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         // console.log(res.data.data);
//         setProductData(res.data.data);
//         if (res.data.data?.variants) {
//           setSAW((prev) => [...res.data.data?.variants]);
//         }
//       })
//       .catch((err) => { });
//   };

//   useEffect(() => {
//     getProductData();
//   }, []);

//   const onCancel = () => {
//     navigate("/products");
//   };

//   const isVideo = (url) => {
//     return (
//       url &&
//       (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg"))
//     );
//   };

//   let count = 1;
//   return (
//     <div className="main-content">
//       <div className="my-3 page-content">
//         <div className="container-fluid">
//           <div className="row">
//             <div className="col-12">
//               <div className="page-title-box d-flex align-items-center justify-content-between">
//                 <h4 className="mb-3">Product Details</h4>
//                 <button
//                   onClick={onCancel}
//                   type="button"
//                   className="mb-2 ml-2 btn btn-warning btn-cancel waves-effect waves-light mr-3"
//                 >
//                   Back
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="row">
//             <div className="col-lg-12">
//               <div className="card">
//                 <div className="card-body">
//                   <div className="table-responsive table-shoot">
//                     <table className="table table-centered table-nowrap mb-0">
//                       <thead className="thead-light">
//                         <tr>
//                           <th>Name</th>
//                           <td>{productData?.name}</td>
//                         </tr>
//                         <tr>
//                           <th>Category</th>
//                           <td>{productData?.category?.categoryName}</td>
//                         </tr>
//                         <tr>
//                           <th>Images</th>
//                           <td className="">
//                             {productData?.image &&
//                               productData?.image.length !== 0
//                               ? productData?.image.map((e, i) => (
//                                 <div key={i}>
//                                   {isVideo(e.url) ? (
//                                     <video
//                                       className="p-1"
//                                       src={e.url}
//                                       width="100"
//                                       controls
//                                       alt="video preview"
//                                     />
//                                   ) : (
//                                     <img
//                                       className="p-1"
//                                       src={e.url}
//                                       width="100"
//                                       alt="image preview"
//                                     />
//                                   )}
//                                 </div>
//                               ))
//                               : "No Images Uploaded!"}
//                           </td>
//                         </tr>

//                         {productData?.master_price && (
//                           <tr>
//                             <th>Price</th>
//                             <td>
//                               {currencyDetails?.CurrencySymbol}
//                               {productData?.master_price}
//                             </td>
//                           </tr>
//                         )}
//                         {productData?.master_GST?.active && (
//                           <tr>
//                             <th>GST Rate</th>
//                             <td>
//                               {productData?.master_GST?.tax}%{" "}
//                               {productData?.master_GST?.name}
//                             </td>
//                           </tr>
//                         )}
//                         {productData?.master_GST?.active && (
//                           <tr>
//                             <th>GST Price</th>
//                             <td>
//                               {currencyDetails?.CurrencySymbol}
//                               {(
//                                 (Number(productData?.master_price) *
//                                   Number(productData?.master_GST?.tax)) /
//                                 100
//                               )?.toFixed(2)}
//                             </td>
//                           </tr>
//                         )}
//                         {productData?.master_GST && (
//                           <tr>
//                             <th>
//                               Total Price{" "}
//                               {productData?.master_GST?.active
//                                 ? "(with GST)"
//                                 : ""}
//                             </th>
//                             <td>
//                               {currencyDetails?.CurrencySymbol}
//                               {(
//                                 productData?.master_price +
//                                 (productData?.master_GST?.active
//                                   ? (Number(productData?.master_price) *
//                                     Number(productData?.master_GST?.tax)) /
//                                   100
//                                   : 0)
//                               ).toFixed(2)}
//                             </td>
//                           </tr>
//                         )}
//                         <tr>
//                           <th className="">Colors</th>
//                           <td>
//                             {productData?.colors && productData.colors.length > 0 ? (
//                               <div style={{
//                                 display: 'flex',
//                                 flexWrap: 'wrap', // Allows wrapping when items exceed the width
//                                 gap: '1rem', // Adds space between items
//                               }}>
//                                 {productData.colors.map((color, index) => (
//                                   <div key={index} style={{
//                                     width: '4rem', // Defines the width of each color block
//                                     height: '4rem', // Defines the height of each color block
//                                     borderRadius: '10px',
//                                     backgroundColor: color.colorCode, // Use color code instead of name for background
//                                     textAlign: 'center', // Center text inside the block
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     color: 'white', // Text color for visibility
//                                   }}>
//                                     {/* {color.colorCode} */}
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <p>No colors available</p>
//                             )}
//                           </td>

//                         </tr>
//                         <tr>
//                           <th>shipping Charge</th>
//                           <td>
//                             {currencyDetails?.CurrencySymbol}
//                             {productData?.shipping_charge
//                               ? productData.shipping_charge
//                               : "0"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <th>Description</th>
//                           <td>{productData?.description}</td>
//                         </tr>
//                         <tr>
//                           <th>Product Status</th>
//                           <td
//                             className={`badge m-1 ${productData?.product_Status === "Active"
//                               ? "text-bg-success"
//                               : "text-bg-danger"
//                               }`}
//                           >
//                             {productData?.product_Status}
//                           </td>
//                         </tr>
//                         <tr>
//                           <th>Special Instructions</th>
//                           <td>
//                             <p
//                               style={{ whiteSpace: "pre-line" }}
//                               className="m-0 p-0"
//                             >
//                               {productData?.special_instructions
//                                 ? productData?.special_instructions
//                                 : "---"}
//                             </p>
//                           </td>
//                         </tr>
//                       </thead>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewProduct;

