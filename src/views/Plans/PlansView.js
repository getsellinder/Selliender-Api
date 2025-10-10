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
          fontWeight: 700,
      mb: 1,
      fontSize: "15px",
      fontFamily: "'Poppins', sans-serif",
      color: "#1E293B", // slate dark for title
    // fontWeight: "600", color: "gray"
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
            <Typography style={{ ...fontstyle, width: "20%" }}>Plan Name</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.Package}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>Gst</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.GST?.Gst==undefined?0:`${singlePlanData?.GST?.Gst}%`}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>MonthlyPrice</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.Monthly_Price==null?0:`₹${singlePlanData?.Monthly_Price}`}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>YearlyPrice</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.Yearly_Price==null?0:`₹${singlePlanData?.Yearly_Price}`}</Typography>
          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>Monthly Total Price with GST</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>  {singlePlanData.Total_Monthly_Price===null?0:` ₹${singlePlanData.Total_Monthly_Price}`}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>Yearly Total Price with GST</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.Total_Yearly_Price==null?0:`₹${singlePlanData?.Total_Yearly_Price}`}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>User Limit Montly
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.monthlyUserLimit
            }</Typography>
          </Box>
          
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>User Limit Yearly
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.yearlyUserLimit
            }</Typography>
          </Box>
             
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>SearchLimit Yearly
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.SearchLimitYearly
            }</Typography>
          </Box>
             
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>SearchLimit Monthly
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{singlePlanData?.SearchLimitMonthly
            }</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>Monthly Features</Typography>
             <Typography style={{ ...fontstyle }}>:</Typography>
             <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {singlePlanData?.Monthly_features?.map((item, index) => (
      <Typography
        key={index}
       style={{ ...fontstyle }}
      >
        {index + 1}. {item}
      </Typography>
    ))}
  </Box>

          </Box>
          


          {/* <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>Yearly Features</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {singlePlanData?.Yearly_features?.map((item) => <Typography style={{ ...fontstyle }}>
              {item}
            </Typography>)}

          </Box> */}
          
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "20%" }}>Yearly Features</Typography>
             <Typography style={{ ...fontstyle }}>:</Typography>
             <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {singlePlanData?.Yearly_features?.map((item, index) => (
      <Typography
        key={index}
       style={{ ...fontstyle }}
      >
        {index + 1}. {item}
      </Typography>
    ))}
  </Box>

          </Box>
          

        </Box>}

    </Container>
  )
}

export default PlanView