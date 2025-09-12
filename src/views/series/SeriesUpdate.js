import React, { useState } from "react";
import axios from "axios";
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
import { useSeries } from "./SeriesContext";
import toast from "react-hot-toast";

const SeriesUpdate = () => {
  const {
    token,
    subjects,
    genres,
    singleSeries,
    getseries,
    getsubjectbygenrename,
    gsubjectnames,
  } = useSeries();

  const [seriesData, setSeriesdata] = useState({
    seriesno: singleSeries.seriesno,
    seriestitle: singleSeries.seriestitle,
    description: singleSeries.description,
    about: singleSeries.about,
    genre: singleSeries.genreId,
    subject: singleSeries.subjectId,
    seriespart: singleSeries.seriespart,
    coverImage: "",
    coverImagePreview: singleSeries.coverImage,
  });

  const [loading, setLoading] = useState(false);
  const [errordata, setErrorData] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeriesdata((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setSeriesdata((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: previewURL,
      }));
    }
  };

  const { id } = useParams();
  console.log("id", id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("seriesData", seriesData);

    try {
      setLoading(true);
      const form = new FormData();
      form.append("seriesno", seriesData.seriesno);
      form.append("seriestitle", seriesData.seriestitle);
      form.append("description", seriesData.description);
      form.append("about", seriesData.about);
      form.append("genre", seriesData.genre);
      form.append("subject", seriesData.subject);
      form.append("seriespart", seriesData.seriespart);
      form.append("coverImage", seriesData.coverImage);
      const res = await axios.put(`/api/update/series/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;

      await getseries();

      navigate("/title");
      toast.success(result.message);
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
      setLoading(false);
      setErrorData("");
    }
  };
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
        <Typography variant="h5" mb={2}>
          Update Series
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                label="Series Number"
                name="seriesno"
                value={seriesData.seriesno}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">genre</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="genre"
                  name="genre"
                  value={seriesData.genre}
                  // onChange={handleChange}
                  onChange={(e) => {
                    handleChange(e);
                    getsubjectbygenrename({ genreId: e.target.value });
                  }}
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
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Subject</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="subject"
                  name="subject"
                  onChange={handleChange}
                  value={seriesData.subject}
                  fullWidth
                >
                  {gsubjectnames.map((item, index) => (
                    <MenuItem key={index} value={item._id}>
                      {item.subjectName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="Series Title"
                name="seriestitle"
                value={seriesData.seriestitle}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" mb={1}>
                Cover Image
              </Typography>
              <Button variant="contained" component="label">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {seriesData.coverImagePreview && (
                <Box mt={2}>
                  <img
                    src={seriesData.coverImagePreview}
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
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="Series Part"
                name="seriespart"
                value={seriesData.seriespart}
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
                value={seriesData.about}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                 inputProps={{ minLength: 10, maxLength: 150 }}
                helperText={
                  seriesData.about.length < 10
                    ? `Minimum 10 characters required (${seriesData.about.length}/150)`
                    : `${150 - seriesData.about.length} characters remaining`
                }
                error={
                  seriesData.about.length > 0 &&
                  seriesData.about.length < 10
                }
              />
            </Grid>
                <Grid item xs={12}>
              <TextField
                sx={{ padding: "5px" }}
                autoComplete="off"
                label="Description"
                name="description"
                value={seriesData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                  inputProps={{ minLength: 10, maxLength: 150 }}
                helperText={
                  seriesData.description.length < 10
                    ? `Minimum 10 characters required (${seriesData.description.length}/150)`
                    : `${150 - seriesData.description.length} characters remaining`
                }
                error={
                  seriesData.description.length > 0 &&
                  seriesData.description.length < 10
                }
              />
            </Grid>

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

export default SeriesUpdate;
