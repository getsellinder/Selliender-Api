import React, { useEffect } from 'react'
import { useLinkedin, usePlan } from './LinkedenContext'
import { useParams } from 'react-router-dom'
import { Box, CircularProgress, Container, Paper, Typography } from "@material-ui/core";


const LinkedinView = () => {
  const { linkedinPlanData, handleLinkedinProfileDetails, linkedinviewLoading } = useLinkedin()
  const { id } = useParams()


  useEffect(() => {
    handleLinkedinProfileDetails(id)
  }, [id])

  const fontstyle = {
    fontWeight: "600", color: "black"
  }
  const content=linkedinPlanData?.LinkedinContentId
  return (
    <Container>
      <Typography style={{
        textAlign: "center", fontSize: "2rem",
        fontWeight: "600", paddingBottom: "1rem",
      }}>Linkedin Details</Typography>
      {linkedinviewLoading === id ? <Box sx={{ textAlign: "center", paddingTop: "3rem" }}><CircularProgress /></Box> :
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Name</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{linkedinPlanData?.LinkedinContentId?.name || "test"}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Email</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{linkedinPlanData?.email || "test@gmail.com"}</Typography>
          </Box>

              <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Recommendations</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {linkedinPlanData?.recommendations?.map((item) => <Typography style={{ ...fontstyle }}>
              {item || "Sports"}
            </Typography>)}

          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Education</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{linkedinPlanData?.education || "Betch"}</Typography>
          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Skills</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
        
            {linkedinPlanData?.skills?.map((item) => <Typography style={{ ...fontstyle }}>
              {item || "IT"}
            </Typography>)}

          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Certifications</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{linkedinPlanData?.certifications || "Adhar"}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Posts
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{linkedinPlanData?.posts  || "POST1"
            }</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Languages</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {linkedinPlanData?.Languages?.map((item) => <Typography style={{ ...fontstyle }}>
              {item || "Btech"}
            </Typography>)}

          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Publications</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {linkedinPlanData?.publications?.map((item) => <Typography style={{ ...fontstyle }}>
              {item || "Publications"}
            </Typography>)}

          </Box>

        </Box>}

    </Container>
  )
}

export default LinkedinView