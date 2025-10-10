import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import { isAutheticated } from "src/auth";
import { usePlan } from "../Plans/PlanContext";
import toast from "react-hot-toast";
import { CircularProgress } from "@material-ui/core";

import { Box, Typography, Grid, Paper, Button } from "@mui/material";

const Invoice = () => {
  const invoiceData = {
    companyName: "TravelEase Pvt. Ltd.",
    companyAddress: "123 MG Road, Hyderabad, India",
    invoiceNumber: "INV-2025-1010",
    date: "10 Oct 2025",
    customer: {
      name: "Shirisha R",
      address: "Plot No. 45, Jubilee Hills, Hyderabad",
      phone: "+91 9876543210",
      email: "shirisha@example.com",
    },
    items: [
      { description: "Holiday Package - Maldives", qty: 1, price: 55000 },
    ],
  };

  const subtotal = invoiceData.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const tax = subtotal * 0.18;

  const token = isAutheticated();

  const { name: username, id } = useParams();
  const [invoice, setInvoice] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(null);

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
  console.log("invoice", invoice);
  return (
    <>
      <Paper
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
            <Typography variant="h5" fontWeight={600} color="#0b63a8">
              Neonflake Enterprises (OPC) Pvt Ltd
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              303, 3rd Floor, Meridian Plaza Greenlands, Ameerpet Hyderabad,
              India 500016
            </Typography>
          </Grid>

          <Grid
            item
            xs={4}
            sx={{
              backgroundColor: "#1f6fb2",
              color: "#fff",
              p: 2,
              textAlign: "right",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Invoice
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <div>
                <strong>Invoice </strong> {invoice?.InvoiceNo}
              </div>
              <div>
                <strong>Invoice Date</strong> {invoice?.createdAt}
              </div>
              <div>
                <strong>Plan Taken Date</strong> {/* example */}{" "}
                {invoice.plan_start_date || "-"}
              </div>
              <div>
                <strong>Plan Expiry Date</strong> {/* example */}{" "}
                {invoice.plan_expiry_date || "-"}
              </div>
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ p: 3 }}>
          {/* Bill To / Ship To */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight={700}>
                Bill To
              </Typography>
           <Typography>
  {/* {invoice?.userId?.name
    ? invoice.userId.name.charAt(0).toUpperCase() + invoice.userId.name.slice(1)
    : ""} */}
    {invoice?.userId?.name?invoice.userId?.name.charAt(0).toUpperCase()+invoice.userId.name.slice(1):""}
</Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice?.userId?.email}
              </Typography>
              <Typography variant="body2">{invoice?.userId?.phone} </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight={700}>
                Ship To
              </Typography>
              {/* Using same customer for demo; replace with ship info if available */}
              <Typography>
                Neonflake Enterprises OPC Pvt Ltd 303, 3rd Floor, Meridian Plaza
                Greenlands, Ameerpet Hyderabad, India 500016
              </Typography>

              <Typography variant="body2">+91 8977002747</Typography>
            </Grid>
          </Grid>

          {/* Description table (two columns) */}
          <Box component={Paper} elevation={0} sx={{ mt: 1, mb: 2 }}>
            <Grid container sx={{ backgroundColor: "#1f6fb2", color: "#fff" }}>
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
                  {invoice ? invoice?.PlanId?.Package : "\u00A0"}
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ p: 1.25, textAlign: "right" }}>
                <Typography>
                  ₹
                  {invoice?.duration == "yearly"
                    ? invoice?.PlanId?.Yearly_Price
                    : invoice?.PlanId?.Monthly_Price}
                </Typography>
              </Grid>
            </Grid>

            {/* Totals box aligned to right */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Box sx={{ width: 320 }}>
                <Grid container sx={{ borderTop: "2px solid #1f6fb2" }}>
                  <Grid item xs={8} sx={{ p: 1 }}>
                    Subtotal
                  </Grid>
                  <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                    ₹
                    {invoice?.duration == "yearly"
                      ? invoice?.PlanId?.Yearly_Price
                      : invoice?.PlanId?.Monthly_Price}
                  </Grid>
                  <Grid item xs={8} sx={{ p: 1 }}>
                    GST @ ₹{invoice?.GST}%
                  </Grid>
                  <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                    ₹
                    {invoice?.duration == "yearly"
                      ? invoice?.PlanId?.gstYearlyPrice
                      : invoice?.PlanId?.gstMonthlyPrice}
                  </Grid>
                  {invoice?.duration == "yearly" && (
                    <>
                      <Grid item xs={8} sx={{ p: 1 }}>
                        Original Amount
                      </Grid>
                      <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                        ₹{invoice?.PlanId.Total_Yearly_Price}
                      </Grid>
                    </>
                  )}

                  {invoice?.duration == "yearly" && (
                    <>
                      <Grid item xs={8} sx={{ p: 1 }}>
                        Discount @ 20%
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
                  )}

                  <Grid item xs={12} sx={{ borderTop: "1px solid #cfd8e3" }} />
                  <Grid item xs={8} sx={{ p: 1, fontWeight: 700 }}>
                    Total
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{ p: 1, textAlign: "right", fontWeight: 700 }}
                  >
                    ₹{invoice?.Amount}
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>

          {/* Footer notes */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Make all checks payable to the Neonflake Enterprises OPC Pvt Ltd.
            </Typography>
            <Typography variant="h6" sx={{ color: "#1976d2", mt: 2 }}>
              Thank you for your business!
            </Typography>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default Invoice;
