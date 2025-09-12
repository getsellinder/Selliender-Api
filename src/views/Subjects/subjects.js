import React, { useState, useEffect } from "react";
import axios from "axios";
import { isAutheticated } from "src/auth";
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
import { useSeries } from "../series/SeriesContext";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { useAdmin } from "../series/AdminContext";

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

const Subjects = () => {
  const token = isAutheticated();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(true);
  const [saveLoding, setSaveLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [genreId, setGenreId] = useState();
  const [subjectImage, setSubjectImage] = useState("");
  const [error, setError] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [olderSubjectName, setOlderSubjectName] = useState("");
  const [olderImage, setOlderImage] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const { genres } = useSeries();
  // const {handleDelete,subjects,getSubjects }=useAdmin()

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEdit(false);
    setSubjectName("");
    setGenreId("");
    setSubjectId("");
    setOlderImage("");
    setSubjectImage("");
  };

  const getSubjects = async (id) => {
    try {
      const url = id
        ? `/api/subject/getSubjects?genreId=${id}`
        : `/api/subject/getSubjects`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setSubjects(response?.data?.subjects);
        setLoading(false);
      }
    } catch (error) {
      swal({
        title: error,
        text: "please login to access the resource",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };
  console.log("subject", subjects);

  useEffect(() => {
    getSubjects();
  }, []);

  const handleEditClick = (_id, subjectName, subjectImage) => {
    setOpen(true);
    setOlderImage(subjectImage);
    setSubjectName(subjectName);
    setGenreId(genreId);
    setSubjectId(_id);
    setOlderSubjectName(subjectName);
    setEdit(true);
  };

  const subjectNamesArray = [];
  const setSubjectNamesArray = () => {
    subjects &&
      subjects.map((subject) => {
        subjectNamesArray.push(subject.subjectName.toLowerCase());
      });
  };
  setSubjectNamesArray();

  const handleUpdate = () => {
    const filteredArrayNames = subjectNamesArray.filter(
      (item) => item !== olderSubjectName.toLowerCase()
    );
    const subjectExists = filteredArrayNames.includes(
      subjectName.toLowerCase()
    );
    if (subjectExists) {
      swal({
        title: "Warning",
        text: "Subject already exists",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }

    if (!subjectName || (!subjectImage && !olderImage)) {
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
    formData.append("subjectName", subjectName);
    formData.append("subjectImage", subjectImage);
    formData.append("olderImage", JSON.stringify(olderImage));

    axios
      .patch(`/api/subject/update/${subjectId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        getSubjects();
        handleClose();
        setSubjectId("");
        setSubjectName("");
        setGenreId("");
        setSubjectImage("");
        setOlderImage("");
        setUpdating(true);
        setEdit(false);
        swal({
          title: "Congratulations!!",
          text: "The subject was updated successfully!",
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
        // setSubdelloading(_id);
        axios
          .delete(`/api/subject/delete/${_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          .then((res) => {
            //  getAllsubgenre(genreIdlocal)

            getSubjects();

            swal({
              title: "Congratulations!!",
              text: "The subject was deleted successfully!",
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

  const handleSaveSubject = async () => {
    const subjectExists = subjectNamesArray.includes(subjectName.toLowerCase());
    if (subjectExists) {
      swal({
        title: "Warning",
        text: "Subject already exists.",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }
    if (!subjectName || !subjectImage) {
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
    formData.append("subjectName", subjectName);
    formData.append("subjectImage", subjectImage);
    formData.append("genreId", genreId);

    axios
      .post("/api/subject/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status === 201) {
          getSubjects();
          setOpen(false);
          setLoading(false);
          setSaveLoading(true);
          setSubjectName("");
          setGenreId("");
          setSubjectImage("");
          setOlderImage("");
          swal({
            title: "Added",
            text: "New subject added successfully!",
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
    return Math.max(1, Math.ceil(subjects.length / itemPerPage));
  };

  const handleFileChange = (e) => {
    const files = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(files.type)) {
      setSubjectImage(files);
    }
  };

  const handleDeleteImage = () => {
    setSubjectImage("");
  };
  const subheading = ["Image", "Sub Genre","Genre" ,"Total Title Count", "Created"];
return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div
                className="
                    page-title-box
                    d-flex
                    align-items-center
                    justify-content-between
                  "
              >
                <div style={{ fontSize: "22px" }} className="fw-bold">
                  Subgenre
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
                    Add New Subgenre
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
                          {edit ? "Update Subgenre" : "Add Subgenre"}
                          {/* {updating&&"Update Subgenre"} */}
                        </Typography>
                        <IconButton onClick={() => handleClose()}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                      <hr />
                      <TextField
                        placeholder="Subgenre Name"
                        value={subjectName}
                        fullWidth
                        inputProps={{
                          maxLength: 25,
                        }}
                        style={{
                          padding: "1rem",
                        }}
                        onChange={(e) =>
                          setSubjectName(
                            e.target.value.charAt(0).toUpperCase() +
                              e.target.value.slice(1)
                          )
                        }
                      />
                      {subjectName ? (
                        <>
                          <small className="charLeft mt-2 ml-3 fst-italic">
                            {25 - subjectName.length} characters left
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
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            Genre
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Genre"
                            name="genreId"
                            value={genreId}
                            onChange={(e) => setGenreId(e.target.value)}
                            // value={seriesData.genreId}
                            // onChange={(e) => {
                            //   handleChange(e);
                            //   getsubjectbygenrename({ genreId: e.target.value });
                            // }}
                            // onChange={handleChange}

                            // onClick={()=>getsubjectbygenrename(value)}
                          >
                            {genres.map((item, index) => (
                              <MenuItem key={index} value={item._id}>
                                {item.genreName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

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
                        {subjectImage && (
                          <Box>
                            <img
                              src={URL.createObjectURL(subjectImage)}
                              alt="subjectImage"
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
                              alt="subjectImage"
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
                            onClick={() => handleSaveSubject()}
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
            <div className="" style={{ width: "100%", display: "flex" }}>
              <div className="col-sm-6 col-md-6">
                <div className="dataTables_length">
                  <label className="w-100">Genre</label>
                  <select  style={{ width: "100%"}}
                    className="
        select-w
        custom-select custom-select-sm
        form-control form-control-sm
      "
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setGenreFilter(selectedId);
                      getSubjects(selectedId);
                    }}
                    value={genreFilter}
                  >
                    <option value="">-- Select a Genre --</option>
                    {genres.map((item, index) => (
                      <option value={item._id} key={item._id}>
                        {item.genreName}
                      </option>
                    ))}
                  </select>
                  {/* <select
      style={{ width: "100%" }}
      value={generFilter}   // controlled component
      onChange={(e) => setGenrerFilter(e.target.value)}
      className="
        select-w
        custom-select custom-select-sm
        form-control form-control-sm
      "
    >
      <option value="" disabled>
        -- Choose Genre --
      </option>
      {genres.map((item, index) => (
        <option value={item.genreName} key={index}>
          {item.genreName}
        </option>
      ))}
    </select> */}
                </div>
              </div>
              <div className="col-sm-6 col-md-6">
                <div className="dataTables_length " style={{marginBottom:"1rem"}}>
                  <label className="w-100">
                    Show
                   
   
                  </label>
                   <select
                      style={{ width: "100%" }}
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
                      <option value="50">50</option>
                    </select>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive table-shoot mt-3">
                    <table
                      className="table table-centered table-nowrap"
                      style={{ border: "1px solid" }}
                    >
                      <thead
                        className="thead-info"
                        style={{ background: "rgb(140, 213, 213)" }}
                      >
                        <tr>
                          {subheading.map((item) => (
                            <th key={item} style={{ textAlign: "center" }}>
                              {item}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!loading && subjects.length === 0 && (
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
                          subjects &&
                          subjects
                            .slice(
                              (`${page}` - 1) * itemPerPage,
                              `${page}` * itemPerPage
                            )
                            .map((item, i) => {
                              console.log("item",item)
                              return (
                                <tr key={i}>
                                  <td style={{ textAlign: "center" }}>
                                    <img
                                      className="me-2"
                                      src={item?.subjectImage?.fileUrl}
                                      width="40"
                                      alt=""
                                    />
                                    <h5>{}</h5>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "600" }}>
                                      {" "}
                                      {item.subjectName}{" "}
                                    </span>
                                  </td>
                                    <td style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "600" }}>
                                      {" "}
                                      {item.genrename}{" "}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "600" }}>
                                      {item.titleCount}{" "}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={{ fontWeight: "600" }}>
                                      {item.createdAtIST}{" "}
                                    </span>
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
                                          item.subjectName,
                                          item.subjectImage
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

export default Subjects;
