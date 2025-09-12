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
import { useAdmin } from "../series/AdminContext";
import { useSeries } from "../series/SeriesContext";
import swal from "sweetalert";
import { useGenreContext } from "../Genres/genreContext";
import { useState } from "react";
import axios from "axios";

const SubjectCreate = () => {
  const { genres,token,getSubjects } = useSeries();
  const {getAllsubgenre}=useAdmin()


  const navigate = useNavigate();

  const {name}=useParams()
  console.log("genrerName",name)
 const [loading, setLoaidng] = useState(false);

  const [createsubgenre, setCreatesubGenre] = useState({
    subjectName: "",
    // genreId: "",
    subjectImage: "",
    coverImagePreview: "",
  });
  const handleChange = (e) => {
    const { value, name } = e.target;
    setCreatesubGenre((prev) => ({
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
      setCreatesubGenre((prev) => ({
        ...prev,
        subjectImage: file,
        coverImagePreview: previewURL,
      }));
    }
  };
  const {id}=useParams()


  const handleSaveSubject = async (e) => {

    try {
      e.preventDefault();
  

      if ( !createsubgenre.subjectImage) {
        swal({
          title: "Warning",
          text: "Please fill all the required fields!",
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        return;
      }

      const formData = new FormData();
      formData.append("subjectName", createsubgenre.subjectName);
      formData.append("subjectImage", createsubgenre.subjectImage);
      // formData.append("genreId", createsubgenre.genreId);
      setLoaidng(true);

      const response = await axios.post(`/api/genre/subgenre/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        getSubjects();
        getAllsubgenre(id);

        swal({
          title: "Added",
          text: "New subject added successfully!",
          icon: "success",
          button: "OK",
        });
        navigate(-1);
        setCreatesubGenre({
          subjectName: "",
          // genreId: "",
          subjectImage: "",
          coverImagePreview: "",
        });
      }
    } catch (error) {
      const message = error.response.data.message;
      //  setSaveLoading(true);
      swal({
        title: error,
        text: message || "something went wrong",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    } finally {
      setLoaidng(false);
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
        <Typography variant="h5" mb={2} style={{ paddingBottom: "1rem" }}>
          Add Subgnre
        </Typography>
        <form onSubmit={handleSaveSubject}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="off"
                label="subgenre name"
                name="subjectName"
                value={createsubgenre.subjectName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
             <Grid item xs={12}>
              <TextField
                autoComplete="off"
                label="genre name"
                name="subjectName"
                value={name}
                disabled
           
                fullWidth
                
              />
            </Grid>

            {/* <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">genre</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="genre"
                  name="genreId"
                  value={createsubgenre.genreId}
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
            </Grid> */}

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
              {createsubgenre.coverImagePreview && (
                <Box mt={2}>
                  <img
                    src={createsubgenre.coverImagePreview}
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

export default SubjectCreate;
