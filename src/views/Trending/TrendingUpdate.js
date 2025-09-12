import axios from "axios";
import React, { useEffect, useState } from "react";
// import { useSeries } from "./SeriesContext";
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
import { useSeries } from "../series/SeriesContext";
import { useTrending } from "./TreadingContext";

const TrendingUpdate = () => {
  const { id } = useParams();
  const { singleTrending ,getAlltreadings} = useTrending();
 
  const { token } = useSeries();
  const navigate=useNavigate()
  const [loading, setLoading] = useState(false);
  

  const [treadingData, setTreadingData] = useState({
    content: singleTrending.content || "",
    image: "",
    coverImagePreview: singleTrending.image.fileUrl,
  });

  const handleChange = (e) => {
    const { value, name } = e.target;
    setTreadingData((prev) => ({
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
      setTreadingData((prev) => ({
        ...prev,
        image: file,
        coverImagePreview: previewURL,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("content", treadingData.content);
      form.append("image", treadingData.image);
      setLoading(true);
      const res = await axios.put(`/api/update/trading/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const msg = res.data.message;
      navigate("/Trending")
      getAlltreadings(true)
      toast.success(msg);
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  console.log("TreadingId from singleTrending", singleTrending);
  console.log("id",id)

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
        <Typography variant="h5" mb={2} style={{ paddingBottom: "1rem" }}>
          Update Treading
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="off"
                label="content"
                name="content"
                value={treadingData.content}
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
              {treadingData.coverImagePreview && (
                <Box mt={2}>
                  <img
                    src={treadingData.coverImagePreview}
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
              <Button type="submit" variant="contained" fullWidth>
                {loading ? "Loading......" : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </form>
        {/* {errordata && (
             <Stack sx={{ width: "100%", mt: 2, mb: 2 }}>
               <Alert variant="filled" severity="error">
                 {errordata}
               </Alert>
             </Stack>
           )} */}
      </Box>
    </div>
  );
};

export default TrendingUpdate;
