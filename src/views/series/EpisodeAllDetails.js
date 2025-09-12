// import { Box, Typography } from '@material-ui/core'
import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useSeries } from "./SeriesContext";

const EpisodeAllDetails = () => {
  const { singleEpisode } = useSeries();


  console.log("singleEpisode", singleEpisode);
  console.log("singleEpisode?.thumbnail?.fileUrl",singleEpisode?.thumbnail?.fileUrl)

  return (
    <div>
      <Stack>
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: "600",
            paddingY: "1rem",
            borderBottom: "2px solid red",
            marginBottom: "10px",
          }}
        >
          Episode Details
        </Typography>

        <Stack sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Title
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.title}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Episodenumber
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.episodenumber}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Duration
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.duration}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Thumbnail
            </Typography>
            <Typography>:</Typography>
            <img
              src={singleEpisode?.thumbnail?.fileUrl || ""}
              style={{ height: "2rem", width: "2rem" }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              audioUrl
            </Typography>
            <Typography>:</Typography>
            <Stack style={{ width: "50%" }}>
              <audio controls >
                <source src={singleEpisode?.audioUrl.fileUrl || ""} type="audio/mpeg" />
              </audio>
            </Stack>
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Description
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.description}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              About
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.about}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Subjectname
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.subject}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              Genrename
            </Typography>
            <Typography>:</Typography>
            <Typography>{singleEpisode?.genre}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "2rem" }}>
            <Typography
              sx={{ fontSize: "1rem", fontWeight: "600", width: "20%" }}
            >
              IsStandalone
            </Typography>
            <Typography>:</Typography>
            <Typography>{String(singleEpisode?.isStandalone)}</Typography>
          </Box>
        </Stack>
      </Stack>
    </div>
  );
};

export default EpisodeAllDetails;
