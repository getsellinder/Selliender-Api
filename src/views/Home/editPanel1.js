import { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { isAutheticated } from "src/auth";
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  [{ script: "super" }, { script: "sub" }],
  ["undo", "redo"],
];
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import { Box, TextField, Checkbox, FormControlLabel } from "@mui/material";

const EditPanel1 = () => {
  const token = isAutheticated();
  const [loading, setLoading] = useState(false);
  const [displayPanel, setDisplayPanel] = useState(false);
  const [content, setContent] = useState("");
  const [olderContent, setOlderContent] = useState("");
  const [image, setimage] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [newUpdatedImages, setNewUpdatedImages] = useState(null);
  const [Img, setImg] = useState(true);
  const [id, setId] = useState(null);

  const handleContentChange = (content, delta, source, editor) => {
    setContent(editor.getHTML());
  };
  //get Blogdata
  const getPanel = async () => {
    try {
      const res = await axios.get(`/api/panel/panel1/get`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      });
      setTitle(res?.data?.panel1[0]?.title);
      setimage(res?.data?.panel1[0]?.image);
      setContent(res?.data?.panel1[0]?.content);
      setOlderContent(res?.data?.panel1[0]?.content);
      setDisplayPanel(res?.data?.panel1[0]?.displayPanel);
      setId(res?.data?.panel1[0]?._id);
      setImg(false);
    } catch (err) {
      swal({
        title: "Error",
        text: "Unable to fetch the panel content",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };

  useEffect(() => {
    getPanel();
  }, []);

  const handleFileChange = (e) => {
    const files = e.target.files;
    // Reset error state
    setError("");

    // Check if more than one image is selected
    if (files.length > 1 || Img === false || newUpdatedImages !== null) {
      setError("You can only upload one image.");
      return;
    }

    // Check file types and append to selectedFiles
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const file = files[0]; // Only one file is selected, so we get the first one

    if (allowedTypes.includes(file.type)) {
      setNewUpdatedImages(file);
      setimage(file);
    } else {
      setError("Please upload only PNG, JPEG, or JPG files.");
    }
  };

  const handelDelete = async (public_id) => {
    console.log(public_id);
    const ary = public_id?.split("/");
    setNewUpdatedImages(null);

    const res = await axios.delete(
      `/api/v1/blog/deleteImage/jatinMor/Blog/${ary[2]}`,
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res) {
      setimage(null);
      setImg(true);
    }
  };

  const addContent = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("displayPanel", displayPanel);
    formData.append("image", image);

    const response = await axios.post("/api/panel/panel1/add", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status == 201) {
      swal({
        title: "Congratulations!!",
        text: "Panel 1  added successfully!",
        icon: "success",
        button: "OK",
      });
    }
  };

  const updateContent = () => {
    if (title === "" || content === "") {
      swal({
        title: "Warning",
        text: "Fill all mandatory fields",
        icon: "error",
        button: "Close",
        dangerMode: true,
      });
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("displayPanel", displayPanel);

    if (newUpdatedImages !== null) {
      formData.append("image", newUpdatedImages);
    }

    axios
      .patch(`/api/panel/panel1/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        swal({
          title: "Updated",
          text: " Updated successfully!",
          icon: "success",
          button: "ok",
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);

        const message = err.response?.data?.message
          ? err.response?.data?.message
          : "Something went wrong!";
        swal({
          title: "Warning",
          text: message,
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
      });
  };

  const handleSaveClick = async () => {
    if (olderContent.length === 0) {
      addContent();
    } else {
      updateContent();
    }
    // // Reload terms and conditions
    // await getPrivacyPolicy();
  };

  const handleChange = (event) => {
    setDisplayPanel(event.target.checked);
  };
  return (
    <div className="container">
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
              Panel 1
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <h4 className="mb-0"></h4>
            </div>

            <div className="page-title-right">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={displayPanel}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label="Display Panel"
              />
              <Button
                variant="contained"
                color="primary"
                style={{
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  textTransform: "capitalize",
                  marginRight: "5px",
                }}
                onClick={() => handleSaveClick()}
                disabled={loading}
              >
                {"Save"}
              </Button>
              <Link to="/home">
                <Button
                  variant="contained"
                  color="secondary"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textTransform: "capitalize",
                  }}
                >
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-md-6  col-sm-12 my-1">
          <div className="card h-100">
            <div className="card-body px-5">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Panel 1 Title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="image" className="form-label">
                  Panel Image
                </label>
                <Box>
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
                      multiple
                      variant="outlined"
                      onChange={(e) => handleFileChange(e)}
                    />
                    <Box
                      style={{ borderRadius: "10%" }}
                      sx={{
                        margin: "1rem 0rem",
                        cursor: "pointer",
                        width: "100px",
                        height: "100px",
                        border: "2px solid grey",
                        // borderRadius: '50%',

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
                          marginLeft: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                        fontSize="large"
                      />
                    </Box>
                  </label>
                </Box>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div>
                  <strong className="fs-6 fst-italic">
                    *You cannot upload more than 1 image
                  </strong>
                </div>

                <Box style={{ display: "flex" }}>
                  {image !== null ? (
                    <Box marginRight={"2rem"}>
                      <img
                        src={
                          image?.url ||
                          (newUpdatedImages &&
                            URL.createObjectURL(newUpdatedImages)) ||
                          null
                        }
                        alt="Panel Image"
                        style={{
                          width: 350,
                          height: 270,

                          marginBottom: "1rem",
                        }}
                      />
                      {console.log("image", image)}

                     { image?.public_id&&<DeleteSharpIcon
                        onClick={() => handelDelete(image?.public_id)}
                        fontSize="small"
                        sx={{
                          color: "white",
                          position: "absolute",
                          cursor: "pointer",
                          padding: "0.2rem",
                          background: "black",
                          borderRadius: "50%",
                        }}
                      />}
                    </Box>
                  ) : null}
                </Box>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-6  col-sm-12 my-1">
          <div className="card h-100">
            <div className="card-body px-5">
              <label>Panel Content</label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={{ toolbar: TOOLBAR_OPTIONS }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPanel1;
