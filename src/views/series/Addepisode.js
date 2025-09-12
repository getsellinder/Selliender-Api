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
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

const Addepisode = () => {
  const [episodeData, setEpisodedata] = useState({
    title: "",
    episodenumber: "",
    audioUrl: "", //audio file
    duration: "",
    thumbnail: "", //image
    description: "",
    about: "",
    seriesId: "",
    subject: "",
    genre: "",
    isStandalone: "",
    coverImagePreview: "",
    coverAudioPreview: "",
    seasonNo: "",
  });
  const {
    token,
    subjects,
    genres,
    fetchseries,
    season,
    getSeasons,
    getallepisode,
    getsignleSeries,
    getallserieswithepisode,
    seasonseries,
    getseries,
  } = useSeries();

  const [loading, setLoading] = useState(false);
  const [errordata, setErrorData] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("series id0000000000000000000", id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEpisodedata((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "seriesId") {
      const selectedSeries = fetchseries?.data?.find((s) => s._id === value);
      if (selectedSeries) {
        getSeasons(selectedSeries.seriesno);
      }
    }
    // if(episodeData.isStandalone === "No"){
    //   if(name==="genre"){
    //     value=season.genrename

    //   }
    // }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const isStandaloneValue = episodeData.seriesId ? false : true;
      const form = new FormData();

      form.append("title", episodeData.title);
      form.append("episodenumber", episodeData.episodenumber);
      form.append("audioUrl", episodeData.audioUrl);
      form.append("duration", episodeData.duration);
      form.append("thumbnail", episodeData.thumbnail);
      form.append("description", episodeData.description);
      form.append("about", episodeData.about);

      form.append("coverImagePreview", episodeData.coverImagePreview);
      const res = await axios.post(`/api/episode/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;
      getallserieswithepisode(id);
      getallepisode();
      toast.success("Episode created Successfully");

      getseries();
      navigate(`/title/details/${id}`);
    } catch (error) {
      const message = error?.response?.data?.message;
      toast.error(message);
      if (message && message.includes("E11000 duplicate key error")) {
        setErrorData(
          "Episode Number already exists. Please use a unique value."
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
  console.log("episodeData", episodeData);

  return (
    <div>
      <Box
        p={2}
        sx={{
          maxWidth: 800,
          mx: "auto",

          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" mb={2}>
          Add Episode
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} className="hello">
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
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
            {/* <Grid item xs={episodeData.isStandalone === "false" ? 6 : 12}>
              <FormControl fullWidth sx={{ padding: "5px" }}>
                <InputLabel id="demo-simple-select-label">
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
            {/* genrse and subject */}

            {/* serieId */}

            {episodeData.isStandalone === "No" && (
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
            )}

            {episodeData.seriesId && (
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
                    {/* {season?.map((item, index) => (
                      <MenuItem key={index} value={item.seriespart}>
                        {item.seriespart}
                      </MenuItem>
                    ))} */}
                    <MenuItem value={season.seriespart}>
                      {season.seriespart}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

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
                    src={episodeData.coverImagePreview}
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
                // sx={{ padding: "5px" }}
                autoComplete="off"
                label="Episode duration"
                name="duration"
                value={episodeData.duration}
                onChange={handleChange}
                margin="normal"
                fullWidth
                multiline
              />{" "}
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
                    : `${100 - episodeData.about.length} characters remaining`
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
                    ? `Minimum 10 characters required (${episodeData.description.length}/150)`
                    : `${150 - episodeData.description.length} characters remaining`
                }
                error={
                  episodeData.description.length > 0 &&
                  episodeData.description.length < 10
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

export default Addepisode;
