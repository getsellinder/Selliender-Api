import React, { useEffect } from 'react'
import { usePlan } from './PlanContext'
import { useParams } from 'react-router-dom'
import { Box, CircularProgress, Container, Paper, Typography } from "@material-ui/core";


const PlanView = () => {
  const { singlePlanData, handleSinglePackage, packageviewLoading } = usePlan()
  const { id } = useParams()
  console.log("singlePlanData", singlePlanData, id)

  useEffect(() => {
    handleSinglePackage(id)
  }, [id])

  const fontstyle = {
    fontWeight: "600", color: "black"
  }
  return (
    <Container>
      <Typography style={{
        textAlign: "center", fontSize: "2rem",
        fontWeight: "600", paddingBottom: "1rem",
      }}>Plan Details</Typography>
      {packageviewLoading === id ? <Box sx={{ textAlign: "center", paddingTop: "3rem" }}><CircularProgress /></Box> :
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Plan Name</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.Package}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Gst</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.GST?.Gst}%</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>MonthlyPrice</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>₹{singlePlanData?.Monthly_Price}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>YearlyPrice</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>₹{singlePlanData?.Yearly_Price}</Typography>
          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Monthly Total Price with GST</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>₹{singlePlanData?.Total_Monthly_Price}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Yearly Total Price with GST</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>₹{singlePlanData?.Total_Yearly_Price}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>PlanLimit
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.PlanLimit
            }</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Monthly Features</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {singlePlanData?.Monthly_features?.map((item) => <Typography style={{ ...fontstyle }}>
              {item}
            </Typography>)}

          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Yearly Features</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {singlePlanData?.Yearly_features?.map((item) => <Typography style={{ ...fontstyle }}>
              {item}
            </Typography>)}

          </Box>

        </Box>}

    </Container>
  )
}

export default PlanView