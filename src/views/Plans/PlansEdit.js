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
    PlanLimit: singlePlanData?.PlanLimit || "",
    name: singlePlanData?.name || "",
    Monthly_features: [""],
    Yearly_features: [""],
  });


  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    // setPlan((prevPlan) => {
    //   if (name === "GST") {
    //     const getItem = getgst.find((item) => item._id === value);
    //     const gstPercent = getItem ? getItem.Gst : 18;

    //     const monthlyPrice = parseFloat(prevPlan.Monthly_Price) || 18;
    //     let yearlyPrice = parseFloat(prevPlan.Yearly_Price) || 18;

    //     let totalMonthly = monthlyPrice + (monthlyPrice * gstPercent) / 100;
    //     const totalYearly = yearlyPrice + (yearlyPrice * gstPercent) / 100;
    //     return {
    //       ...prevPlan,
    //       GST: value,
    //       Total_Monthly_Price: totalMonthly,
    //       Total_Yearly_Price: totalYearly,
    //     };
    //   }
    //   return { ...prevPlan, [name]: value };
    // });

    setPlan((prevPlan) => {
      const updatePlans = { ...prevPlan, [name]: value }
      const gstItem = getgst.find((item) => item._id === updatePlans.GST)
      const gstPercent = gstItem ? gstItem.Gst : 18;
      const monthlyPrice = parseFloat(updatePlans.Monthly_Price) || 0;
      const yearlyPrice = parseFloat(updatePlans.Yearly_Price) || 0;

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
        PlanLimit: singlePlanData.PlanLimit || "",
        name: singlePlanData.name || "",
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plan Name"
                name="name"
                value={plan.name}
                onChange={handleChange}

              />
            </Grid>

            {/* Plan Type */}
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Yearly Price (₹)"
                name="Yearly_Price"
                type="number"
                value={plan.Yearly_Price}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label="Plan Limit 50 members "
                name="PlanLimit"
                value={plan.PlanLimit}
                onChange={handleChange}

              />
            </Grid>
            {/* gst */}
            <Grid item xs={12} sm={12}>
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

            {/* Monthly Price with gst */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Price (₹) with GST"
                name="Total_Monthly_Price"
                type="Monthly_Price"
                value={plan.Total_Monthly_Price}
                onChange={handleChange}
                disabled
              />
            </Grid>

            {/* Yearly Price wit gst*/}
            <Grid item xs={12} sm={6}>
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
