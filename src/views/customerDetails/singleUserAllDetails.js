import { Box, Typography } from "@material-ui/core";
import { Button } from "@mui/material";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const SingleUserAllDetails = () => {
  const [user, setUser] = useState();
  const [userOrder, setUserOrder] = useState();
  const [userAllAddress, setUserAllAddress] = useState([]);
  const token = isAutheticated();
  //   const [loading, setLoading] = useState(true);
  const _id = useParams()?._id;
  // Get Shipping address of individual user
  const getUserAddress = () => {
    // setLoading(true);
    axios
      // .get(`/api/shipping/address/user/address/${_id}`, {
      //   headers: {
      //     "Access-Control-Allow-Origin": "*",
      //     Authorization: `Bearer ${token}`,
      //   },
      // })
      .get(`/admin/user/${_id}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res.data);
        setUserAllAddress(res.data?.UserShippingAddress || []);
        // toast.success(res.data.message ? res.data.message : "Address fetch!");

        // setLoading(false);
      })
      .catch((error) => {
        // setLoading(false);
        // swal({
        //   title: "Warning",
        //   text: error.message,
        //   icon: "error",
        //   button: "Close",
        //   dangerMode: true,
        // });
      });
  };

  console.log("userAllAddress", userAllAddress);
  const getOrders = async () => {
    try {
      const response = await axios.get(`/api/v1/admin/users/orders/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserOrder(response.data.order);
      // setLoading1(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      swal({
        title: "Warning",
        text: error.message,
        icon: "error",
        button: "Close",
        dangerMode: true,
      });
      // setLoading1(false);
    }
  };
  const getUserDetails = useCallback(async () => {
    let resp = await axios.get(`/api/v1/admin/user/${_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUser(resp.data.user);
  }, []);

  // useEffect(() => {
  //     getUserDetails();
  // }, [getUserDetails]);

  useEffect(() => {
    getOrders();
    getUserAddress();
    getUserDetails();
  }, [_id]);
  console.log(userOrder, " Single user order data ");
  console.log(userAllAddress, "user all address ");
  console.log(user, "user ");
  let totalSpent = 0;

  // Iterate through each order and sum up the total_amount
  userOrder?.forEach((order) => {
    totalSpent += order.total_amount;
  });
  const flex = {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    justifyContent: "start",
  };
  const heading = {
    fontSize: "1.2rem",
    color: "gray",
    fontWeight: "600",
    width: "30%",
  };
  const minheading = {
    fontWeight: "bold",
    fontSize: "1.3rem",
  };

  return (
    <div>
      {/* SingleUserAllDetails
      <Link to={`/customers-details`}>
        <button
          type="button"
          className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
        >
          back
        </button>
      </Link> */}
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
              Single Customer All Details
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <h4 className="mb-0"></h4>
            </div>

            <div className="page-title-right">
              <Link to="/customers-details">
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
      <div className="card" style={{ padding: "1rem" }}>
        <h5 style={{ fontWeight: "bold" }}>&bull; Customer Profile </h5>
        <div style={{ marginLeft: "1rem", marginTop: "1rem" }}>
          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer Name</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.name}</div>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer Email</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.email}</div>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer Registered</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <Typography style={{ fontWeight: "bold" }}>
              <b>
                {" "}
                {new Date(user?.createdAt).toLocaleString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </b>
            </Typography>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}>Last Purchase</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <Typography style={{ fontWeight: "bold" }}>
              {userOrder?.length > 0
                ? new Date(userOrder[0]?.createdAt).toLocaleString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })
                : userOrder
                ? "No Purchase"
                : "Loading"}
            </Typography>
          </Box>

          {/* <Typography style={{ fontWeight: "bold" }}>
            Last Purchase:
            <b style={{ marginLeft: "1.5rem" }}>
              {userOrder?.length > 0
                ? new Date(userOrder[0]?.createdAt).toLocaleString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })
                : userOrder
                ? "No Purchase"
                : "Loading"}
            </b>
          </Typography> */}
        </div>
        <div style={{ marginTop: "2rem", width: "100%" }}>
          <h5 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
            &bull; Addresses{" "}
          </h5>
          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}>Customer country</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.country}</div>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer state</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.state}</div>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer city</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.city}</div>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer street</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.street}</div>
          </Box>

          <Box sx={{ ...flex }}>
            <div style={{ ...heading }}> Customer pincode</div>
            <div style={{ fontWeight: "600", fontSize: "1.5rem" }}>:</div>
            <div style={{ ...minheading }}>{user?.pincode}</div>
          </Box>

          {/* <h5 style={{ fontWeight: "bold", marginLeft: "1rem" }}>
            &bull; Total Addresses : {userAllAddress?.length}{" "}
          </h5> */}
          {userAllAddress?.length > 0 && (
            <div className="table-responsive table-shoot mt-3">
              <table
                className="table table-centered table-nowrap"
                style={{ border: "1px solid" }}
              >
                <thead
                  className="thead-info"
                  style={{ background: "rgb(140, 213, 213)" }}
                >
                  <tr>
                    <th>SL No.</th>
                    <th>Address </th>
                    {/* <th>Profile Image</th> */}
                  </tr>
                </thead>
                <tbody>
                  {userAllAddress?.length === 0 && (
                    <tr className="text-center">
                      <td colSpan="6">
                        <h5>No Data Available</h5>
                      </td>
                    </tr>
                  )}
                  {userAllAddress?.map((address, i) => {
                    return (
                      <tr key={i}>
                        <td className="text-start">{i + 1}</td>
                        <td style={{ maxWidth: "400px" }}>
                          <strong>
                            {address?.first_Name} {address?.last_name},
                            {address.company_name
                              ? `${address.company_name},`
                              : ""}
                            {address.gst_number ? `${address.gst_number},` : ""}
                            {address?.phone_Number},{address?.street},
                            {address?.city},{address?.state},{address?.country},
                            {address?.postalCode}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ marginTop: "2rem" }}>
          <h5 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
            &bull; Orders{" "}
          </h5>
          <h5 style={{ fontWeight: "bold", marginLeft: "1rem" }}>
            &bull; Total Orders : {userOrder?.length}{" "}
          </h5>
          <h5 style={{ fontWeight: "bold", marginLeft: "1rem" }}>
            &bull; Total Spent : ₹{totalSpent}{" "}
          </h5>
          {userOrder?.length > 0 && (
            <div className="table-responsive table-shoot mt-3">
              <table
                className="table table-centered table-nowrap"
                style={{ border: "1px solid" }}
              >
                <thead
                  className="thead-info"
                  style={{ background: "rgb(140, 213, 213)" }}
                >
                  <tr>
                    <th>SL No.</th>
                    <th>Order Date </th>
                    <th>Order Id </th>
                    <th>Items </th>
                    <th>Order Amount </th>
                    {/* <th>Profile Image</th> */}
                  </tr>
                </thead>
                <tbody>
                  {userAllAddress?.length === 0 && (
                    <tr className="text-center">
                      <td colSpan="6">
                        <h5>No Data Available</h5>
                      </td>
                    </tr>
                  )}
                  {userOrder?.map((order, i) => {
                    return (
                      <tr key={i}>
                        <td className="text-start">{i + 1}</td>
                        <td>
                          {" "}
                          {new Date(order?.createdAt).toLocaleString("en-IN", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })}
                        </td>
                        <td>{order?.orderID}</td>
                        <td>
                          {order?.orderItems?.map((item, i) => (
                            <div
                              style={{ display: "flex", marginTop: "1rem" }}
                              key={i}
                            >
                              <p>{item?.name}</p>
                              <div>
                                {item?.image?.map((img, i) => (
                                  <img
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      marginLeft: "1rem",
                                    }}
                                    src={img?.url}
                                    alt="img not available"
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </td>
                        <td>₹{order?.total_amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleUserAllDetails;
