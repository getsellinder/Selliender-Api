import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import { isAutheticated } from "src/auth";
import { usePlan } from "../Plans/PlanContext";
import toast from "react-hot-toast";
import { CircularProgress } from "@material-ui/core";

import {
  Box,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

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
  const total = subtotal + tax;
  const token = isAutheticated();
  const {
    allPackages,

    packageLoading,

    getAllpackages,
  } = usePlan();
  const { name: username, id } = useParams();
  const [invoice, setInvoice] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const packages = allPackages?.getpackages;

  const tableheading = [
    "InvoiceNo",
    "TransactionId",
    "Plan",
    "Plan start date",
    "Plan expiry date",
    "Amount",
    "Status",
    // "Created",
  ];

  const handleInvoice = async () => {
    try {
      setInvoiceLoading(true);
      const res = await axios.get(`/api/package/get/invoice/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
           303, 3rd Floor, Meridian Plaza Greenlands, Ameerpet Hyderabad, India 500016
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
              <strong>Invoice #</strong> {invoiceData.invoiceNumber}
            </div>
            <div>
              <strong>Invoice Date</strong> {invoiceData.date}
            </div>
            <div>
              <strong>Due Date</strong> {/* example */} {invoiceData.dueDate || "-"}
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
            <Typography>{invoiceData.customer.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {invoiceData.customer.address}
            </Typography>
            <Typography variant="body2">{invoiceData.customer.phone}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" fontWeight={700}>
              Ship To
            </Typography>
            {/* Using same customer for demo; replace with ship info if available */}
            <Typography>{invoiceData.customer.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {invoiceData.customer.address}
            </Typography>
            <Typography variant="body2">{invoiceData.customer.phone}</Typography>
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

          {/* Items with alternating light blue rows, fill to 12 rows like the image */}
          {Array.from({ length: 12 }).map((_, i) => {
            const item = invoiceData.items[i];
            const isEven = i % 2 === 0;
            return (
              <Grid
                container
                key={i}
                sx={{
                  backgroundColor: isEven ? "#eef7fd" : "transparent",
                  borderBottom: "1px solid transparent",
                }}
              >
                <Grid item xs={8} sx={{ p: 1.25 }}>
                  <Typography>
                    {item ? item.description : "\u00A0"}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ p: 1.25, textAlign: "right" }}>
                  <Typography>
                    {item ? `₹${(item.qty * item.price).toLocaleString()}` : "\u00A0"}
                  </Typography>
                </Grid>
              </Grid>
            );
          })}

          {/* Totals box aligned to right */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Box sx={{ width: 320 }}>
              <Grid container sx={{ borderTop: "2px solid #1f6fb2" }}>
                <Grid item xs={8} sx={{ p: 1 }}>
                  Subtotal
                </Grid>
                <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                  ₹{subtotal.toLocaleString()}
                </Grid>
                <Grid item xs={8} sx={{ p: 1 }}>
                  Tax @ 20.0%
                </Grid>
                <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                  ₹{(subtotal * 0.2).toLocaleString()}
                </Grid>
                <Grid item xs={8} sx={{ p: 1 }}>
                  Shipping
                </Grid>
                <Grid item xs={4} sx={{ p: 1, textAlign: "right" }}>
                  ₹0.00
                </Grid>
                <Grid item xs={12} sx={{ borderTop: "1px solid #cfd8e3" }} />
                <Grid item xs={8} sx={{ p: 1, fontWeight: 700 }}>
                  Total
                </Grid>
                <Grid item xs={4} sx={{ p: 1, textAlign: "right", fontWeight: 700 }}>
                  ₹{(subtotal + subtotal * 0.2).toLocaleString()}
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>

        {/* Footer notes */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Make all checks payable to the {invoiceData.companyName || "[Company Name]"}
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
