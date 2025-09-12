import axios from "axios";
import React, { useState } from "react";
import { useSeries } from "./SeriesContext";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import Button from "@mui/material/Button";
import { Alert, Stack } from "@mui/material";
import toast from "react-hot-toast";

const EpisodeUpdate = () => {
  const {
    token,
    subjects,
    genres,
    fetchseries,
    singleEpisode,
    getSeasons,
    season,
    seriesIdlocal,
    getallserieswithepisode,
    singleSeriepisodeId,
    updateshowdata,
    getallepisode,
    seasonseries,
    getsubjectbygenrename,
    gsubjectnames,
  } = useSeries();
  console.log("singleEpisode", singleEpisode);

  const [episodeData, setEpisodedata] = useState({
    title: singleEpisode.title,
    episodenumber: singleEpisode.episodenumber,
    audioUrl: singleEpisode.audioUrl, //audio file
    duration: singleEpisode.duration,
    thumbnail: singleEpisode.thumbnail, //image
    description: singleEpisode.description,
    about: singleEpisode.about,
    seriesId: singleEpisode.seriesId || "",
    subject: singleEpisode.subjectId || "",
    genre: singleEpisode.genreId || "",
    isStandalone: singleEpisode.isStandalone ? "Yes" : "No",
    seasonNo: singleEpisode?.seasonNo?.toString() || "",
    coverImagePreview: singleEpisode?.thumbnail,
    coverAudioPreview: singleEpisode?.audioUrl?.fileUrl,
  });

  const [loading, setLoading] = useState(false);
  const [errordata, setErrorData] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEpisodedata((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "seriesId") {
      const selectedSeries = fetchseries?.data?.find((s) => s._id === value);
      if (selectedSeries) {
        console.log("Selected seriesno:", selectedSeries.seriesno);
        getSeasons(selectedSeries.seriesno);
      }
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      const MAX_IMAGE_SIZE_MB = 2;

      if (fileSizeInMB > MAX_IMAGE_SIZE_MB) {
        toast.error("Please select an image smaller than 2MB.");
        return;
      }
      const previewURL = URL.createObjectURL(file);
      console.log("previewURL", file);
      setEpisodedata((prev) => ({
        ...prev,
        thumbnail: file,
        coverImagePreview: previewURL,
      }));
    }
  };
  const handleAudioChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      console.log("Selected Audio:", file);
      setEpisodedata((prev) => ({
        ...prev,
        audioUrl: file,
        coverAudioPreview: URL.createObjectURL(file),
      }));
    }
  };

  console.log("episodeData.coverAudioPreview", episodeData.coverAudioPreview);

  const { id } = useParams();
  console.log("seriesIdlocal", seriesIdlocal);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const form = new FormData();
      // const isStandaloneValue = episodeData.seriesId ? false : true;
      // if (episodeData.isStandalone === "Yes") {
      //   form.append("isStandalone", true);
      // } else {
      //   form.append("isStandalone", false);
      // }

      form.append("title", episodeData.title);
      form.append("episodenumber", episodeData.episodenumber);
      form.append("audioUrl", episodeData.audioUrl);
      form.append("duration", episodeData.duration);
      form.append("thumbnail", episodeData.thumbnail);
      form.append("description", episodeData.description);
      form.append("about", episodeData.about);
      //   form.append("seriesId", episodeData.seriesId?episodeData.seriesId:null);
      // form.append("seriesId", episodeData.seriesId);
      // form.append("seasonNo", episodeData.seasonNo);
      // form.append("subject", episodeData.subject);
      // form.append("genre", episodeData.genre);
      // form.append("isStandalone", episodeData.isStandalone);
      form.append("coverImagePreview", episodeData.coverImagePreview);
      const res = await axios.put(`/api/update/episode/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;

      await getallserieswithepisode(singleSeriepisodeId);
      getallepisode();

      toast.success(result.message || "Episode Updated Successfully");

      // navigate(`/title/details/${id}`);

      navigate(-1);
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message && message.includes("E11000 duplicate key error")) {
        setErrorData(
          "Series Number already exists. Please use a unique value."
        );
      } else if (message) {
        setErrorData(message);
      } else {
        setErrorData("Something went wrong. Please try again.");
      }
    } finally {
      setErrorData("");
      setLoading(false);
    }
  };
  // const episodeboolen = ["true", "false"];
  const episodeboolen = ["Yes", "No"];
  console.log("season", season);
  return (
    <div>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",

          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" mb={2} sx={{ paddingBottom: "1rem" }}>
          Update Episode
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                label="Episode title"
                name="title"
                value={episodeData.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="Episode No"
                name="episodenumber"
                value={episodeData.episodenumber}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            {/* 
            <Grid item xs={episodeData.isStandalone === "false" ? 6 : 12}>
              <FormControl fullWidth>
                <InputLabel
                  id="demo-simple-select-label"
                  sx={{ padding: "10px" }}
                >
                  Is this a Standalone Episode?
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="isStandalone"
                  name="isStandalone"
                  onChange={handleChange}
                  value={episodeData.isStandalone}
                  fullWidth
                >
                  {episodeboolen.map((item) => (
                    <MenuItem value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}

            {/*            
            {episodeData.isStandalone === "Yes" && (
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">genre</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="genre"
                    name="genre"
                    value={episodeData.genre}
                    onChange={handleChange}
                    fullWidth
                  >
                    {genres.map((item, index) => (
                      <MenuItem key={index} value={item._id}>
                        {item.genreName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {episodeData.isStandalone === "Yes" && (
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Subject</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="subject"
                    name="subject"
                    onChange={handleChange}
                    value={episodeData.subject}
                    fullWidth
                  >
                    {subjects.map((item, index) => (
                      <MenuItem key={item._id} value={item._id} >
                        {item.subjectName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )} */}

            {/* serieId */}

            {/* {episodeData.isStandalone === "No" && (
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    SeriesId
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="seriesId"
                    name="seriesId"
                    onChange={handleChange}
                    value={episodeData.seriesId}
                    fullWidth
                  >
                    {seasonseries?.map((item, index) => (
                      <MenuItem key={index} value={item._id}>
                        {item.seriesno}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )} */}

            {/* {episodeData?.seriesId && (
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    seasonNo
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="seasonNo"
                    name="seasonNo"
                    onChange={handleChange}
                    value={episodeData.seasonNo}
                    fullWidth
                  >
                    {season?.map((item, index) => (
                      <MenuItem key={index} value={item.seriespart}>
                        {item.seriespart}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )} */}

            {/* {episodeData.seriesId && (
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    seasonNo
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="seasonNo"
                    name="seasonNo"
                    onChange={handleChange}
                    value={episodeData.seasonNo}
                    fullWidth
                  >
                   
                    <MenuItem value={season.seriespart}>
                      {season.seriespart}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )} */}

            {/* <Grid item xs={6}>
              <FormControl fullWidth sx={{ padding: "5px" }}>
                <InputLabel id="demo-simple-select-label">
                  {episodeData.isStandalone === "No" ? "" : "genre"}
                </InputLabel>
                {episodeData.isStandalone === "No" ? (
                  episodeData.seriesId && (
                    <TextField
                      value={season.genrename}
                      InputProps={{
                        readOnly: true,
                      }}
                      placeholder="genrename"
                      fullWidth
                      variant="outlined"
                      disabled={episodeData.isStandalone === "No"}
                    />
                  )
                ) : (
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="genre"
                    name="genre"
                    value={episodeData.genre}
                    // onChange={handleChange}

                    onChange={(e) => {
                      handleChange(e);

                      getsubjectbygenrename({ genreId: e.target.value });
                    }}
                    fullWidth
                  >
                    {episodeData.isStandalone === "No" && (
                      <MenuItem value={season.genreId}>
                        {season.genrename}
                      </MenuItem>
                    )}
                    {genres.map((item, index) => (
                      <MenuItem key={index} value={item._id}>
                        {item.genreName}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Grid> */}

            {/* subject */}
            {/* <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  {episodeData.isStandalone === "No" ? "" : "Subject"}
                </InputLabel>

                {episodeData.isStandalone === "No" ? (
                  episodeData.seriesId && (
                    <TextField
                      value={season.subjectname}
                      placeholder="subject"
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                      variant="outlined"
                      disabled={episodeData.isStandalone === "No"}
                    />
                  )
                ) : (
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="subject"
                    name="subject"
                    onChange={handleChange}
                    value={episodeData.subject}
                    fullWidth
                  >
                    {gsubjectnames.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item._id}>
                          {item.subjectName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              </FormControl>
            </Grid> */}
            {/* genrse and subject */}

            <Grid item xs={12}>
              <Typography variant="subtitle1" mb={1}>
                Thumbnail
              </Typography>
              <Button variant="contained" component="label">
                Upload Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {episodeData.coverImagePreview && (
                <Box mt={2}>
                  <img
                    src={episodeData.coverImagePreview?.fileUrl}
                    alt="Cover Preview"
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" mb={1}>
                AudioUrl
              </Typography>
              <Button variant="contained" component="label">
                Upload AudioUrl
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={handleAudioChange}
                />
              </Button>
              {episodeData.coverAudioPreview && (
                <Box mt={2}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Audio Preview:
                  </label>
                  <audio
                    key={episodeData.coverAudioPreview.fileUrl}
                    controls
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    <source
                      src={episodeData.coverAudioPreview}
                      type="audio/mpeg"
                    ></source>
                  </audio>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="Episode duration"
                name="duration"
                value={episodeData.duration}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="About"
                name="about"
                value={episodeData.about}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                inputProps={{ minLength: 10, maxLength: 100 }}
                helperText={
                  episodeData.about.length < 10
                    ? `Minimum 10 characters required (${episodeData.about.length}/100)`
                    : `${100 - episodeData.about.length} Characters remaining`
                }
                error={
                  episodeData.about.length > 0 && episodeData.about.length < 10
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="Description"
                name="description"
                value={episodeData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                 inputProps={{ minLength: 10, maxLength: 150 }}
                helperText={
                  episodeData.description.length < 10
                    ? `Minimum 10 characters required (${episodeData?.description?.length}/150)`
                    : `${150 - episodeData.description.length} Characters remaining`
                }
                error={
                  episodeData?.description?.length > 0 && episodeData?.description?.length < 10
                }
              />
            </Grid>

            {/* button section */}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                {loading ? "Loading......" : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </form>
        {errordata && (
          <Stack sx={{ width: "100%", mt: 2, mb: 2 }}>
            <Alert variant="filled" severity="error">
              {errordata}
            </Alert>
          </Stack>
        )}
      </Box>
    </div>
  );
};

export default EpisodeUpdate;
