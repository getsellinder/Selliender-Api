import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import axios from "axios";
// import { API } from "src/API";
//  import { isAutheticated } from "../../components/auth/authhelper";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
} from "@coreui/react";
import ProductDetails from "./Productcomponents/ProductDetails.js";
import ProductVarients from "./Productcomponents/ProductVarients.js";
import ProductsImages from "./Productcomponents/ProductImages.js";
import { isAutheticated } from "src/auth.js";
// import ReleventProduct from "./Productcomponents/ReleventProduct";
// import ProductFabric from "./Productcomponents/ProductFabric.js";

const EditProduct = () => {
  const id = useParams()?.id;
  console.log("id", id);
  const token = isAutheticated();
  const [productId, setProductId] = useState("");
  const [viewState, setViewState] = useState(1);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [relevantProduct, setRelevantProduct] = useState([]);
  const [allreleventSelectedProduct, setallReleventSelectedProduct] = useState(
    []
  );

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    category: "",
    // sku: "",
    description: "",
    master_price: "",
    master_GST: "",
    // discontinue_on: "",
    // hsn_code: "",
    product_Status: "",

    special_instructions: "",
    // productImages.length == 0 ||
    // gst_amount === "" ||
    // price === "" ||
    // totalAmt === "" ||
    // gst_amount === "" ||
  });

  const [varients, setVarients] = useState([
    {
      variant_Name: "",
      weight: "",
      volume: "",
      price: "",
      gst_Id: "",
    },
    {
      variant_Name: "",
      weight: "",
      volume: "",
      price: "",
      gst_Id: "",
    },
    {
      variant_Name: "",
      weight: "",
      volume: "",
      price: "",
      gst_Id: "",
    },
  ]);

  ///////////////
  const getProduct = () => {
    axios
      .get(`/api/product/getOne/${id}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setData((prev) => ({
          ...prev,
          ...res.data?.data,
          category: res.data?.data?.category?._id,
          master_GST: res.data?.data?.master_GST?._id,
          product_Status: res.data?.data?.product_Status,
          // discontinue_on: res.data?.data?.discontinue_on?.slice(0, 10),
        }));
        setProductId(res.data?.data?._id);
        setImages([...res.data?.data?.image]);
        setVarients([...res.data.data?.variants]);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };
  /////////////////
  const [allFabrics, setAllFabrics] = useState([]);
  const [fabrics, setFabrics] = useState([
    { _id: "", fabric_Name: "", for_Part: "" },
    { _id: "", fabric_Name: "", for_Part: "" },
    { _id: "", fabric_Name: "", for_Part: "" },
  ]);

  const getCategories = () => {
    axios
      .get(`/api/category/getCategories`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCategories(res?.data?.categories);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  const getTaxes = () => {
    axios
      .get(`/api/tax/view_tax`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log("tax", res.data);
        setTaxes(res.data);
      });
  };

  // const getSizes = () => {
  //   axios
  //     .get(`/api/erp/sizemaster/size`, {
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       setSizes(res.data?.data);
  //     });
  // };
  // const getItemWhichcontaiNameFabric = () => {
  //   axios
  //     .get(`/api/erp/item/name_contain_fabric`, {
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       console.log(res?.data);
  //       // setSizes(res.data?.data)
  //       setAllFabrics(res?.data?.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  // const getProductsData = async () => {
  //   axios
  //     .get(`/api/product`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       setRelevantProduct(res.data?.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  useEffect(() => {
    getProduct();
    getCategories();
    getTaxes();
    // getSizes();
    // getProductsData();
    // getItemWhichcontaiNameFabric();
  }, []);
  const handleView = (n) => {
    if (viewState === n) return;
    setViewState(n);
  };

  return (
    <CContainer>
      <CRow className="mt-3">
        <CCol md={12}>
          <div
            className="
                    page-title-box
                    d-flex
                    align-items-center
                    justify-content-between
                  "
          >
            <div style={{ fontSize: "22px" }} className="fw-bold">
              Edit Product : {data?.name && data?.name}
            </div>
            <div className="page-title-right">
              <Link to="/products">
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textTransform: "capitalize",
                  }}
                >
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </CCol>
      </CRow>
      <CRow>
        <CCol md={9} className="mt-1">
          <CCardGroup>
            <CCard className="p-4 mb-3">
              <CCardBody>
                {viewState === 1 && (
                  <ProductDetails
                    data={{ data, setData }}
                    categories={categories}
                    taxes={taxes}
                    ProductId={{ productId, setProductId }}
                    loading={{ loading, setLoading }}
                  />
                )}
                {viewState === 2 && (
                  <ProductVarients
                    productId={productId}
                    data={{ varients, setVarients }}
                    taxes={taxes}
                    sizes={sizes}
                    loading={{ loading, setLoading }}
                  />
                )}
                {viewState === 3 && (
                  <ProductsImages
                    productId={productId}
                    data={{ images, setImages }}
                    loading={{ loading, setLoading }}
                  />
                )}
                {/* {viewState === 4 && (
                  <ProductFabric
                    productId={productId}
                    data={{ fabrics, setFabrics }}
                    allFabrics={allFabrics}
                    loading={{ loading, setLoading }}
                  />
                )}
                {viewState === 5 && (
                  <ReleventProduct
                    data={{ data, setData }}
                    ProductId={productId}
                    AllreleventSelectedPro={{
                      allreleventSelectedProduct,
                      setallReleventSelectedProduct,
                    }}
                    ReleventProduct={relevantProduct}
                    loading={{ loading, setLoading }}
                  />
                )} */}
                {/* {viewState === 5 && (
                  <ProductFabric
                    data={{ data, setData }}
                    ProductId={productId}
                    AllreleventSelectedPro={{
                      allreleventSelectedProduct,
                      setallReleventSelectedProduct,
                    }}
                    ReleventProduct={relevantProduct}
                    loading={{ loading, setLoading }}
                  />
                )} */}
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
        <CCol md={3} className="mt-1">
          <CCardGroup>
            <CCard>
              <CCardBody>
                <div className="d-grid gap-2">
                  <button
                    className={
                      viewState === 1
                        ? "btn btn-light"
                        : "btn btn-info text-white"
                    }
                    type="button"
                    onClick={() => handleView(1)}
                  >
                    Product Details
                  </button>
                  {/* <button
                    className={
                      viewState === 2
                        ? "btn btn-light"
                        : "btn btn-info text-white"
                    }
                    type="button"
                    onClick={() => handleView(2)}
                  >
                    Variants
                  </button> */}
                  <button
                    className={
                      viewState === 3
                        ? "btn btn-light"
                        : "btn btn-info text-white"
                    }
                    type="button"
                    onClick={() => handleView(3)}
                  >
                    Images
                  </button>
                  {/* <button
                    className={
                      viewState === 4
                        ? "btn btn-light"
                        : "btn btn-info text-white"
                    }
                    type="button"
                    onClick={() => handleView(4)}
                  >
                    Fabric
                  </button> */}
                  {/* <button
                    className={
                      viewState === 5
                        ? "btn btn-light"
                        : "btn btn-info text-white"
                    }
                    type="button"
                    onClick={() => handleView(5)}
                  >
                    + Relevent Product
                  </button> */}
                </div>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default EditProduct;
// import React, { useEffect, useState } from "react";
// import Button from "@material-ui/core/Button";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import swal from "sweetalert";
// import axios from "axios";
// import { isAutheticated } from "src/auth";

// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
// import {
//   Box,
//   FormControl,
//   IconButton,
//   MenuItem,
//   Select,
//   TextField,
// } from "@mui/material";
// // import { WebsiteURL } from '../WebsiteURL'

// const EditProduct = () => {
//   const id = useParams()?.id;

//   const token = isAutheticated();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [allTax, setAllTax] = useState([]);
//   const [categories, setCatgories] = useState([]);
//   const [imagesPreview, setImagesPreview] = useState([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [productImages, setProductImages] = useState([]);
//   const [price, setPrice] = useState("");
//   const [category, setCategoryName] = useState("");
//   const [error, setError] = useState("");
//   const [initTax, setInitTax] = useState();
//   const [selectedTax, setselectedTax] = useState();
//   const [product_Status, setproduct_Status] = useState("");

//   const [totalAmt, setTotalAmt] = useState(0);
//   const [gst_amount, setGst_amount] = useState(0);
//   const [newUpdatedImages, setNewUpdatedImages] = useState([]);

//   //get Productdata
//   const getProduct = async () => {
//     axios
//       .get(`/api/product/getOne/${id}`, {
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         setName(res?.data?.product.name);
//         setDescription(res.data.product.description);
//         setProductImages(res.data.product.image);
//         setPrice(res.data.product.price);
//         setCategoryName(res.data.product?.category?._id);
//         setselectedTax(res.data.product?.gst);
//         setInitTax(res.data.product?.gst?._id);
//         setTotalAmt(res.data.product?.total_amount);
//         setGst_amount(res.data.product?.gst_amount);
//         setproduct_Status(res.data.product?.product_Status);
//       })
//       .catch((err) => {
//         swal({
//           title: error,
//           text: " Can not fetch the product  ",
//           icon: "error",
//           button: "Retry",
//           dangerMode: true,
//         });
//       });
//   };
//   // console.log(selectedTax, "selectedTax");

//   const getCategories = async () => {
//     try {
//       const response = await axios.get("/api/category/getCategories", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         setCatgories(response?.data?.categories);
//       }
//     } catch (error) {
//       swal({
//         title: error,
//         text: " please login to access the resource ",
//         icon: "error",
//         button: "Retry",
//         dangerMode: true,
//       });
//     }
//   };
//   useEffect(() => {
//     getProduct();
//     getCategories();
//   }, []);

//   useEffect(() => {
//     const getAllTax = async () => {
//       const res = await axios.get(`/api/tax/view_tax`, {
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (res.data) {
//         setAllTax(res.data);
//       }
//     };
//     getAllTax();
//   }, [token]);
//   const TaxRatechange = async (e) => {
//     let m = JSON.parse(e.target.value);
//     setInitTax("");
//     if (m?.tax) {
//       let totalprice = Number(price) + Number((price * m?.tax) / 100);
//       setGst_amount(Number((price * m?.tax) / 100)?.toFixed(2));
//       setTotalAmt(totalprice?.toFixed(2));
//       setselectedTax(m?._id);
//     }
//   };
//   // console.log(selectedTax, "inisele");
//   const handlePriceChange = (e) => {
//     const newPrice = e.target.value;

//     setPrice(newPrice);
//     const selectedTaxObj = allTax.find(
//       (t) =>
//         t._id ===
//         (typeof selectedTax === "object" ? selectedTax._id : selectedTax)
//     );
//     // console.log(selectedTax);
//     // console.log(selectedTaxObj, "this is ", selectedTax);

//     if (selectedTaxObj && !isNaN(newPrice)) {
//       const gstAmount = (newPrice * selectedTaxObj.tax) / 100;
//       const totalAmount = Number(newPrice) + gstAmount;

//       setGst_amount(gstAmount.toFixed(2));
//       setTotalAmt(totalAmount.toFixed(2));
//     }
//   };
//   const handleSubmit = () => {
//     // console.log("selected Tax", selectedTax);
//     if (
//       name === "" ||
//       description === "" ||
//       productImages.length == 0 ||
//       category === "" ||
//       selectedTax === "" ||
//       gst_amount === "" ||
//       price === "" ||
//       product_Status === "" ||
//       totalAmt === "" ||
//       gst_amount === "" ||
//       (productImages.length == 0 && newUpdatedImages.length == 0)
//     ) {
//       swal({
//         title: "Warning",
//         text: "Fill all mandatory fields",
//         icon: "error",
//         button: "Close",
//         dangerMode: true,
//       });
//       return;
//     }
//     setLoading(true);
//     const formData = new FormData();
//     formData.append("name", name);

//     formData.append("description", description);
//     formData.append("price", price);
//     formData.append("category", category);
//     formData.append("total_amount", totalAmt);
//     formData.append("gst_amount", gst_amount);
//     formData.append("product_Status", product_Status);

//     formData.append("gst", initTax === "" ? selectedTax : initTax);

//     newUpdatedImages.length > 0 &&
//       newUpdatedImages.forEach((Singleimage) => {
//         formData.append("newImages", Singleimage);
//       });

//     formData.append("image", JSON.stringify(productImages));

//     axios
//       .patch(`/api/product/update/${id}`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",

//           "Access-Control-Allow-Origin": "*",
//         },
//       })
//       .then((res) => {
//         swal({
//           title: "Updated",
//           text: "Product Updated successfully!",
//           icon: "success",
//           button: "ok",
//         });
//         setLoading(false);
//         navigate("/products", { replace: true });
//       })
//       .catch((err) => {
//         setLoading(false);

//         const message = err.response?.data?.message
//           ? err.response?.data?.message
//           : "Something went wrong!";
//         swal({
//           title: "Warning",
//           text: message,
//           icon: "error",
//           button: "Retry",
//           dangerMode: true,
//         });
//       });
//   };
//   const handleFileChange = (e) => {
//     const files = e.target.files;

//     // Check the total number of selected files
//     if (newUpdatedImages.length + files.length > 4 - productImages.length) {
//       setError("You can only upload up to 4 images.");
//       return;
//     }

//     // Check file types and append to selectedFiles
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     const selected = [];

//     for (let i = 0; i < files.length; i++) {
//       if (
//         newUpdatedImages.length + selected.length >=
//         4 - productImages.length
//       ) {
//         break; // Don't allow more than 4 images
//       }

//       if (allowedTypes.includes(files[i].type)) {
//         selected.push(files[i]);
//       }
//     }

//     if (selected.length === 0) {
//       setError("Please upload only PNG, JPEG, or JPG files.");
//     } else {
//       setError("");
//       setNewUpdatedImages([...newUpdatedImages, ...selected]);
//     }
//   };

//   const handelDelete = async (public_id) => {
//     const ary = public_id.split("/");

//     const res = await axios.delete(
//       `/api/product/deleteImage/jatinMor/product/${ary[2]}`,
//       {
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     if (res) {
//       const filtered = productImages.filter(
//         (item) => item.public_id !== public_id
//       );
//       setProductImages(filtered);
//     }
//   };
//   const handellocalDelete = (image) => {
//     const filtered = productImages.filter((item) => item !== image);
//     setProductImages(filtered);
//   };
//   return (
//     <div className="container">
//       <div className="row">
//         <div className="col-12">
//           <div
//             className="
//                     page-title-box
//                     d-flex
//                     align-items-center
//                     justify-content-between
//                   "
//           >
//             <div style={{ fontSize: "22px" }} className="fw-bold">
//               Edit Product
//             </div>
//             <div style={{ display: "flex", gap: "1rem" }}>
//               <h4 className="mb-0"></h4>
//             </div>

//             <div className="page-title-right">
//               <Button
//                 variant="contained"
//                 color="primary"
//                 style={{
//                   fontWeight: "bold",
//                   marginBottom: "1rem",
//                   textTransform: "capitalize",
//                   marginRight: "5px",
//                 }}
//                 onClick={() => handleSubmit()}
//                 disabled={loading}
//               >
//                 {loading ? "Loading" : "Save"}
//               </Button>
//               <Link to="/products">
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   style={{
//                     fontWeight: "bold",
//                     marginBottom: "1rem",
//                     textTransform: "capitalize",
//                   }}
//                 >
//                   Back
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="row">
//         <div className="col-lg-6 col-md-6  col-sm-12 my-1">
//           <div className="card h-100">
//             <div className="card-body px-5">
//               <div className="mb-3">
//                 <label htmlFor="title" className="form-label">
//                   Product Name*
//                 </label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="name"
//                   value={name}
//                   maxLength={35}
//                   onChange={(e) => setName(e.target.value)}
//                 />
//                 {name ? (
//                   <>
//                     <small className="charLeft mt-4 fst-italic">
//                       {35 - name.length} characters left
//                     </small>
//                   </>
//                 ) : (
//                   <></>
//                 )}{" "}
//               </div>

//               <div className="mb-3">
//                 <label htmlFor="title" className="form-label">
//                   Description*
//                 </label>
//                 <textarea
//                   type="text"
//                   className="form-control"
//                   id="description"
//                   rows="8"
//                   value={description}
//                   maxLength="400"
//                   onChange={(e) => setDescription(e.target.value)}
//                 />
//                 {description ? (
//                   <>
//                     <small className="charLeft mt-4 fst-italic">
//                       {400 - description.length} characters left
//                     </small>
//                   </>
//                 ) : (
//                   <></>
//                 )}
//               </div>

//               <Box>
//                 <label htmlFor="upload-Image">
//                   <TextField
//                     style={{
//                       display: "none",
//                       width: "350px",
//                       height: "350px",
//                       borderRadius: "10%",
//                     }}
//                     fullWidth
//                     id="upload-Image"
//                     type="file"
//                     accept=".jpg , .png ,.jpeg"
//                     label="file"
//                     multiple
//                     variant="outlined"
//                     onChange={(e) => handleFileChange(e)}
//                   />
//                   <Box
//                     style={{ borderRadius: "10%" }}
//                     sx={{
//                       margin: "1rem 0rem",
//                       cursor: "pointer",
//                       width: "140px",
//                       height: "140px",
//                       border: "2px solid grey",
//                       // borderRadius: '50%',

//                       "&:hover": {
//                         background: "rgba(112,112,112,0.5)",
//                       },
//                     }}
//                   >
//                     <CloudUploadIcon
//                       style={{
//                         color: "grey",
//                         margin: "auto",
//                         fontSize: "5rem",
//                       }}
//                       fontSize="large"
//                     />
//                   </Box>
//                 </label>
//               </Box>
//               {error && <p style={{ color: "red" }}>{error}</p>}
//               <div>
//                 <strong className="fs-6 fst-italic">
//                   *You cannot upload more than 4 images
//                 </strong>
//               </div>

//               <Box style={{ display: "flex" }}>
//                 {productImages &&
//                   productImages.map((image, i) => (
//                     <Box marginRight={"2rem"}>
//                       <img
//                         src={image.url}
//                         alt="profileImage"
//                         style={{
//                           width: 70,
//                           height: 70,

//                           marginBottom: "1rem",
//                         }}
//                       />
//                       {productImages.length + newUpdatedImages.length > 1 && (
//                         <DeleteSharpIcon
//                           onClick={() => handelDelete(image.public_id)}
//                           fontSize="small"
//                           sx={{
//                             color: "white",
//                             position: "absolute",
//                             cursor: "pointer",
//                             padding: "0.2rem",
//                             background: "black",
//                             borderRadius: "50%",
//                           }}
//                         />
//                       )}
//                       {/* </IconButton> */}
//                     </Box>
//                   ))}
//                 {newUpdatedImages &&
//                   newUpdatedImages.map((image, i) => (
//                     <Box marginRight={"2rem"}>
//                       <img
//                         src={URL.createObjectURL(image)}
//                         alt="profileImage"
//                         style={{
//                           width: 70,
//                           height: 70,

//                           marginBottom: "1rem",
//                         }}
//                       />
//                       {productImages.length + newUpdatedImages.length > 1 && (
//                         <DeleteSharpIcon
//                           onClick={() => handellocalDelete(image)}
//                           fontSize="small"
//                           sx={{
//                             color: "white",
//                             position: "absolute",
//                             cursor: "pointer",
//                             padding: "0.2rem",
//                             background: "black",
//                             borderRadius: "50%",
//                           }}
//                         />
//                       )}
//                       {/* </IconButton> */}
//                     </Box>
//                   ))}
//               </Box>
//             </div>
//           </div>
//         </div>
//         <div className="col-lg-6 col-md-6  col-sm-12 my-1">
//           <div className="card h-100">
//             <div className="card-body px-5">
//               <div className="mb-3 me-3">
//                 <label htmlFor="title" className="form-label">
//                   Price(Rs)*
//                 </label>
//                 <input
//                   type="number"
//                   className="form-control"
//                   id="price"
//                   value={price}
//                   onChange={(e) => handlePriceChange(e)}
//                 />
//               </div>
//               <div>
//                 <label htmlFor="categorySelect">Select a Category *:</label>
//                 <select
//                   id="category"
//                   className="form-control"
//                   style={{ width: "100%" }}
//                   value={category}
//                   onChange={(e) => setCategoryName(e.target.value)}
//                 >
//                   <option value={""}>None</option>
//                   {categories.map((category, index) => (
//                     <option key={index} value={category?._id}>
//                       {category.categoryName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {allTax.length > 0 && (
//                 <div className=" mb-3">
//                   <label htmlFor="title" className="form-label">
//                     GST*
//                   </label>{" "}
//                   <select
//                     className="   form-control"
//                     name=""
//                     id=""
//                     value={JSON.stringify(selectedTax?._id)}
//                     onChange={(e) => TaxRatechange(e)}
//                   >
//                     {selectedTax?.tax && (
//                       <option
//                         value={selectedTax && JSON.stringify(selectedTax)}
//                       >
//                         {selectedTax?.tax}% {selectedTax?.name}
//                       </option>
//                     )}
//                     {allTax.map((t, i) => (
//                       <option key={i} value={JSON.stringify(t)}>
//                         {t.tax}% {t.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div className="mb-3 me-3">
//                 <label htmlFor="title" className="form-label">
//                   GST Amount (Rs) *
//                 </label>
//                 <input
//                   disabled
//                   type="number"
//                   name="gst_amount"
//                   className="form-control"
//                   id="gst_amount"
//                   value={gst_amount}
//                   // onChange={(e) => setPrice(e.target.value)}
//                 />
//               </div>
//               <div className="mb-3 me-3">
//                 <label htmlFor="title" className="form-label">
//                   Total Amount(Rs)*
//                 </label>
//                 <input
//                   disabled
//                   type="number"
//                   name="total_amount"
//                   className="form-control"
//                   id="total_amount"
//                   value={totalAmt}
//                   // onChange={(e) => setPrice(e.target.value)}
//                 />
//               </div>
//               <div className=" mb-3">
//                 <label htmlFor="title" className="form-label">
//                   Product Status *
//                 </label>{" "}
//                 <select
//                   className="form-control"
//                   name="product_Status"
//                   id="product_Status"
//                   value={product_Status}
//                   onChange={(e) => setproduct_Status(e.target.value)}
//                 >
//                   <option value="">--Select--</option>
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditProduct;
