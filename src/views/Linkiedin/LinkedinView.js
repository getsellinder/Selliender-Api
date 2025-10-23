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
  console.log("linkedinPlanData", linkedinPlanData)
  const content = linkedinPlanData?.LinkedinContentId
  console.log("content", content)

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
            <Typography style={{ ...fontstyle, width: "10%" }}>Location</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>

            <Typography style={{ ...fontstyle }}>
              {content?.location}
            </Typography>

          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600", width: "100%" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Education</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{content?.education.map((c) => {
              return (
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <div className='box-style' style={{ width: "100%" }}>
                    <span className='likedin-head' style={{ width: "40%"}}>School</span>
                    <span>:</span>
                    <span>{c.school}</span>
                  </div>
                  <div className='box-style'>
                    <span>Degree</span>
                    <span>:</span>
                    <span>{c.degree}</span>
                  </div>
                  <div className='box-style'>
                    <span>Year</span>
                    <span>:</span>
                    <span>{c.year}</span>
                  </div>

                </div>
              )
            })}</Typography>
          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Skills</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>

            {content?.skills?.map((item) => <Typography style={{ ...fontstyle }}>
              {item}
            </Typography>)}

          </Box>


          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Title</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>

            <Typography style={{ ...fontstyle }}>
              {content?.title}
            </Typography>

          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Certifications</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{content?.certifications.map((c) => {
              return (
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <div className='box-style' style={{ width: "100%" }}>
                    <span className='likedin-head' >Name</span>
                    <span>:</span>
                    <span>{c.name}</span>
                  </div>
                  <div className='box-style'>
                    <span>IssueDate</span>
                    <span>:</span>
                    <span>{c.issueDate}</span>
                  </div>
                  <div className='box-style'>
                    <span>Issuer</span>
                    <span>:</span>
                    <span>{c.issuer}</span>
                  </div>
                  <div className='box-style'>
                    <span>CredentialId</span>
                    <span>:</span>
                    <span>{c.credentialId}</span>
                  </div>

                </div>
              )
            })}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Posts
            </Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            <Typography style={{ ...fontstyle }}>{content?.posts.length}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "5rem", fontWeight: "600" }}>
            <Typography style={{ ...fontstyle, width: "10%" }}>Languages</Typography>
            <Typography style={{ ...fontstyle }}>:</Typography>
            {content?.languages?.map((item) => <Typography style={{ ...fontstyle }}>
              {item}
            </Typography>)}

          </Box>




        </Box>}

    </Container>
  )
}

export default LinkedinView