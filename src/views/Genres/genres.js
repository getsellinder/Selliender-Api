import React, { useState, useEffect } from "react";
import { Grid, Select, MenuItem } from "@mui/material";
import {
  FormControl,
  // Grid,
  InputLabel,
  // MenuItem,
  // Select,
} from "@material-ui/core";

import axios from "axios";
import { isAutheticated } from "src/auth";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Button,
  Box,
  IconButton,
  Modal,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ClipLoader } from "react-spinners";
import swal from "sweetalert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
// import { Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
// import { FormControl } from "react-bootstrap";
import { useSeries } from "../series/SeriesContext";
import { useAdmin } from "../series/AdminContext";
import { useNavigate, useParams } from "react-router-dom";
import SubjectCreate from "../Subjects/subjectCreate";
import { useGenreContext } from "./genreContext";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "0.5rem",
  boxShadow: 24,
  width: "500px",
};

const Genres = () => {
  const token = isAutheticated();
  const { id } = useParams();

  const [updating, setUpdating] = useState(true);
  const [saveLoding, setSaveLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [genreName, setGenreName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [genreImage, setGenreImage] = useState("");

  const [error, setError] = useState("");
  const [genreId, setGenreId] = useState("");
  // const [genres, setGenres] = useState([]);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [subopen, setSubopen] = useState(false);

  const [seriesloadingview, setSeriesLoadingView] = useState(null);
  // const [viewsubgenre, setViewSubGenre] = useState(false);

  const [olderGenreName, setOlderGenreName] = useState("");
  const [olderImage, setOlderImage] = useState("");
  // const [genreId,setGenreId]=useState()

  const { gsubjectnames, subjects } = useSeries();
  const {
    handleDelete: handlesubjectDelete,
    getAllsubgenre,
    GenreSubjectModel,
    GenreSubjectModelLoading,
    setGenreSubjectModelLoading,
    setViewSubGenre,
    viewsubgenre,
    subdelloading,
    subjectViewError,
    genres,
    getGenres,
    loading,
    setLoading,
    subjectViewId,
    setEditSubGenre,
    setGenreIdlocal,
    handleUpdateOnchange,
    handeSubjectUpdate,
    subjectupdate,
    handleFileChangeSubect,
    subjectloading,
    getsubtbyid,
    getAdminSubjectView,
    setSubjectViewId,
  } = useAdmin();

  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handelSubgenOpen = () => setSubopen(true);
  const hanldeViewsubgenre = () => setSubopen(true);
  const handleEditsubgenreOpen = () => setEditSubGenre(true);
  const handelSubgenClose = () => {
    setSubopen(false);
  };
  const handleviewsubgenreClose = () => {
    setViewSubGenre(false);
    setGenreSubjectModelLoading([]);
  };
  const handeEditsubgenreClose = () => {
    setEditSubGenre(false);
  };

  const handleClose = () => {
    setOpen(false);
    setEdit(false);
    setGenreName("");

    setGenreId("");
    setOlderImage("");
    setGenreImage("");
    // setSubjectId("");
  };

  // const getGenres = async () => {
  //   const token = isAutheticated();
  //   if (!token) {
  //     swal({
  //       title: "Error",
  //       text: "Please login to access the resource",
  //       icon: "error",
  //       button: "Retry",
  //       dangerMode: true,
  //     });
  //     return;
  //   }
  //   try {
  //     const response = await axios.get("/api/genre/getAllGenres", {
  //       headers: {
  //         Authorization: `Bearer ${token}`, // Include token in headers
  //       },
  //     });
  //     if (response.status === 200) {
  //       setGenres(response?.data?.genres);
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error.response?.data?.message || error.message);
  //     swal({
  //       title: "Error",
  //       text:
  //         error.response?.data?.message ||
  //         "Please login to access the resource",
  //       icon: "error",
  //       button: "Retry",
  //       dangerMode: true,
  //     });
  //   }
  // };

  useEffect(() => {
    getGenres();
  }, []);

  const handleEditClick = (_id, genreName, genreImage) => {
    setOpen(true);
    setOlderImage(genreImage);
    setGenreName(genreName);

    // setSubjectId(subjectId);
    setGenreId(_id);
    setOlderGenreName(genreName);
    setEdit(true);
  };

  const genreNamesArray = [];
  const setGenreNamesArray = () => {
    genres &&
      genres.map((genre) => {
        genreNamesArray.push(genre.genreName.toLowerCase());
      });
  };
  setGenreNamesArray();

  const handleUpdate = () => {
    const filteredArrayNames = genreNamesArray.filter(
      (item) => item !== olderGenreName.toLowerCase()
    );
    const genreExists = filteredArrayNames.includes(genreName.toLowerCase());
    if (genreExists) {
      swal({
        title: "Warning",
        text: "Genre already exists ",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }

    if (!genreName || (!genreImage && !olderImage)) {
      swal({
        title: "Warning",
        text: "Please fill all the required fields!",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }
    setUpdating(false);
    const formData = new FormData();
    formData.append("genreName", genreName);
    // formData.append("subjectId", subjectId);
    formData.append("genreImage", genreImage);
    formData.append("olderImage", JSON.stringify(olderImage));

    axios
      .patch(`/api/genre/update/${genreId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        getGenres();
        handleClose();
        setGenreId("");
        setGenreName("");
        setGenreImage("");
        // setSubjectId("");
        setOlderImage("");
        setUpdating(true);
        setEdit(false);
        swal({
          title: "Congratulations!!",
          text: "The genre was updated successfully!",
          icon: "success",
          button: "OK",
        });
      })
      .catch((err) => {
        swal({
          title: "Sorry, please try again",
          text: err,
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        setUpdating(true);
      });
  };

  const handleDelete = (_id) => {
    swal({
      title: "Are you sure?",
      icon: "error",
      buttons: {
        Yes: { text: "Yes", value: true },
        Cancel: { text: "Cancel", value: "cancel" },
      },
    }).then((value) => {
      if (value === true) {
        axios
          .delete(`/api/genre/delete/${_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            getGenres();
            swal({
              title: "Congratulations!!",
              text: "The genre was deleted successfully!",
              icon: "success",
              button: "OK",
            });
          })
          .catch((err) => {
            swal({
              title: "",
              text: "Something went wrong!",
              icon: "error",
              button: "Retry",
              dangerMode: true,
            });
          });
      }
    });
  };

  console.log("subjectViewId", subjectViewId);
  const handleSaveGenre = async () => {
    const genreExists = genreNamesArray.includes(genreName.toLowerCase());
    if (genreExists) {
      swal({
        title: "Warning",
        text: "Genre already exists.",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }
    if (!genreName || !genreImage) {
      swal({
        title: "Warning",
        text: "Please fill all the required fields!",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }
    setSaveLoading(false);
    setLoading(true);
    const formData = new FormData();
    formData.append("genreName", genreName);
    // formData.append("subjectId", subjectId);
    formData.append("genreImage", genreImage);

    axios
      .post("/api/genre/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status === 201) {
          getGenres();
          setOpen(false);
          setLoading(false);
          setSaveLoading(true);
          setGenreName("");
          setGenreImage("");
          // setSubjectId("");
          setOlderImage("");
          swal({
            title: "Added",
            text: "New genre added successfully!",
            icon: "success",
            button: "OK",
          });
        }
      })
      .catch((error) => {
        setSaveLoading(true);
        swal({
          title: error,
          text: "something went wrong",
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
      });
  };

  const getPageCount = () => {
    return Math.max(1, Math.ceil(genres.length / itemPerPage));
  };

  const handleFileChange = (e) => {
    const files = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(files.type)) {
      setGenreImage(files);
    }
  };

  const handleDeleteImage = () => {
    setGenreImage("");
  };
  // Add subgnere

  const addsubgnere = async () => {
    try {
      // const creaatesubgen = await swal({
      //   text: "Please enter your  password",
      //   content: {
      //     element: "input",
      //     attributes: {
      //       placeholder: "Enter your password",
      //       type: "text",
      //     },
      //   },
      //   buttons: {
      //     Confirm: { text: "Confirm", value: true },
      //     Cancel: { text: "Cancel", value: "cancel" },
      //   },
      // });

      const { value: formValues } = await swal.fire({
        title: "Multiple inputs",
        html: `
          <input id="swal-input1" class="swal2-input">
          <input id="swal-input2" class="swal2-input">
        `,
        focusConfirm: false,
        preConfirm: () => {
          return [
            document.getElementById("swal-input1").value,
            document.getElementById("swal-input2").value,
          ];
        },
      });
      if (formValues) {
        swal.fire(JSON.stringify(formValues));
      }
    } catch (error) {}
  };
  const tablestyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  const heading = ["Genre", "Image", "Sub Genre Count", "Created", "", "", ""];
  console.log("genre", genres);

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12" style={{ width: "100%" }}>
              <div
                className="
                    page-title-box
                    d-flex
                    align-items-center
                    justify-content-between
                  "
              >
                <div style={{ fontSize: "22px" }} className="fw-bold">
                  Genres
                </div>

                <div className="page-title-right">
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      textTransform: "capitalize",
                    }}
                    onClick={handleOpen}
                  >
                    Add New Genre
                  </Button>
                  <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <Box p={2} display={"flex"}>
                        <Typography
                          id="modal-modal-title"
                          variant="body"
                          component="h2"
                          flex={1}
                        >
                          Genre Name
                        </Typography>
                        <IconButton onClick={() => handleClose()}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                      <hr />
                      <TextField
                        autoComplete="off"
                        placeholder="Genre Name"
                        value={genreName}
                        fullWidth
                        inputProps={{
                          maxLength: 25,
                        }}
                        style={{
                          padding: "1rem",
                        }}
                        onChange={(e) =>
                          setGenreName(
                            e.target.value.charAt(0).toUpperCase() +
                              e.target.value.slice(1)
                          )
                        }
                      />
                      {genreName ? (
                        <>
                          <small className="charLeft mt-2 ml-3 fst-italic">
                            {25 - genreName.length} characters left
                          </small>
                        </>
                      ) : (
                        <></>
                      )}

                     

                      <Box
                        style={{
                          padding: "1rem",
                        }}
                      >
                        <label htmlFor="upload-Image">
                          <TextField
                            style={{
                              display: "none",
                              width: "350px",
                              height: "350px",
                              borderRadius: "10%",
                            }}
                            fullWidth
                            id="upload-Image"
                            type="file"
                            accept=".jpg , .png ,.jpeg"
                            label="file"
                            variant="outlined"
                            onChange={(e) => handleFileChange(e)}
                          />
                          <Box
                            style={{ borderRadius: "10%" }}
                            sx={{
                              margin: "1rem 0rem",
                              cursor: "pointer",
                              width: "140px",
                              height: "140px",
                              border: "2px solid grey",
                              "&:hover": {
                                background: "rgba(112,112,112,0.5)",
                              },
                            }}
                          >
                            <CloudUploadIcon
                              style={{
                                color: "grey",
                                margin: "auto",
                                fontSize: "5rem",
                              }}
                              fontSize="large"
                            />
                          </Box>
                        </label>
                        {genreImage && (
                          <Box>
                            <img
                              src={URL.createObjectURL(genreImage)}
                              alt="genreImage"
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: "1rem",
                                marginLeft: "1rem",
                              }}
                            />
                            <DeleteSharpIcon
                              onClick={() => handleDeleteImage()}
                              fontSize="small"
                              sx={{
                                color: "white",
                                position: "absolute",
                                cursor: "pointer",
                                padding: "0.2rem",
                                background: "black",
                                borderRadius: "50%",
                              }}
                            />
                          </Box>
                        )}
                        {olderImage && (
                          <Box>
                            <img
                              src={olderImage?.secure_url}
                              alt="genreImage"
                              style={{
                                width: 100,
                                height: 100,
                                borderRadius: "1rem",
                                marginLeft: "1rem",
                              }}
                            />
                            <DeleteSharpIcon
                              onClick={() => setOlderImage("")}
                              fontSize="small"
                              sx={{
                                color: "white",
                                position: "absolute",
                                cursor: "pointer",
                                padding: "0.2rem",
                                background: "black",
                                borderRadius: "50%",
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      {error && <p style={{ color: "red" }}>{error}</p>}
                      <p className="pt-1 pl-2 text-secondary">
                        Upload jpg, jpeg and png only*
                      </p>

                      <Box p={2} display={"flex"} justifyContent={"right"}>
                        {!edit && (
                          <button
                            style={{
                              color: "white",
                              marginRight: "1rem",
                            }}
                            onClick={() => handleSaveGenre()}
                            type="button"
                            className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                          >
                            <ClipLoader loading={!saveLoding} size={18} />
                            {saveLoding && "Save"}
                          </button>
                        )}
                        {edit && (
                          <button
                            style={{
                              color: "white",
                              marginRight: "1rem",
                            }}
                            onClick={() => handleUpdate()}
                            type="button"
                            className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                          >
                            <ClipLoader loading={!updating} size={18} />
                            {updating && "update"}
                          </button>
                        )}
                        <button
                          style={{
                            color: "black",
                            marginRight: "1rem",
                            background: "grey",
                          }}
                          onClick={() => setOpen(false)}
                          type="button"
                          className="
                                      btn  btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                        >
                          Close
                        </button>
                      </Box>
                    </Box>
                  </Modal>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row ml-0 mr-0 mb-10">
                    <div className="col-sm-12 col-md-12">
                      <div className="dataTables_length">
                        <label className="w-100">
                          Show
                          <select
                            style={{ width: "10%" }}
                            onChange={(e) => setItemPerPage(e.target.value)}
                            className="
                                select-w
                                custom-select custom-select-sm
                                form-control form-control-sm
                              "
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="100">100</option>
                          </select>
                          entries
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive table-shoot mt-3">
                    <table
                      className="table table-centered table-nowrap"
                      style={{ border: "1px solid" }}
                    >
                      <thead
                        className="thead-info"
                        style={{
                          background: "rgb(140, 213, 213)",
                          textAlign: "center",
                        }}
                      >
                        <tr>
                          {heading.map((data) => (
                            <th key={data}>{data}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody style={{ textAlign: "center" }}>
                        {!loading && genres.length === 0 && (
                          <tr className="text-center">
                            <td colSpan="6">
                              <h5>No Data Available</h5>
                            </td>
                          </tr>
                        )}
                        {loading ? (
                          <tr>
                            <td className="text-center" colSpan="6">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          genres &&
                          genres
                            .slice(
                              (`${page}` - 1) * itemPerPage,
                              `${page}` * itemPerPage
                            )
                            .map((item, i) => {
                              return (
                                <tr key={i}>
                                  <td>
                                    <span style={{ fontWeight: "600" }}>
                                      {item.genreName}{" "}
                                    </span>
                                  </td>
                                  <td>
                                    <img
                                      className="me-2"
                                      src={item?.genreImage?.fileUrl}
                                      width="40"
                                      alt=""
                                    />
                                    <h5>{} </h5>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: "600" }}>
                                      {item.subgenreCount}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "600" }}>
                                      {item.createdAtIST}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <Button
                                      sx={{
                                        background: "#6f42c1",
                                        "&:hover": { background: "#5a379e" },
                                      }}
                                      variant="contained"
                                      // color="primary"

                                      onClick={() => {
                                        navigate(
                                          `/create/subgenre/${item.genreName}/${item._id}`
                                        );
                                      }}
                                    >
                                      {/* handleSaveSubject */}
                                      Create
                                    </Button>
                                  </td>

                                  <td>
                                    <Button
                                      sx={{
                                        background: "#20c997",
                                        "&:hover": { background: "#20c997" },
                                      }}
                                      variant="contained"
                                      onClick={() => {
                                        getAllsubgenre(item._id);
                                        // setGenreIdlocal(item._id);

                                        navigate(
                                          `/genre/allsubject/${item.genreName}/${item._id}`
                                        );
                                      }}
                                    >
                                      View Subgename
                                    </Button>
                                  </td>

                                  {/* <td>
                                  <button
                                    style={{
                                      color: "white",
                                      marginRight: "1rem",
                                      background: "orange",
                                      fontWeight: "600",
                                    }}
                                    type="button"
                                    className="
                                      btn  btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                        
                                    onClick={() => {
                                      handelSubgenOpen();
                                    }}
                                  >
                                    Add Subgenre
                                  </button>
                                </td> */}
                                  <td
                                    className="text-start"
                                    style={{ textAlign: "center" }}
                                  >
                                    <button
                                      style={{
                                        color: "white",
                                        marginRight: "1rem",
                                        background: "green",
                                      }}
                                      type="button"
                                      className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                                      onClick={async () => {
                                        setSeriesLoadingView(item._id);
                                        //  setSubjectViewId(item._id)
                                        localStorage.setItem(
                                          "subjectViewId",
                                          item._id
                                        );
                                        await getAdminSubjectView(item._id);

                                        navigate(
                                          `/AdminSubjectView/${item.genreName}/${item._id}`
                                        );
                                      }}
                                    >
                                      {seriesloadingview === item._id ? (
                                        <CircularProgress size={25} />
                                      ) : (
                                        "View"
                                      )}
                                    </button>
                                  </td>

                                  <td className="text-start">
                                    <button
                                      style={{
                                        color: "white",
                                        marginRight: "1rem",
                                      }}
                                      type="button"
                                      className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                                      onClick={() =>
                                        handleEditClick(
                                          item._id,
                                          item.genreName,
                                          item.genreImage
                                        )
                                      }
                                    >
                                      Edit
                                    </button>
                                    <button
                                      style={{
                                        color: "white",
                                        marginRight: "1rem",
                                        background: "red",
                                      }}
                                      type="button"
                                      className="
                                      btn  btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                                      onClick={() => handleDelete(item._id)}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "flex", justifyContent: "right" }}>
                    <Pagination
                      style={{ margin: "2rem" }}
                      variant="outlined"
                      size="large"
                      count={getPageCount()}
                      color="primary"
                      onChange={(event, value) => setPage(value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Genres;
