import React, { useState, useEffect } from "react";
import axios from "axios";
import swal from "sweetalert";
import { FaTrashAlt, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const EditChapterAndImg = () => {
  const token = isAutheticated();
  const navigate = useNavigate();
  const { id } = useParams(); // Chapter ID from URL

  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 500;

  const [genres, setGenres] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const predefinedColors = [
    { _id: "color_001", colorName: "Red", colorCode: "#FF0000" },
    { _id: "color_002", colorName: "Blue", colorCode: "#0000FF" },
    { _id: "color_003", colorName: "Green", colorCode: "#008000" },
    { _id: "color_004", colorName: "Yellow", colorCode: "#FFFF00" },
    { _id: "color_005", colorName: "Orange", colorCode: "#FFA500" },
    { _id: "color_006", colorName: "Purple", colorCode: "#800080" },
    { _id: "color_007", colorName: "Pink", colorCode: "#FFC0CB" },
    { _id: "color_008", colorName: "Black", colorCode: "#000000" },
    { _id: "color_009", colorName: "White", colorCode: "#FFFFFF" },
    { _id: "color_010", colorName: "Gray", colorCode: "#808080" },
    { _id: "color_011", colorName: "Brown", colorCode: "#A52A2A" },
    { _id: "color_012", colorName: "Navy Blue", colorCode: "#000080" },
    { _id: "color_013", colorName: "Maroon", colorCode: "#800000" },
    { _id: "color_014", colorName: "Teal", colorCode: "#008080" },
    { _id: "color_015", colorName: "Lime", colorCode: "#00FF00" },
    { _id: "color_016", colorName: "Cyan", colorCode: "#00FFFF" },
    { _id: "color_017", colorName: "Magenta", colorCode: "#FF00FF" },
    { _id: "color_018", colorName: "Silver", colorCode: "#C0C0C0" },
    { _id: "color_019", colorName: "Gold", colorCode: "#FFD700" },
    { _id: "color_020", colorName: "Indigo", colorCode: "#4B0082" },
  ];

  const [data, setData] = useState({
    name: "",
    subject: "",
    master_price: "",
    sale_price: "",
    master_GST: "",
    genre: "",
    description: "",
    chapter_Status: "",
    special_instructions: "",
    shipping_charge: "0",
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({ main: null });
  const [imagesPreview, setImagesPreview] = useState({});

  // Fetch genres
  const getGenres = () => {
    setLoading(true);
    axios
      .get(`/api/genre/getGenres`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setGenres(res?.data?.genres || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  const getColors = async () => {
    try {
      const response = await axios.get("/api/color/getColors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 && response?.data?.colors?.length > 0) {
        setColors(response.data.colors);
      } else {
        setColors(predefinedColors);
      }
    } catch (error) {
      console.log("Error fetching colors, using predefined colors:", error);
      setColors(predefinedColors);
    }
  };

  // Fetch subjects
  const getSubjects = async () => {
    try {
      const response = await axios.get("/api/subject/getSubjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 && response?.data?.subjects?.length > 0) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      swal({
        title: "Error",
        text: "Failed to fetch subjects. Please try again.",
        icon: "error",
      });
    }
  };

  // Fetch taxes
  const getTaxes = () => {
    axios
      .get(`/api/tax/view_tax`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTaxes(res.data || []);
      })
      .catch((err) => console.error(err));
  };

  // Fetch chapter details
  const getChapterDetails = () => {
    setLoading(true);
    axios
      .get(`/api/chapter/getOne/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const chapter = res.data.data;
        setData({
          name: chapter.name,
          subject: chapter.subject?._id || "",
          master_price: chapter.master_price,
          master_GST: chapter.master_GST?._id || "",
          sale_price: chapter.sale_price || "",
          genre: chapter.genre?._id,
          description: chapter.description,
          chapter_Status: chapter.chapter_Status,
          special_instructions: chapter.special_instructions,
          shipping_charge: chapter.shipping_charge || "0",
        });
        setSelectedColors(chapter.colors || []);
        setImagesPreview({
          main: chapter.image[0]?.url || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    getGenres();
    getSubjects();
    getTaxes();
    getColors();
    if (id) {
      getChapterDetails();
    }
  }, [id, token]);

  const handleDetailChange = (e) => {
    const { id, value } = e.target;
    // Prevent non-numeric input for price fields
    if (id === "master_price" && /^\D+$/.test(value)) return;
    if (id === "sale_price" && /^\D+$/.test(value)) return;
    if (id === "shipping_charge" && /^\D+$/.test(value)) return;
    
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const handleColorSelection = (colorData) => {
    if (!colorData) return;
    const { _id, colorName, colorCode } = JSON.parse(colorData);
    const isAlreadySelected = selectedColors.some((clr) => clr._id === _id);
    if (!isAlreadySelected) {
      setSelectedColors([...selectedColors, { _id, colorName, colorCode }]);
    }
  };

  const removeSelectedColor = (color) => {
    setSelectedColors((prev) =>
      prev.filter((c) => c._id !== color._id)
    );
  };

  const handleDetailSubmit = () => {
    if (data.name.includes("-")) {
      swal({
        title: "Warning",
        text: 'Please do not enter "-" in the Title!',
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
      return;
    }
    if (
      !data.name.trim() ||
      !data.subject ||
      !data.master_price ||
      !data.genre ||
      !data.sale_price ||
      !data.description ||
      !data.chapter_Status
    ) {
      swal({
        title: "Warning",
        text: "Fill all mandatory fields",
        icon: "warning",
      });
      return;
    }
    if (selectedColors.length === 0) {
      swal({
        title: "Warning",
        text: "Please select at least one Chapter color!",
        icon: "warning",
      });
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    formData.append("colors", JSON.stringify(selectedColors));
    if (images.main) {
      formData.append("main", images.main);
    }

    setLoading(true);
    axios
      .patch(`/api/chapter/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setLoading(false);
        swal({
          title: "Saved",
          text: "Chapter details and media updated successfully!",
          icon: "success",
        });
        navigate("/chapters");
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: error.response?.data?.message || "Something went wrong!",
          icon: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = () =>
        setImagesPreview((prev) => ({ ...prev, [imageType]: reader.result }));
      reader.readAsDataURL(file);
      setImages((prev) => ({ ...prev, [imageType]: file }));
    } else {
      swal({
        title: "Warning",
        text: "Main image must be an image.",
        icon: "error",
      });
      e.target.value = null;
    }
  };

  const handleRemoveImage = (imageType) => {
    setImages((prev) => ({ ...prev, [imageType]: null }));
    setImagesPreview((prev) => ({ ...prev, [imageType]: null }));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-center flex-grow-1">Edit Chapter</h2>
        <div>
          <button
            className="btn btn-primary mb-3 me-2"
            onClick={handleDetailSubmit}
            disabled={loading}
          >
            {loading ? "Loading..." : "Save Changes"}
          </button>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/chapters")}
            disabled={loading}
          >
            Back
          </button>
        </div>
      </div>
      <div
        className="container d-flex"
        style={{ gap: "20px", maxWidth: "1200px", margin: "auto" }}
      >
        <div
          className="flex-fill"
          style={{
            flex: "1",
            paddingRight: "20px",
            borderRight: "1px solid #ccc",
          }}
        >
          <h5 className="mb-3">Chapter Details</h5>

          {/* Name field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Name <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  value={data.name}
                  onChange={handleDetailChange}
                  maxLength={MAX_NAME_LENGTH}
                  required
                />
                <small className="form-text text-muted mt-1">
                  {MAX_NAME_LENGTH - data.name.length} characters remaining
                </small>
              </div>
            </div>
          </div>

          {/* Subject field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Subject <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  id="subject"
                  className="form-control"
                  value={data.subject}
                  onChange={handleDetailChange}
                  required
                >
                  <option value="" disabled>
                    Select Subject
                  </option>
                  {subjects.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Genre field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Genre <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  id="genre"
                  className="form-control"
                  value={data.genre}
                  onChange={handleDetailChange}
                >
                  <option value="" disabled>
                    Select Genre
                  </option>
                  {genres?.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.genreName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* List Price field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                List Price <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  id="master_price"
                  value={data.master_price}
                  onChange={handleDetailChange}
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          {/* Sale Price field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Sale Price <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  id="sale_price"
                  value={data.sale_price}
                  onChange={handleDetailChange}
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          {/* GST field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">GST</label>
              <div className="col-md-9">
                <select
                  id="master_GST"
                  className="form-control"
                  value={data.master_GST}
                  onChange={handleDetailChange}
                >
                  <option value="" disabled hidden>
                    Select GST
                  </option>
                  {taxes?.map(
                    (item) =>
                      item?.active && (
                        <option key={item._id} value={item._id}>
                          {item.tax}% {item.name}
                        </option>
                      )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Chapter Status field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Status <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  id="chapter_Status"
                  className="form-control"
                  value={data.chapter_Status}
                  onChange={handleDetailChange}
                >
                  <option value="" disabled hidden>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="inActive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description field */}
          <div className="mb-3">
            <div className="d-flex align-items-start">
              <label className="d-flex col-md-3 col-form-label">
                Description <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <textarea
                  className="form-control"
                  id="description"
                  value={data.description}
                  onChange={handleDetailChange}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows="4"
                ></textarea>
                <small className="form-text text-muted">
                  {MAX_DESCRIPTION_LENGTH - data.description.length} characters
                  remaining
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-fill" style={{ flex: "1", paddingLeft: "20px" }}>
          {/* Colors selection */}
          <div className="mb-2 mt-4">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Colors <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  id="color"
                  className="form-control"
                  onChange={(e) => handleColorSelection(e.target.value)}
                  value=""
                >
                  <option value="">Select Color</option>
                  {colors.map((clr) => (
                    <option
                      key={clr._id}
                      value={JSON.stringify({
                        _id: clr._id,
                        colorName: clr.colorName,
                        colorCode: clr.colorCode,
                      })}
                      disabled={selectedColors.some(
                        (color) => color._id === clr._id
                      )}
                    >
                      {clr.colorName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected colors display */}
            <div className="mt-3 offset-md-3 col-md-9">
              {selectedColors.map((color) => (
                <span
                  key={color._id}
                  style={{
                    backgroundColor: color.colorCode,
                    cursor: "pointer",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color:
                      color.colorCode === "#FFFFFF" ||
                      color.colorCode === "#FFFF00"
                        ? "#000"
                        : "#fff",
                    marginRight: "10px",
                    marginBottom: "5px",
                    display: "inline-block",
                    border:
                      color.colorCode === "#FFFFFF" ? "1px solid #ccc" : "none",
                  }}
                  onClick={() => removeSelectedColor(color)}
                  title={`Click to remove ${color.colorName}`}
                >
                  {color.colorName} <FaTrashAlt style={{ marginLeft: "5px" }} />
                </span>
              ))}
            </div>
          </div>

          {/* Shipping Charges field */}
          <div className="mb-3">
            <div className="d-flex align-items-center">
              <label className="col-md-3 col-form-label text-md-end">
                Shipping Charges <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  id="shipping_charge"
                  value={data.shipping_charge}
                  onChange={handleDetailChange}
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          <h5 className="mb-3">Upload Chapter Image</h5>

          {/* Image upload field */}
          <div className="mb-3">
            <div className="d-flex align-items-start">
              <label className="col-md-3 col-form-label text-md-end">
                Main Image <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "main")}
                />
                {imagesPreview.main && (
                  <div className="position-relative mt-2">
                    <img
                      src={imagesPreview.main || "/placeholder.svg"}
                      alt="Preview main"
                      className="img-thumbnail"
                      style={{ maxHeight: "100px", maxWidth: "100%" }}
                    />
                    <button
                      className="btn position-absolute"
                      style={{
                        top: "0",
                        right: "0",
                        backgroundColor: "#ff0000",
                        color: "#ffffff",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        transition: "background-color 0.2s",
                      }}
                      onClick={() => handleRemoveImage("main")}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#cc0000")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#ff0000")
                      }
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditChapterAndImg;