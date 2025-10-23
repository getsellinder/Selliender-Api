import React, { useState, useEffect } from "react";
import axios from "axios";
import swal from "sweetalert";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { isAutheticated } from "src/auth";

const AddPrdAndImg = () => {
  const token = isAutheticated();
  const navigate = useNavigate();

  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 500;
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]); // For multiple colors
  const [data, setData] = useState({
    name: "",
    master_price: "",
    sale_price: "",
    master_GST: "",
    category: "",
    description: "",
    product_Status: "",
    special_instructions: "",
    shipping_charge: "0",
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({
    main: null,
    img2: null,
    img3: null,
    img4: null,
  });
  const [imagesPreview, setImagesPreview] = useState({});
  const getColors = async () => {
    try {
      const response = await axios.get("/api/color/getColors");

      if (response.status === 200) {
        setColors(response?.data?.colors);
        setLoading(false);
      }
    } catch (error) {
      console.log("To get an error");
    }
  };

  useEffect(() => {
    getColors();
  }, []);
  // console.log(selectedColors)
  const getCategories = () => {
    setLoading(true);
    axios
      .get(`/api/category/getCategories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCategories(res?.data?.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  };

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

  useEffect(() => {
    getCategories();
    getTaxes();
  }, []);

  const handleDetailChange = (e) => {
    const { id, value } = e.target;
    if (id === "master_price" && /^\D+$/.test(value)) return;
    if (id === "sale_price" && /^\D+$/.test(value)) return;
    setData((prev) => ({ ...prev, [id]: value }));
  };
  // const handleColorSelection = (e) => {
  //   const value = e.target.value;
  //   if (!selectedColors.includes(value)) {
  //     setSelectedColors((prev) => [...prev, value]);
  //   }
  // };
  const handleColorSelection = (colorData) => {
    // Parse the selected color object from the value
    const { _id, colorName, colorCode } = JSON.parse(colorData);

    // Check if the color is already in the selectedColors array
    const isAlreadySelected = selectedColors.some((clr) => clr._id === _id);

    if (!isAlreadySelected) {
      // Add the selected color to the array with only the required fields
      setSelectedColors([...selectedColors, { _id, colorName, colorCode }]);
    }
  };

  const removeSelectedColor = (color) => {
    setSelectedColors(
      (prev) => prev.filter((c) => c.colorName !== color.colorName) // Compare by `colorName`
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
      !data.master_price ||
      !data.category ||
      !data.sale_price ||
      !data.description ||
      !data.product_Status
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
        text: "Please select at least one Product color!",
        icon: "warning",
      });
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    Object.keys(images).forEach((key) => {
      if (images[key]) formData.append(key, images[key]);
    });

    // Add selected colors to the form data
    formData.append("colors", JSON.stringify(selectedColors));

    setLoading(true);
    axios
      .post("/api/product/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setLoading(false);

        swal({
          title: "Saved",
          text: "Topic details and media saved successfully!",
          icon: "success",
        });
        navigate("/products");
      })
      .catch((error) =>
        swal({
          title: "Error",
          text: error.response?.data?.message || "Something went wrong!",
          icon: "error",
        })
      )
      .finally(() => setLoading(false));
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type.match("image.*") ||
        (imageType !== "main" && file.type.match("video.*")))
    ) {
      const reader = new FileReader();
      reader.onload = () =>
        setImagesPreview((prev) => ({ ...prev, [imageType]: reader.result }));
      reader.readAsDataURL(file);
      setImages((prev) => ({ ...prev, [imageType]: file }));
    } else {
      swal({
        title: "Warning",
        text: "Main image must be an image. Images 2, 3, and 4 can be images or videos.",
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
        <h2 className="text-center flex-grow-1">Add Topic</h2>
        <div>
          <button
            className="btn btn-primary mb-3 me-2"
            onClick={handleDetailSubmit}
            disabled={loading}
          >
            {loading ? "Loading..." : "Save"}
          </button>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate(-1)}
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
          <h5 className="mb-2">Topic Details</h5>
          <div className="mb-3">
            <label>Name*</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={data.name}
              onChange={handleDetailChange}
              maxLength={MAX_NAME_LENGTH}
            />
            <small>
              {MAX_NAME_LENGTH - data.name.length} characters remaining
            </small>
          </div>
          <div className="mb-3">
            <label>Genre*</label>
            <select
              id="category"
              className="form-control"
              value={data.category}
              onChange={handleDetailChange}
            >
              <option value="">---select---</option>
              {categories?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Subject*</label>
            <select
              id="category"
              className="form-control"
              value={data.category}
              onChange={handleDetailChange}
            >
              <option value="">---select---</option>
              {categories?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>List Price*</label>
            <input
              type="text"
              className="form-control"
              id="master_price"
              value={data.master_price}
              onChange={handleDetailChange}
              maxLength="6"
            />
          </div>
          <div className="mb-3">
            <label>Sale Price*</label>
            <input
              type="text"
              className="form-control"
              id="sale_price"
              value={data.sale_price}
              onChange={handleDetailChange}
              maxLength="6"
            />
          </div>
          <div className="mb-3">
            <label>GST</label>
            <select
              id="master_GST"
              className="form-control"
              value={data.master_GST}
              onChange={handleDetailChange}
            >
              <option value="">---select---</option>
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
          <div className="mb-4">
            <label>Topic Status*</label>
            <select
              id="product_Status"
              className="form-control"
              value={data.product_Status}
              onChange={handleDetailChange}
            >
              <option value="">---select---</option>
              <option value="Active">Active</option>
              <option value="inActive">Inactive</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Description*</label>
            <textarea
              className="form-control"
              id="description"
              value={data.description}
              onChange={handleDetailChange}
              maxLength={MAX_DESCRIPTION_LENGTH}
            ></textarea>
            <small>
              {MAX_DESCRIPTION_LENGTH - data.description.length} characters
              remaining
            </small>
          </div>
        </div>
        <div className="flex-fill" style={{ flex: "1", paddingLeft: "20px" }}>
          {/* <div className="mb-4">
            <label>Colors*</label>
            <select
              id="color"
              className="form-control"
              onChange={(e) => handleColorSelection(e.target.value)}
            >
              <option value="">--- Select ---</option>
              {colors.map((clr) => (
                <option
                  key={clr._id}
                  value={JSON.stringify({
                    _id: clr._id,
                    colorName: clr.colorName,
                    colorCode: clr.colorCode,
                  })}
                  disabled={selectedColors.some((color) => color._id === clr._id)}
                >
                  {clr.colorName}
                </option>
              ))}
            </select>

            {/* Selected Colors Preview */}
          <div className="mt-3 ">
            {selectedColors.map((color) => (
              <span
                key={color.colorName}
                style={{
                  backgroundColor: `${color.colorCode}`,
                  cursor: "pointer",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  color: "#fff",
                  marginRight: "10px",
                }}
                onClick={() => removeSelectedColor(color)} // Remove color on click
              >
                {color.colorName} <FaTrashAlt />
              </span>
            ))}
          </div>
          {/* </div> */}
          <h5 className="mb-2">Upload Topic Images and Video</h5>
          {/* {["main", "img2", "img3", "img4"].map((type, index) => (
            <div key={type} className="mb-3">
              <label>
                {type === "main" ? "Main Image*" : `Image ${index}`}
              </label>
              <input
                type="file"
                className="form-control"
                accept={type === "main" ? "image/*" : "image/*,video/*"}
                onChange={(e) => handleImageChange(e, type)}
              />
              {imagesPreview[type] && (
                <div className="position-relative mt-2">
                  {type !== "main" && images[type]?.type.includes("video") ? (
                    <video
                      src={imagesPreview[type]}
                      className="img-thumbnail"
                      style={{ maxHeight: "100px", maxWidth: "100%" }}
                      controls
                    />
                  ) : (
                    <img
                      src={imagesPreview[type]}
                      alt={`Preview ${type}`}
                      className="img-thumbnail"
                      style={{ maxHeight: "100px", maxWidth: "100%" }}
                    />
                  )}
                  <button
                    className="btn btn-danger position-absolute"
                    style={{ top: 0, right: 0 }}
                    onClick={() => handleRemoveImage(type)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              )}
            </div>
          ))} */}
          <div className="mb-3">
            <label>Main Image*</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "main")}
            />
            {imagesPreview.main && (
              <div className="position-relative mt-2">
                <img
                  src={imagesPreview.main}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxHeight: "100px", maxWidth: "100%" }}
                />
                <button
                  className="btn btn-danger position-absolute"
                  style={{ top: 0, right: 0 }}
                  onClick={() => handleRemoveImage("main")}
                >
                  <FaTrashAlt />
                </button>
              </div>
            )}
          </div>
          {/* <div className="my-3 ">
            <label>Shipping Charges</label>
            <input
              type="text"
              className="form-control"
              id="shipping_charge"
              value={data.shipping_charge}
              onChange={handleDetailChange}
              maxLength="6"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AddPrdAndImg;
