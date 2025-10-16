import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { isAutheticated } from "src/auth";
import toast from "react-hot-toast";
import { CircularProgress } from "@material-ui/core";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { useCustomer } from "../CustomerSupport/CustomerContext";

const Invoice = () => {
  //  appdetails

  const token = isAutheticated();

  const { name: username, id } = useParams();
  const [invoice, setInvoice] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const [address, setaddress] = useState();
  const { appdetails } = useCustomer();


  const handleInvoice = async () => {
    try {
      setInvoiceLoading(true);
      const res = await axios.get(`/api/package/get/invoice/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("res", res);

      setInvoice(res.data);
      localStorage.setItem("packageId", id);

      console.log("red.data", res.data);
    } catch (error) {
      const messsage = error?.response?.data?.message;
      toast.error(messsage || "Internal Server Error");
    } finally {
      setInvoiceLoading(false);
    }
  };
  useEffect(() => {
    handleInvoice(id);
  }, [id]);
  console.log("invoice",invoice)

  return (
    <>
    {invoice.map((val,index)=>{
      return(
    <Paper key={index}
        elevation={4}
        sx={{
          p: 0,
          borderRadius: 1,
          backgroundColor: "#fff",
          maxWidth: 900,
          margin: "24px auto",
          fontFamily: "Poppins, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Top header with blue blocks */}
        <Grid container>
          <Grid
            item
            xs={8}
            sx={{
              backgroundColor: "#dbeefb",
              p: 3,
              minHeight: 120,
            }}
          >
            <div>
              {appdetails.map((item, index) => {
                return (
                  <>
                    {item.logo.map((val) => (
                      <img
                        key={index}
                        src={val.Footerlogo.url}
                        style={{ height: "4rem" }}
                      />
                    ))}
                  </>
                );
              })}
            </div>

            {appdetails.map((item, index) => {
              return (
                <>
                  {item.address.map((val, index) => {
                    return (
                      <>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          {val.company}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {val.address}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {val.city}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {val.state} {val.country} {val.pincode}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          GST Number : {val?.gstNumber}
                        </Typography>
                      </>
                    );
                  })}
                </>
              );
            })}
          </Grid>

          <Grid
            color="text.secondary"
            item
            xs={4}
            sx={{
              // backgroundColor: "#1f6fb2",
              backgroundColor: "#dbeefb",
              // color: "#fff",
              p: 2,
              textAlign: "right",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Invoice
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <div>
                <strong>Invoice </strong> {val?.InvoiceNo}
              </div>
              <div>
                <strong>Invoice Date</strong> {val?.createdAt}
              </div>

              {/* <div>
                <strong style={{ color: "#222", fontWeight: 600 }}>
                  Plan Duration
                </strong>
                <span>{invoice?.duration || "-"}</span>
              </div> */}
              {/* <div>
                <strong>Plan Taken Date</strong>
                {invoice.plan_start_date || "-"}
              </div>invoice?.duration 
              <div>
                <strong>Plan Expiry Date</strong> 
                {invoice.plan_expiry_date || "-"}
              </div> */}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ p: 3 }}>
          <Box component={Paper} elevation={0} sx={{ mt: 1, mb: 2 }}>
            <Grid
              container
              sx={{ backgroundColor: "#dbeefb" }}
              color="text.secondary"
            >
              <Grid item xs={8} sx={{ p: 1.5 }}>
                <strong>Plan</strong>
              </Grid>

              <Grid item xs={4} sx={{ p: 1.5, textAlign: "right" }}>
                <strong>Amount</strong>
              </Grid>
            </Grid>

            <Grid
              container
              sx={{
                backgroundColor: "#eef7fd",
                borderBottom: "1px solid transparent",
              }}
            >
              <Grid item xs={8} sx={{ p: 1.25 }}>
                <Typography>
                  {val ? val?.PlanId?.Package : "\u00A0"}
                </Typography>
              </Grid>

              <Grid item xs={4} sx={{ p: 1.25, textAlign: "right" }}>
                <Typography>
                  ₹
                  {val?.duration == "yearly"
                    ? val?.PlanId?.Yearly_Price
                    : val?.PlanId?.Monthly_Price}
                </Typography>
              </Grid>
            </Grid>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Grid sx={{ display: "flex", flexDirection: "column" }}>
                <Box>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      p: 1.25,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                      {val ? val?.plan_start_date : "\u00A0"} To{" "}
                      {val ? val?.plan_expiry_date : "\u00A0"}
                    </Typography>
                  </Grid>
                </Box>
                <Box sx={{ width: 320, p: 2, borderRadius: 2 }}>
                  {/* <Typography
                    color="text.secondary"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Plan Features
                  </Typography> */}

                <Grid container sx={{pt: 1 }}>
  {/* ✅ Bullet + Search Limit */}
  <Grid
    item
    xs={12}
    sx={{
      display: "flex",
      alignItems: "flex-start",
      mb: 1,
    }}
  >
    <Typography
      sx={{
        fontWeight: 600,
        mr: 1,
        color: "#1f6fb2",
        minWidth: "20px",
      }}
    >
      •
    </Typography>

    <Typography sx={{ fontSize: "14px", color: "#333" }}>
      {val?.duration === "monthly"
        ? `${val?.PlanId?.SearchLimitMonthly} Profile Monthly`
        : `${val?.PlanId?.SearchLimitYearly} Profile Monthly`}
    </Typography>
  </Grid>

  {/* ✅ Bullet + Only the 2nd Feature */}
  {(
    val?.duration === "monthly"
      ? val?.PlanId?.Monthly_features
      : val?.PlanId?.Yearly_features
  )?.slice(1, 2).map((item, index) => (
    <Grid
      item
      xs={12}
      key={index}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        mb: 1,
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          mr: 1,
          color: "#1f6fb2",
          minWidth: "20px",
        }}
      >
        •
      </Typography>

      <Typography sx={{ fontSize: "14px", color: "#333" }}>
        {item}
      </Typography>
    </Grid>
  ))}
</Grid>

                </Box>
              </Grid>
              <Box sx={{ width: 320 }}>
                <Grid container sx={{ borderTop: "2px solid #1f6fb2" }}>
                  <Grid item xs={8} sx={{ p: 1 }}>
                    Subtotal
                  </Grid>
                  <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                    ₹
                    {val?.duration == "yearly"
                      ? val?.PlanId?.Yearly_Price
                      : val?.PlanId?.Monthly_Price}
                  </Grid>
                  <Grid item xs={8} sx={{ p: 1 }}>
                    GST @ ₹{val?.GST}%
                  </Grid>
                  <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                    ₹
                    {val?.duration == "yearly"
                      ? val?.PlanId?.gstYearlyPrice
                      : val?.PlanId?.gstMonthlyPrice}
                  </Grid>
                  {/* {invoice?.duration == "yearly" && (
                    <>
                      <Grid item xs={8} sx={{ p: 1 }}>
                        Standard Price
                      </Grid>
                      <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                        ₹{invoice?.PlanId.Total_Yearly_Price}
                      </Grid>
                    </>
                  )} */}

                  {/* {invoice?.duration == "yearly" && (
                    <>
                      <Grid item xs={8} sx={{ p: 1 }}>
                       Annual Plan Savings @ 20%
                      </Grid>
                      <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                        ₹
                        {(
                          Number(
                            String(invoice?.PlanId.Total_Yearly_Price).replace(
                              /,/g,
                              ""
                            )
                          ) * 0.2
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Grid>
                    </>
                  )} */}

                  <Grid item xs={12} sx={{ borderTop: "1px solid #cfd8e3" }} />
                  <Grid item xs={8} sx={{ p: 1, fontWeight: 700 }}>
                    Total
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{ p: 1, textAlign: "right", fontWeight: 700 }}
                  >
                    ₹{val?.Amount}
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>

          {/* Footer notes */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ color: "#1976d2", mt: 2 }}>
              Thank you for your business!
            </Typography>
          </Box>
        </Box>
      </Paper>
      )
    })}
  
    </>
  );
};

export default Invoice;
