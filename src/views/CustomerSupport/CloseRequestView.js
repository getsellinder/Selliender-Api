import React, { useEffect, useState } from "react";
// import Button from "@material-ui/core/Button";
import { Link, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import axios from "axios";
import { isAutheticated } from "src/auth";
import { Button, ImageList, InputLabel, ImageListItem } from "@mui/material";
import MessageList from "./MessageList";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const CloseRequestView = () => {
  // Assuming you have the following ticket details
  const { ticketID } = useParams();
  const token = isAutheticated();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  // error****************************please check
  const [ticketDetails, setticketDetails] = useState(null);

  // const dispatch = useDispatch();
  // const tickets = useSelector((state) => state.ticket.ticket);
  // useEffect(() => {
  //   dispatch(getTicketItem());
  // }, [dispatch]);

  // console.log(tickets);
  // geting data from backend************

  // const dispatch = useDispatch();
  // const tickets = useSelector((state) => state.ticket.ticket);
  // useEffect(() => {
  //   dispatch(getTicketItem());
  // }, [dispatch]);

  // console.log(tickets);
  // useEffect(() => {
  //   const foundTicket = tickets.find((ticket) => ticket.ticketId === ticketID);
  //   // console.log(foundTicket);
  //   setticketDetails(foundTicket);
  // }, [ticketID]);
  // console.log(ticketID);
  // *****************
  // geting data from backend************
  const getSupportTicketDetails = async () => {
    // console.log(ticketID);
    axios
      .get(`/api/support/getOne/${ticketID}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res?.data);
        // setticketDetails(res.data?.support);
        // setTicket(res.data?.support);
        console.log(res.data?.support);
        getuserName(res.data?.support);
        // setLoading(false);
      })
      .catch((error) => {
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
  const getuserName = async (ticket) => {
    try {
      const userId = ticket.addedBy;
      let resp = await axios.get(`/api/v1/admin/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(resp?.data?.user?.name);
      const userName = resp?.data?.user?.name;
      const userMailId = resp?.data?.user?.email;
      // console.log(userName);
      // Update support ticket with user name
      const ticketWithUserName = {
        ...ticket,
        userName: userName,
        userMailId: userMailId,
      };
      setticketDetails(ticketWithUserName);
    } catch (error) {
      // Handle errors
    }
  };

  React.useEffect(() => {
    getSupportTicketDetails();
  }, []);
  // *****************

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
              View Request
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <h4 className="mb-0"></h4>
            </div>
            <div className="page-title-right">
              <Button
                variant="outlined"
                color="error"
                style={{
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textTransform: "capitalize",
                }}
                onClick={() => {
                  navigate("/support/request/closed", { replace: true });
                }}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 col-md-12  col-sm-12 my-1">
          <div className="card h-100">
            <div className="card-body px-5">
              <div className="mb-3">
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  Ticket ID: {ticketDetails?._id}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  User ID: {ticketDetails?.addedBy}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  User Name: {ticketDetails?.userName}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  User MailId: {ticketDetails?.userMailId}
                </InputLabel>
                <InputLabel htmlFor="name" sx={{ mt: 1, mb: 2 }}>
                  Date and Time: {ticketDetails?.createdOn}
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

              {/* *************** */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseRequestView;
