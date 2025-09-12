import axios from "axios";
import React, { useState } from "react";
import { useSeries } from "./SeriesContext";
import { useNavigate } from "react-router-dom";
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

const SeasonCreate = () => {
  const [seriesData, setSeriesdata] = useState({
    seriesno: "",
    seriestitle: "",
    description: "",
    about: "",
    seriespart: "",
    coverImage: "",
    coverImagePreview: "",
  });
  const { token, getseries, fetchseries, getSeasons } = useSeries();
  const [loading, setLoading] = useState(false);
  const [errordata, setErrorData] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("name", name, "value", value);
    setSeriesdata((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "seriesno") {
      console.log("create series", value);
      getSeasons(value);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected File:", file);
      const previewURL = URL.createObjectURL(file);
      setSeriesdata((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: previewURL,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("episodedaata", seriesData);

    try {
      setLoading(true);
      const form = new FormData();
      form.append("seriesno", seriesData.seriesno);
      form.append("seriestitle", seriesData.seriestitle);
      form.append("description", seriesData.description);
      form.append("about", seriesData.about);

      form.append("seriespart", seriesData.seriespart);
      form.append("coverImage", seriesData.coverImage);
      const res = await axios.post("/api/create/seasons", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;

      console.log("result", result);
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
      getseries();
      setLoading(false);
      setErrorData("");
      //   navigate("/series");
    }
  };

  return (
    <div>
      {errordata && (
        <Stack sx={{ width: "100%", mt: 2, mb: 2 }}>
          <Alert variant="filled" severity="error">
            {errordata}
          </Alert>
        </Stack>
      )}
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
          Add Season
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* <Grid item xs={12}>
              <TextField  autoComplete="off"
                label="Series Number"
                name="seriesno"
                value={seriesData.seriesno}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid> */}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">SeriesId</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="seriesno"
                  name="seriesno"
                  value={seriesData.seriesId}
                  onChange={handleChange}
                  fullWidth
                >
                  {fetchseries?.data?.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item.seriesno}>
                        {item.seriesno}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
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
                autoComplete="off"
                label="Description"
                name="description"
                value={seriesData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete="off"
                label="About"
                name="about"
                value={seriesData.about}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth>
                {loading ? "Loading......" : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};

export default SeasonCreate;
