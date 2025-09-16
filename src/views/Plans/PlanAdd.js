import React, { useState } from "react";

import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Paper,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import axios from "axios";
import { isAutheticated } from "src/auth";
import toast from "react-hot-toast";
import { usePlan } from "./PlanContext";

const PlanAdd = () => {
  const token = isAutheticated();
  const [planLoading, setPlanLoading] = useState(false);
  const {getgst}=usePlan()
  console.log("getgst",getgst)

  const [plan, setPlan] = useState({
    name: "",
    type: "Free",
    GST:"",
    monthlyPrice: "",
    yearlyPrice: "",
    features: [""],
    limit: "",
    Total_Price:""
  });
  const plans = ["Free", "Pro", "Growth", "Custom"];

  // handle input change
  const handleChange = (e) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  // handle feature change
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...plan.features];
    newFeatures[index] = value;
    setPlan({ ...plan, features: newFeatures });
  };

  // add feature
  const addFeature = () => {
    setPlan({ ...plan, features: [...plan.features, ""] });
  };

  // remove feature
  const removeFeature = (index) => {
    const newFeatures = plan.features.filter((_, i) => i !== index);
    setPlan({ ...plan, features: newFeatures });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPlanLoading(true);
      const res = await axios.post("/api/package/create", plan, {
        headers: {
          Authorization: `Bearer ${token}`,
          
        },
      });
      toast.success(res?.data?.message);
    } catch (error) {
      let message = error?.response?.data?.message;
      toast.error(message);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Add Pricing Plan
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Plan Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={plan.name}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Plan Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Plan Type"
                name="type"
                value={plan.type}
                onChange={handleChange}
              >
                {plans.map((name) => (
                  <MenuItem value={name}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Monthly Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Price (₹)"
                name="monthlyPrice"
                type="number"
                value={plan.monthlyPrice}
                onChange={handleChange}
              />
            </Grid>

            {/* Yearly Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Yearly Price (₹)"
                name="yearlyPrice"
                type="number"
                value={plan.yearlyPrice}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label="Plan Limit 50 members "
                name="name"
                value={plan.limit}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* gst */}
                  <Grid item xs={12} sm={12}>
              <TextField
                select
                fullWidth
                label="GST"
                name="type"
                value={plan.GST}
                onChange={handleChange}
              >
                {getgst.map((item) => (
                  <MenuItem value={item.Gst}>{item.Gst}%</MenuItem>
                ))}
              </TextField>
            </Grid>

               {/* Monthly Price with gst */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Price (₹) with GST"
                name="monthlyPrice"
                type="number"
                value={plan.monthlyPrice}
                onChange={handleChange}
                disabled
              />
            </Grid>

            {/* Yearly Price wit gst*/}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Yearly Price (₹) With GST"
                name="yearlyPrice"
                type="number"
                value={plan.yearlyPrice}
                onChange={handleChange}
                disabled
              />
            </Grid>
            
    


            {/* Features */}
            <Grid item xs={12}>
              <Typography variant="h6">Features</Typography>
              {plan.features.map((feature, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    fullWidth
                    label={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeFeature(index)}
                    disabled={plan.features.length === 1}
                  >
                    <RemoveCircle />
                  </IconButton>
                  <IconButton color="primary" onClick={addFeature}>
                    <AddCircle />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
                
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                {planLoading?<CircularProgress size={25}/>:"Save Plan"}
           
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PlanAdd;
