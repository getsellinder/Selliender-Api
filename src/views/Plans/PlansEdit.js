import React, { useEffect, useState } from "react";

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
  CircularProgress,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import axios from "axios";
import { isAutheticated } from "src/auth";
import toast from "react-hot-toast";
import { usePlan } from "./PlanContext";
import { useNavigate, useParams } from "react-router-dom";

const PlanEdit = () => {
  const token = isAutheticated();
  const [planLoading, setPlanLoading] = useState(false);
  const { getgst, singlePlanData, handleSinglePackage, getAllpackages } = usePlan();
  const { id } = useParams();

  console.log('update plan id', singlePlanData)


  const plans = ["Free", "Pro", "Growth", "Enterprise"];
  const navigate = useNavigate();

  const [plan, setPlan] = useState({
    Package: singlePlanData?.Package,
    GST: singlePlanData?.GST?.Gst._id || null,
    Yearly_Price: singlePlanData?.Yearly_Price || "",
    Total_Monthly_Price: singlePlanData?.Total_Monthly_Price || "",
    Total_Yearly_Price: singlePlanData?.Total_Yearly_Price || "",
    Monthly_Price: singlePlanData?.Monthly_Price || "",

    name: singlePlanData?.name || "",
    yearlyUserLimit: singlePlanData?.yearlyUserLimit || "",
    monthlyUserLimit: singlePlanData?.yearlyUserLimit || "",

    SearchLimitMonthly: singlePlanData?.SearchLimitMonthly || "",
    SearchLimitYearly: singlePlanData?.SearchLimitYearly || "",
    Monthly_features: [""],
    Yearly_features: [""],
    gstMonthlyPrice: "" || 0,
    gstYearlyPrice: "" || 0
  });


  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;


    setPlan((prevPlan) => {
      const updatePlans = { ...prevPlan, [name]: value }
      const gstItem = getgst.find((item) => item._id === updatePlans.GST)
      const gstPercent = gstItem ? gstItem.Gst : 18;
      const monthlyPrice = parseFloat(updatePlans.Monthly_Price) || 0;
      const yearlyPrice = parseFloat(updatePlans.Yearly_Price) || 0;


      updatePlans.gstMonthlyPrice = (monthlyPrice * gstPercent) / 100
      updatePlans.gstYearlyPrice = (yearlyPrice * gstPercent) / 100

      updatePlans.Total_Monthly_Price = monthlyPrice + (monthlyPrice * gstPercent) / 100;
      updatePlans.Total_Yearly_Price = yearlyPrice + (yearlyPrice * gstPercent) / 100;

      return updatePlans;

    })
  };

  const addfeature = (type) => {
    setPlan({ ...plan, [type]: [...plan[type], ""] });
  };
  const removeFeature = (type, index) => {
    const newFeatures = plan[type].filter((_, i) => i !== index);
    setPlan({ ...plan, [type]: newFeatures });
  };

  const handleFeatureChange = (type, index, value) => {
    setPlan((prevPlan) => {
      const newFeatures = [...prevPlan[type]];
      newFeatures[index] = value;
      return { ...prevPlan, [type]: newFeatures };
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setPlanLoading(true);
      const res = await axios.put(`/api/package/update/${id}`, plan, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(res?.data?.message);
      navigate("/Pricing-Plans");

      getAllpackages(1, undefined, undefined, undefined)
    } catch (error) {
      let message = error?.response?.data?.message;
      console.log("message", message)
      toast.error(message);
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    handleSinglePackage(id);
  }, [id]);
  useEffect(() => {

    if (singlePlanData) {

      setPlan({
        Package: singlePlanData.Package || "",
        GST: singlePlanData.GST?._id || null,
        Yearly_Price: singlePlanData.Yearly_Price || "",
        Total_Monthly_Price: singlePlanData.Total_Monthly_Price || "",
        Total_Yearly_Price: singlePlanData.Total_Yearly_Price || "",
        Monthly_Price: singlePlanData.Monthly_Price || "",
        yearlyUserLimit: singlePlanData?.yearlyUserLimit || "",
    monthlyUserLimit: singlePlanData?.yearlyUserLimit || "",
        name: singlePlanData.name || "",
           SearchLimitMonthly: singlePlanData?.SearchLimitMonthly || "",
    SearchLimitYearly: singlePlanData?.SearchLimitYearly || "",
        Monthly_features: singlePlanData.Monthly_features || [""],
        Yearly_features: singlePlanData.Yearly_features || [""],

      });
    }
  }, [singlePlanData]);




  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Update Pricing Plan
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Plan Name */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={plan.name}
                onChange={handleChange}

              />
            </Grid>

            {/* Plan Type */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Plan Type"
                name="Package"
                value={plan.Package}
                onChange={handleChange}
              >
                {plans.map((name) => (
                  <MenuItem value={name}>{name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Monthly Price */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Monthly Price (₹)"
                name="Monthly_Price"
                type="number"
                value={plan.Monthly_Price}
                onChange={handleChange}
              />
            </Grid>

            {/* Yearly Price */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Yearly Price (₹)"
                name="Yearly_Price"
                type="number"
                value={plan.Yearly_Price}
                onChange={handleChange}
              />
            </Grid>

            {/* gst */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="GST"
                name="GST"
                // value={plan.GST}
                onChange={handleChange}
              >
                {getgst.map((item) => (
                  <MenuItem value={item._id} key={item._id}>
                    {item.Gst}%
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Yearly GST Price */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Yearly GST Price (₹)"
                name="gstPrice"
                type="number"
                value={plan.gstYearlyPrice}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Monthly Gst Price */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Monthly GST Price (₹)"
                name="gstMonthlyPrice"
                type="number"
                value={plan.gstMonthlyPrice}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Monthly Price with gst */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Monthly Price (₹) with GST"
                name="Total_Monthly_Price"
                type="Monthly_Price"
                value={plan.Total_Monthly_Price}
                onChange={handleChange}
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Yearly Price wit gst*/}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Yearly Price (₹) With GST"
                name="Total_Yearly_Price"
                type="number"
                value={plan.Total_Yearly_Price}
                onChange={handleChange}
                disabled
              />
            </Grid>

            {/* Monthly Search limit */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Limit Yearly"
                name="SearchLimitYearly"
                type="number"
                value={plan.SearchLimitYearly}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>


            {/* Monthly Search limit */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Limit Monthly"
                name="SearchLimitMonthly"
                type="number"
                value={plan.SearchLimitMonthly}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="User Limit Yearly"
                name="yearlyUserLimit"
                type="number"
                value={plan.yearlyUserLimit}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>


            {/* Monthly User limit */}
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label="User Limit Monthly"
                name="monthlyUserLimit"
                type="number"
                value={plan.monthlyUserLimit}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* yeaerFeatures */}
            <Grid item xs={12}>
              <Typography variant="h6">Yearly Features</Typography>
              {plan?.Yearly_features?.map((feature, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    fullWidth
                    label={`Yearly Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) =>
                      handleFeatureChange(
                        "Yearly_features",
                        index,
                        e.target.value
                      )
                    }
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeFeature("Yearly_features", index)}
                    disabled={plan.Yearly_features.length === 1}
                  >
                    <RemoveCircle />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => addfeature("Yearly_features", index)}
                  >
                    <AddCircle />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* monthFeatures */}
            <Grid item xs={12}>
              <Typography variant="h6">Monthly Features</Typography>
              {plan?.Monthly_features?.map((feature, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    fullWidth
                    label={`Monthly Feature ${index + 1}`}
                    value={plan.Monthly_features[index]}
                    name="Monthly_features"
                    onChange={(e) =>
                      handleFeatureChange(
                        "Monthly_features",
                        index,
                        e.target.value
                      )
                    }
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeFeature("Monthly_features", index)}
                    disabled={plan.Monthly_features.length === 1}
                  >
                    <RemoveCircle />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => addfeature("Monthly_features", index)}
                  >
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
                {planLoading ? <CircularProgress size={25} /> : "Save Plan"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default PlanEdit;
