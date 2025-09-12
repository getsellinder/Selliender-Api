import React, { useEffect, useState } from "react";
// import Button from "@material-ui/core/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import axios from "axios";
import { isAutheticated } from "src/auth";
import { Button, ImageList, InputLabel, ImageListItem } from "@mui/material";
import MessageList from "./MessageList";
import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";
const SupportReply = () => {
  const token = isAutheticated();
  const navigate = useNavigate();
  const [data, setData] = useState({
    user: "admin",
    replyDate: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };
  const options = {
    weekday: "short", // Abbreviated weekday (e.g., "Tue")
    day: "numeric", // Numeric day (e.g., "5")
    month: "short", // Abbreviated month (e.g., "Mar")
    year: "numeric", // Numeric year (e.g., "2024")
    hour: "numeric", // Numeric hour (e.g., "10")
    minute: "2-digit", // Two-digit minute (e.g., "27")
    hour12: true, // Use 12-hour clock (true/false)
  };
  // console.log(useParams())
  const { ticketID } = useParams();

  const [success, setSuccess] = useState(true);
  const [ticketDetails, setticketDetails] = useState(null);
  const [fetchData, setFetchData] = useState(false);
  const [getloading, setgetLoading] = useState(false);


  const getSupportTicketDetails = async () => {
    setgetLoading(true);
    axios
      .get(`/api/support/getOne/${ticketID}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res?.data);
        setticketDetails(res.data?.support);
        // setTicket(res.data?.support);
        // console.log(res.data?.support);
        // getuserName(res.data?.support);
        setgetLoading(false);


        // setLoading(false);
      })
      .catch((error) => {
        setgetLoading(false);

        swal({
          title: error,
          text: "please login to access the resource or refresh the page  ",
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        // setLoading(false);
      });
  };
  // ************************************
  // updating message in backend************
  const handleSubmit = () => {
    if (data.message.trim() === "") {
      swal({
        title: "Warning",
        text: "Fill all mandatory fields",
        icon: "error",
        button: "Close",
        dangerMode: true,
      });
      return;
    }
    setLoading(true);
    const formData = {
      message: data.message,
      replyDate: new Date().toLocaleString("en-US", options),
      user: "admin",
    };
    axios
      .patch(
        `/api/support/update/${ticketID}`,
        {
          message: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Message Sent successfully!");
        setLoading(false);
        setData({ message: "" });
        // setFetchData(true);
        setSuccess((prev) => !prev);

        // navigate("/support/request", { replace: true });
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
          button: "Close",
        });
      });
  };
  // ************************************
  // const getuserName = async (ticket) => {
  //   try {
  //     const userId = ticket.addedBy;
  //     let resp = await axios.get(`/api/v1/admin/user/${userId}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log(resp?.data?.user?.name);
  //     const userName = resp?.data?.user?.name;
  //     const userMailId = resp?.data?.user?.email;
  //     // console.log(userName);
  //     // Update support ticket with user name
  //     const ticketWithUserName = {
  //       ...ticket,
  //       userName: userName,
  //       userMailId: userMailId,
  //     };
  //     setticketDetails(ticketWithUserName);
  //   } catch (error) {
  //     // Handle errors
  //   }
  // };

  React.useEffect(() => {
    getSupportTicketDetails();
    // setFetchData(false);
  }, [success]);

  // ************************************
  return (
    <div className="container">
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
              Support Chat
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <h4 className="mb-0"></h4>
            </div>
            <div className="page-title-right">
              {/* <Button
                variant="contained"
                color="primary"
                style={{
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textTransform: "capitalize",
                  marginRight: "5px",
                }}
                onClick={() => handleSubmit()}
                disabled={loading}
              >
                {loading ? "Loading" : "Submit"}
              </Button> */}
              {/* <Button
                variant="outlined"
                color="error"
                style={{
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textTransform: "capitalize",
                }}
                onClick={() => {
                  swal({
                    title: "Warning",
                    text: "Are you sure you want to go back?",
                    icon: "error",
                    buttons: ["No", "Yes"], // Specify the buttons array
                    dangerMode: true,
                  }).then((value) => {
                    if (value) {
                      navigate("/support/request", { replace: true });
                    } else {
                      return;
                    }
                  });
                }}
              >
                Back
              </Button> */}
            </div>
          </div>
        </div>
      </div>
      <div className="row">

        <div className="col-lg-12 col-md-12  col-sm-12 my-1">
          {getloading ? <div>Loading....</div> : <div className="card h-100">
            <div className="card-body px-5">
              <div className="mb-3">
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  Ticket ID: {ticketDetails?._id}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  User ID: {ticketDetails?.addedBy?._id}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  User Name: {ticketDetails?.addedBy?.name}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  User Email ID: {ticketDetails?.addedBy?.email}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  From: <span className={` badge ${ticketDetails?.from === 'Mobile' ? 'bg-warning' : 'bg-primary'}`}>{ticketDetails?.from}</span>
                </InputLabel>

                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  Date and Time: {new Date(ticketDetails?.createdAt).toLocaleString("en-GB", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  Subject: {ticketDetails?.subject}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  Description:{" "}
                  {ticketDetails?.description
                    ? ticketDetails?.description
                    : "No Description"}
                </InputLabel>
              </div>
              <div className="mb-3">
                {ticketDetails?.image?.length > 0 && (
                  <div>
                    <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                      Image:
                    </InputLabel>
                    <ImageList sx={{ width: 500 }} cols={3} rowHeight={164}>
                      {ticketDetails?.image?.map((item) => (
                        <ImageListItem key={item.public_id}>
                          <img
                            srcSet={`${item.url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            src={`${item.url}?w=164&h=164&fit=crop&auto=format`}
                            alt={item.title || "No image"}
                            loading="lazy"
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </div>
                )}
              </div>
              <div className="mb-3">
                {ticketDetails && (
                  <MessageList messages={ticketDetails?.message} />
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Message *
                </label>
                <textarea
                  type="text"
                  className="form-control"
                  id="message"
                  rows="10"
                  cols="100"
                  value={data.message}
                  placeholder="your message..."
                  maxLength="500"
                  onChange={(e) => handleChange(e)}
                ></textarea>

                {data.message ? (
                  <>
                    <small className="charLeft mt-4 fst-italic">
                      {500 - data.message.length} characters left
                    </small>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="mb-3">
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textTransform: "capitalize",
                    marginRight: "5px",
                  }}
                  onClick={() => handleSubmit()}
                  disabled={loading}
                >
                  {loading ? "Loading" : "Submit"}
                </Button>
                {/* <Link to="/support/request"> */}
                <Button
                  variant="outlined"
                  color="error"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textTransform: "capitalize",
                  }}
                  onClick={() => {
                    // swal({
                    //   title: "Warning",
                    //   text: "Are you sure you want to go back?",
                    //   icon: "error",
                    //   buttons: ["No", "Yes"], // Specify the buttons array
                    //   dangerMode: true,
                    // }).then((value) => {
                    //   if (value) {
                    navigate("/support/request", { replace: true });
                    // } else {
                    //   return;
                    // }
                    // });
                  }}
                >
                  Back
                </Button>
                {/* </Link> */}
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default SupportReply;
