import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { isAutheticated } from "src/auth";
import { useDispatch, useSelector } from "react-redux";
import { addItemsToCart } from "src/redux/Actions/cartAction";
import toast from "react-hot-toast";
import { cibBlackberry } from "@coreui/icons";
import Button from "@material-ui/core/Button";
import { blue } from "@material-ui/core/colors";

function ViewOrders() {
  const { status, id } = useParams();
  const [success, setSuccess] = useState(true);

  const { cartItems, subTotal, shippingCharge, tax, shipingInfo, total } =
    useSelector((state) => state.cart);

  const AllStates = useSelector((state) => state);
  const getValue = useRef();
  const getFranchiseeID = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const printOrderRef = useRef();
  const token = isAutheticated();
  const [productData, setProductData] = useState([]);
  const [allFranchisee, setAllFranchisee] = useState([]);
  const [allTax, setAllTax] = useState([]);
  const [orderDetails, setOrderDetails] = useState();

  const [productDetails, setProductDetails] = useState();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  // const [data, setData] = useState({
  //     product_Name: '',
  //     address: '',
  //     quantity: '',
  //     contact_Number: '',
  //     total_Price: '',
  // })
  useEffect(() => {
    const getSingleOrder = async () => {
      setLoading(true);
      const res = await axios.get(`/api/order/getOne/${id}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data) {
        setLoading(false);
        setOrderId(res.data?.order?.order_id);
        setOrderDetails(res.data?.order);
        console.log("response", res.data);
        // let options = {
        //     Franchisee: res.data?.order?.shippingInfo?.Franchisee?._id,
        //     name: res.data?.order?.shippingInfo?.name,

        //     contact_Number: res.data?.order?.shippingInfo?.contact_Number,
        //     contact_Person_Name: res.data?.order?.shippingInfo?.contact_Person_Name,
        //     address: res.data?.order?.shippingInfo?.address,
        //     city: res.data?.order?.shippingInfo?.city,
        //     price_Lable: res.data?.order?.shippingInfo?.Franchisee?.price_Lable,
        //     state: res.data?.order?.shippingInfo?.state,
        //     banner: res.data?.order?.shippingInfo?.Franchisee?.banner?.url,
        //     // Franchisee_Url: res?.data?.data?.url
        // }
        // dispatch({ type: "addShippingInfo", payload: options });
        // if (res.data?.order?.orderItems) {
        //     res.data?.order?.orderItems.map((i, ind) => {
        //         dispatch({ type: "addToCart", payload: i });
        //         dispatch({ type: "calculatePrice" });

        //     })
        // }
      }
    };
    getSingleOrder();
  }, []);

  const handleChange = (e) => {
    if (e.target.type === "text") {
      setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    } else {
      if (e.target.value === "") toast.error("please select status");
      setOrderStatus(e.target.value);
    }
  };
  const handleQuantityChange = (e) => {
    setData((prev) => ({
      ...prev,
      quantity: e.target.value,
      total_Price: productDetails?.base_Price * e.target.value,
    }));
  };
  // ------------------------------------------------------

  const handlechangestatus = () => {
    if (orderStatus === "dispatched") {
      swal({
        title: `Are you sure for ${orderStatus}?`,
        icon: "warning",
        content: {
          element: "div",
          attributes: {
            innerHTML:
              '<input id="input1" placeholder="Enter Courier Name" className="swal2-input" style="margin:3px;height:40px;text-align:center;">' +
              '<input id="input2" placeholder="Courier Tracking ID" className="swal2-input" style="margin:3px;height:40px;text-align:center;">',
          },
        },
        buttons: {
          Yes: { text: "Submit", value: true },

          Cancel: { text: "Cancel", value: "cancel" },
        },
      }).then((result) => {
        if (result === true) {
          // You have the input values, you can use them in your API call
          const courierName = document.getElementById("input1").value.trim();
          const TrackingID = document.getElementById("input2").value.trim();

          // Check if values are entered
          if (courierName === "" || TrackingID === "") {
            swal({
              title: "Warning",
              text: "Please enter values Courier Name And Tracking ID",
              icon: "warning",
              button: "Ok",
              dangerMode: true,
            });
          } else {
            axios
              .patch(
                `/api/order/change/status/${id}`,
                {
                  status: orderStatus,
                  courierName,
                  TrackingID,
                  sendemail: orderDetails?.user?.email,
                  customerName: orderDetails?.user?.name,
                },
                {
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                console.log("status");
                toast.success(
                  `Order status change ${status} to ${orderStatus}`
                );
                // setSuccess((prev) => !prev);
              })
              .catch((err) => {
                swal({
                  title: "Warning",
                  text: err.response.data.message
                    ? err.response.data.message
                    : "Something went wrong!",
                  icon: "error",
                  button: "Retry",
                  dangerMode: true,
                });
              });
          }
        }
        // else {
        //   swal.close(); // Close the popup if canceled
        // }
      });
    } else if (orderStatus === "cancelled") {
      swal({
        title: `Are you sure for ${orderStatus}?`,
        icon: "warning",
        content: {
          element: "div",
          attributes: {
            innerHTML:
              '<p>Reson for cancellation.?</p><input id="input1" placeholder="Enter Reason for Cancellation" className="swal2-input" style="margin:3px;height:40px;text-align:center;">',
          },
        },
        buttons: {
          Yes: { text: "Submit", value: true },

          Cancel: { text: "Cancel", value: "cancel" },
        },
      }).then((result) => {
        if (result === true) {
          // You have the input values, you can use them in your API call
          const ReasonforCancellation = document
            .getElementById("input1")
            .value.trim();

          // Check if values are entered
          if (ReasonforCancellation === "") {
            swal({
              title: "Warning",
              text: "Please enter Reason for Cancellation",
              icon: "warning",
              button: "Ok",
              dangerMode: true,
            });
          } else {
            axios
              .patch(
                `/api/order/change/status/${id}`,
                {
                  status: orderStatus,
                  ReasonforCancellation,
                },
                {
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                console.log("status");
                toast.success(
                  `Order status change ${status} to ${orderStatus}`
                );
                // setSuccess((prev) => !prev);
              })
              .catch((err) => {
                swal({
                  title: "Warning",
                  text: err.response.data.message
                    ? err.response.data.message
                    : "Something went wrong!",
                  icon: "error",
                  button: "Retry",
                  dangerMode: true,
                });
              });
          }
        }
        // else {
        //   swal.close(); // Close the popup if canceled
        // }
      });
    } else if (orderStatus === "delivered") {
      swal({
        title: `Are you sure for ${orderStatus}?`,
        icon: "warning",
        content: {
          element: "div",
          attributes: {
            innerHTML:
              '<input id="input1" type="date" placeholder="Delivered ON" className="swal2-input" style="height:40px;text-align:center;">',
            // '<input id="input2" placeholder="Courier Tracking ID" className="swal2-input" style="margin:3px;height:40px">',
          },
        },
        buttons: {
          Yes: { text: "Submit", value: true },

          Cancel: { text: "Cancel", value: "cancel" },
        },
      }).then((result) => {
        if (result === true) {
          // You have the input values, you can use them in your API call
          const DDate = document.getElementById("input1").value.trim();

          // Check if values are entered
          if (DDate === "") {
            swal({
              title: "Warning",
              text: "Please enter Delivered Date",
              icon: "warning",
              button: "Ok",
              dangerMode: true,
            });
          } else {
            axios
              .patch(
                `/api/order/change/status/${id}`,
                {
                  status: orderStatus,
                  DDate,
                },
                {
                  headers: {
                    "Access-Control-Allow-Origin": "*",
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                console.log("status");
                toast.success(
                  `Order status change ${status} to ${orderStatus}`
                );
                // setSuccess((prev) => !prev);
              })
              .catch((err) => {
                swal({
                  title: "Warning",
                  text: err.response.data.message
                    ? err.response.data.message
                    : "Something went wrong!",
                  icon: "error",
                  button: "Retry",
                  dangerMode: true,
                });
              });
          }
        }
        // else {
        //   swal.close(); // Close the popup if canceled
        // }
      });
    } else {
      swal({
        title: `Are you sure for ${orderStatus}?`,
        icon: "warning",

        buttons: {
          Yes: { text: "Yes", value: true },
          Cancel: { text: "Cancel", value: "cancel" },
        },
      }).then((value) => {
        if (value === true) {
          axios
            .patch(
              `/api/order/change/status/${id}`,
              { status: orderStatus },
              {
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  Authorization: `Bearer ${token}`,
                },
              }
            )
            .then((res) => {
              console.log("status");
              toast.success(`order status change ${status} to ${orderStatus}`);
              // setSuccess((prev) => !prev);
            })
            .catch((err) => {
              swal({
                title: "Warning",
                text: err.response.data.message
                  ? err.response.data.message
                  : "Something went wrong!",
                icon: "error",
                button: "Retry",
                dangerMode: true,
              });
            });
        }
      });
    }
  };

  function getBack() {
    navigate(`/orders/${status}`, { replace: true });
  }

  return (
    <>
      {" "}
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div
                  className="
                    page-title-box
                    d-flex
                    align-items-center
                    justify-content-between
                  "
                >
                  <div style={{ fontSize: "22px" }} className="fw-bold">
                    <p> View Order</p>
                  </div>
                  <div className="m-4">
                    {orderDetails?.orderID && (
                      <span>
                        <h6 className="">Order ID : {orderDetails?.orderID}</h6>{" "}
                      </span>
                    )}
                  </div>
                  {orderDetails?.courier_name && (
                    <div className="m-4">
                      <span>
                        <h6 className="">
                          Courier Name: {orderDetails?.courier_name}
                        </h6>{" "}
                        <h6 className="">
                          Tracking ID : {orderDetails?.courier_tracking_id}
                        </h6>
                      </span>
                    </div>
                  )}
                  {orderDetails?.isDelivered && (
                    <div className="m-4">
                      <span>
                        <h6 className="">Delivered: Yes</h6>{" "}
                        <h6 className="">
                          Delivered Date: {orderDetails?.DeliveredDate}
                        </h6>
                      </span>
                    </div>
                  )}
                  <div className="page-title-right">
                    {/* <Button
                                            variant="contained"
                                            color="primary"
                                            style={{
                                                fontWeight: 'bold',
                                                marginBottom: '1rem',
                                                textTransform: 'capitalize',
                                                marginRight: '5px',
                                            }}
                                            onClick={() => handleSubmit()}
                                            disabled={loading}
                                        >
                                            {loading ? 'Loading' : 'Edit Now'}
                                        </Button> */}

                    <Link to={`/orders/${status}`}>
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
              </div>
            </div>
            {loading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border  text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-lg-7 mt-3">
                  {orderDetails?.shipingInfo !== null && (
                    <div className="card">
                      <div className="card-body">
                        {/* <div className="mt-1">
                                            <label className="fw-bold">Select Product:</label>
                                            <div className="d-flex">
                                                <select
                                                    className="form-control me-2"
                                                    // onChange={handleGetSingleProduct}
                                                    // value={productData?._id}
                                                    ref={getValue}

                                                >
                                                    <option value="" >-----</option>
                                                    {productData && productData.map((item, index) =>
                                                        <option key={index} value={item?._id}>{item?.name}</option>
                                                    )}

                                                </select>
                                                <button className='btn-sm btn-primary' onClick={(e) => handleGetSingleProduct(e)}>Add</button>

                                            </div>

                                        </div> */}

                        <div className="mt-2">
                          <h6 className="fw-bold">
                            Products : {orderDetails?.orderItems?.length}
                          </h6>
                          <hr />

                          {orderDetails?.orderItems &&
                            orderDetails?.orderItems?.map(
                              (productDetails, i) => (
                                <div className="my-2" key={i}>
                                  <div
                                    className="row"
                                    style={{ fontSize: "14px" }}
                                  >
                                    <div className="col-sm-4">
                                      <img
                                        src={
                                          productDetails?.image[0]?.url
                                            ? productDetails?.image[0]?.url
                                            : productDetails?.image[0]
                                        }
                                        alt={productDetails?.name}
                                        style={{
                                          width: "100%",
                                          objectFit: "contain",
                                          maxHeight: "150px",
                                        }}
                                      />
                                    </div>
                                    <div className="col-sm-8">
                                      <h6 className="m-0 ms-2">
                                        {productDetails?.name}
                                      </h6>
                                      <div className="row">
                                        <div className="col-sm-6">
                                          <div
                                            className="d-flex justify-content-center mt-2 me-3 "
                                            style={{
                                              width: "6rem",
                                            }}
                                          >
                                            <span className=" mt-1" style={{}}>
                                              {" "}
                                              Quantity:{" "}
                                              {productDetails?.quantity}
                                            </span>
                                          </div>

                                          {productDetails?.gst_amount && (
                                            <p className="m-0 mt-1 ms-3">
                                              <strong> GST Price:</strong>{" "}
                                              {orderDetails?.currency}
                                              {productDetails?.gst_amount}
                                            </p>
                                          )}
                                          <p className="m-0 mt-1 ms-3">
                                            <strong> Subtotal:</strong>{" "}
                                            {orderDetails?.currency}
                                            {productDetails?.product_Subtotal}
                                          </p>
                                        </div>
                                        <div className="col-sm-6">
                                          <p className="m-0 mt-1">
                                            <strong>Price</strong>{" "}
                                            {orderDetails?.currency}
                                            {productDetails?.price}
                                          </p>

                                          {productDetails?.gst_rate && (
                                            <p className="m-0 mt-1">
                                              <span> GST-</span>
                                              {productDetails?.gst_rate} %
                                            </p>
                                          )}
                                          {productDetails?.total_vat_amount && (
                                            <p className="m-0 mt-1">
                                              <small>Total GST</small>{" "}
                                              <small>
                                                {orderDetails?.currency}
                                                {
                                                  productDetails?.total_vat_amount
                                                }
                                              </small>
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <hr />
                                </div>
                              )
                            )}
                          <div className="row">
                            <div className="col-6 ">
                              <small className="mb-3">Shipping Charge: </small>{" "}
                              {orderDetails?.currency}
                              {orderDetails?.shipping_charge}
                              <br />
                              {orderDetails?.isCouponUsed && (
                                <h6 className="mt-1 text-success">
                                  Coupon_Code:
                                  {orderDetails?.couponUsed?.coupon_code}
                                </h6>
                              )}
                            </div>
                            <div className="col-6 ">
                              <h6
                                className=""
                                style={{
                                  textDecoration: orderDetails?.isCouponUsed
                                    ? "line-through"
                                    : "none",
                                  // color: orderDetails?.isCouponUsed
                                  //   ? "red"
                                  //   : "inherit",
                                }}
                              >
                                {" "}
                                Total Amount: {orderDetails?.currency}
                                {Number(orderDetails?.total_amount) +
                                  Number(
                                    orderDetails?.couponUsed?.discount_amount
                                      ? orderDetails?.couponUsed
                                          ?.discount_amount
                                      : 0
                                  )}
                              </h6>{" "}
                              {orderDetails?.isCouponUsed && (
                                <small className="mb-4">
                                  Coupon Discount:{orderDetails?.currency}
                                  {Number(
                                    orderDetails?.couponUsed?.discount_amount
                                  )}
                                </small>
                              )}
                              <br />
                              {orderDetails?.isCouponUsed && (
                                <h6 className="">
                                  {" "}
                                  Total After Discount: {orderDetails?.currency}
                                  {Number(orderDetails?.total_amount)}
                                </h6>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card my-1">
                    <div className="card-body">
                      <label className="fw-bold">Status Timeline :</label>
                      <table
                        className="table table-info table-sm m-0"
                        style={{
                          borderRadius: "8px",
                          borderCollapse: "collapse",
                          overflow: "hidden",
                        }}
                      >
                        <tbody>
                          <tr className="text-center">
                            <th scope="row">Order Placed On</th>
                            <td> : </td>
                            <td>
                              {orderDetails?.createdAt
                                ? new Date(
                                    orderDetails?.createdAt
                                  ).toLocaleString("en-GB", {
                                    timeZone: "Europe/London", // Set the time zone to UK

                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "numeric",
                                    hour12: true,
                                  })
                                : new Date(
                                    productData?.placed_on
                                  ).toLocaleString("en-GB", {
                                    timeZone: "Europe/London", // Set the time zone to UK
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "numeric",
                                    hour12: true,
                                  })}
                            </td>
                          </tr>
                          <tr className="text-center">
                            <th scope="row" className="text-warning">
                              Processing Started
                            </th>
                            <td className="text-warning"> : </td>
                            <td className="text-warning">
                              {orderDetails?.status_timeline?.processing
                                ? new Date(
                                    orderDetails?.status_timeline?.processing
                                  ).toLocaleString("en-GB", {
                                    timeZone: "Europe/London", // Set the time zone to UK
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "numeric",
                                    hour12: true,
                                  })
                                : "-"}
                            </td>
                          </tr>
                          <tr className="text-center">
                            <th scope="row" className="text-primary">
                              Dispatched On
                            </th>
                            <td className="text-primary"> : </td>
                            <td className="text-primary">
                              {orderDetails?.status_timeline?.dispatched
                                ? new Date(
                                    orderDetails?.status_timeline?.dispatched
                                  ).toLocaleString("en-GB", {
                                    timeZone: "Europe/London", // Set the time zone to UK
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "numeric",
                                    hour12: true,
                                  })
                                : "-"}
                            </td>
                          </tr>
                          <tr className="text-center">
                            <th scope="row" className="text-success">
                              Delivered On
                            </th>
                            <td className="text-success"> : </td>
                            <td className="text-success">
                              {orderDetails?.status_timeline?.delivered
                                ? new Date(
                                    orderDetails?.status_timeline?.delivered
                                  ).toLocaleString("en-GB", {
                                    timeZone: "Europe/London", // Set the time zone to UK
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "numeric",
                                    hour12: true,
                                  })
                                : "-"}
                            </td>
                          </tr>
                          {orderDetails?.status_timeline?.cancelled && (
                            <tr className="text-center">
                              <th scope="row" className="text-danger">
                                Cancelled On
                              </th>
                              <td className="text-danger"> : </td>
                              <td className="text-danger">
                                {orderDetails?.status_timeline?.cancelled
                                  ? new Date(
                                      orderDetails?.status_timeline?.cancelled
                                    ).toLocaleString("en-GB", {
                                      timeZone: "Europe/London", // Set the time zone to UK
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "numeric",
                                      hour12: true,
                                    })
                                  : "-"}
                              </td>
                            </tr>
                          )}
                          {/* <tr className="text-center">
                            <th scope="row">Returned On</th>
                            <td> : </td>
                            <td>
                              {orderDetails?.status_timeline?.returned
                                ? new Date(
                                    orderDetails?.status_timeline?.returned
                                  ).toLocaleString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "numeric",
                                    hour12: true,
                                  })
                                : "-"}
                            </td>
                          </tr> */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5 mt-3">
                  <div
                    className="card mb-2"
                    style={{ backgroundColor: "rgb(138, 193, 240)" }}
                  >
                    <div className="m-4 ">
                      {orderDetails?.orderStatus === "cancelled" ? (
                        <>
                          <h5>
                            Order Status:{" "}
                            <span className="text-danger">
                              {orderDetails?.orderStatus}
                            </span>
                          </h5>
                          <p className="text-danger">
                            {" "}
                            Order Cancelled Reason:{" "}
                            {orderDetails?.order_Cancelled_Reason}
                          </p>
                        </>
                      ) : orderDetails?.orderStatus == "unpaid" ? (
                        <>
                          <h5>
                            Order Status:{" "}
                            <span className="text-warning">
                              {orderDetails?.orderStatus}
                            </span>
                          </h5>
                        </>
                      ) : (
                        <h5>
                          Order Status:
                          <span className="text-success">
                            {" "}
                            {orderDetails?.orderStatus}
                          </span>
                        </h5>
                      )}
                      {/* order status change  */}{" "}
                      <div className="mb-2">
                        {" "}
                        {status !== "cancelled" &&
                          status !== "unpaid" &&
                          status !== "returned" &&
                          status !== "delivered" && (
                            <div className="mt-1">
                              <label className="fw-bold">Change Status :</label>
                              <div className="row">
                                <div className="col-8">
                                  <select
                                    className="form-select"
                                    onChange={handleChange}
                                    value={orderStatus}
                                  >
                                    {orderDetails?.orderStatus === "new" && (
                                      <>
                                        <option value="">New</option>
                                        <option value="processing">
                                          Processing
                                        </option>
                                        <option value="cancelled">
                                          Cancelled
                                        </option>
                                      </>
                                    )}
                                    {orderDetails?.orderStatus ===
                                      "processing" && (
                                      <>
                                        <option value="">Processing</option>
                                        <option value="dispatched">
                                          Dispatch
                                        </option>
                                      </>
                                    )}
                                    {orderDetails?.orderStatus ===
                                      "dispatched" && (
                                      <>
                                        <option value="">Dispatch</option>
                                        <option value="delivered">
                                          Delivered
                                        </option>
                                      </>
                                    )}
                                  </select>
                                </div>
                                {/* {orderStatus && ( */}
                                <div className="col-3">
                                  <button
                                    className="btn btn-primary"
                                    onClick={(e) => handlechangestatus(e)}
                                  >
                                    {orderStatus ? "Update" : "Change"}
                                  </button>
                                </div>
                                {/* )} */}
                              </div>
                            </div>
                          )}
                      </div>
                      {/*  */}
                      {/* <div className="d-flex">
                                                <select
                                                    className="form-control me-2"
                                                    onChange={handleChange}
                                                    value={orderStatus}
                                                    ref={getFranchiseeID}
                                                    disabled={shipingInfo !== null}
                                                >
                                                    <option value="" disabled></option>
                                                    {allFranchisee && allFranchisee.map((item, index) =>
                                                        <option key={index} value={item?._id}>{item?.name}</option>
                                                    )}
                                                </select>
                                                <button className='btn-sm btn-primary' onClick={(e) => handleGetSingleFrenchisee(e)} >Add</button>
                                            </div> */}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      {orderDetails?.shipingInfo !== null && (
                        <div className="">
                          <div className="row" style={{ fontSize: "14px" }}>
                            {/* <div className="col-sm-4">
                              <img
                                src={
                                  orderDetails?.shippingInfo?.Franchisee?.banner
                                    ?.url
                                }
                                alt={orderDetails?.shippingInfo?.name}
                                // width='100%'
                                style={{
                                  width: "100%",
                                  objectFit: "contain",
                                  maxHeight: "100px",
                                }}
                              />
                            </div> */}
                            <div className="col-sm-12">
                              <label className="fw-bold fs-5 m-0 ms-2">
                                Shipping Info :
                              </label>
                              <p className="m-0 ms-2">
                                Name: {orderDetails?.shippingInfo?.first_Name}{" "}
                                {orderDetails?.shippingInfo?.last_Name}
                              </p>

                              <p className="m-0 ms-2 mt-1">
                                Contact No. :{" "}
                                {orderDetails?.shippingInfo?.phone_Number}
                              </p>
                              <p className="m-0 ms-2 mt-3">
                                street. : {orderDetails?.shippingInfo?.street}
                              </p>

                              <p className="m-0 ms-2 mt-1">
                                City : {orderDetails?.shippingInfo?.city}
                              </p>
                              <p className="m-0 ms-2 mt-1">
                                State : {orderDetails?.shippingInfo?.state}
                              </p>
                              <p className="m-0 ms-2 mt-1">
                                country : {orderDetails?.shippingInfo?.country}
                              </p>
                              <p className="m-0 ms-2 mt-1">
                                Postal Code. :{" "}
                                {orderDetails?.shippingInfo?.postalCode}
                              </p>
                            </div>
                          </div>
                          <hr />
                        </div>
                      )}
                      <div className="mt-3">
                        <label>
                          <span className="fw-bold">Payment Status : </span>
                          {orderDetails?.isPaid === false ? (
                            <span className="fw-bold text-danger">
                              Not Paid
                            </span>
                          ) : (
                            <span className="fw-bold text-success">Paid</span>
                          )}
                        </label>
                      </div>
                      <div className="">
                        <label>
                          <span className="fw-bold">Payment Mode : </span>
                          {orderDetails?.paymentMode === "online" ? (
                            <span className="fw-bold text-success">ONLINE</span>
                          ) : (
                            <span className="fw-bold text-primary">
                              CASH ON DELIVERY
                            </span>
                          )}
                        </label>
                      </div>

                      <div className="">
                        {orderDetails?.paidAt ? (
                          <label>
                            <span className="fw-bold"> Paid At: </span>
                            {new Date(orderDetails?.paidAt).toLocaleString(
                              "en-GB",
                              {
                                timeZone: "Europe/London", // Set the time zone to UK
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "numeric",
                                hour12: true,
                              }
                            )}
                          </label>
                        ) : (
                          <label>
                            <span className="fw-bold"> Created At: </span>
                            {new Date(orderDetails?.createdAt).toLocaleString(
                              "en-GB",
                              {
                                timeZone: "Europe/London", // Set the time zone to UK
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "numeric",
                                hour12: true,
                              }
                            )}
                          </label>
                        )}
                      </div>
                      <div className="">
                        <label>
                          <span className="fw-bold"> Order Created By: </span>
                          {orderDetails?.user?.name}
                        </label>
                      </div>
                      {orderDetails?.razorpay_payment_id && (
                        <div className="mt-1">
                          <label>
                            <span className="fw-bold">
                              Razorpay Payment ID :{" "}
                            </span>
                            {orderDetails?.razorpay_payment_id
                              ? orderDetails?.razorpay_payment_id
                              : "----"}
                          </label>
                        </div>
                      )}
                      {/* <div className="">
                        <label>
                          <span className="fw-bold">Stripe Payment Session ID : </span>
                          {orderDetails?.stripe_Payment_session_Id
                            ? orderDetails?.stripe_Payment_session_Id
                            : "----"}
                        </label>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "none" }}>
        {/* <PrintOrderDetails productData={productData} ref={printOrderRef} /> */}
      </div>
    </>
  );
}

export default ViewOrders;
