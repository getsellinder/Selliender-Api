import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import axios from "axios";
// import { API } from "src/API";
//  import { isAutheticated } from "../../components/auth/authhelper";
import { Link, useNavigate } from "react-router-dom";
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

const AddProduct = () => {
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
              Add Product : {data?.name && data?.name}
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

export default AddProduct;
