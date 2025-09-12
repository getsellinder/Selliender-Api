import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import axios from "axios";
import { isAutheticated } from "src/auth";

const AddSeoRequest = () => {
  const token = isAutheticated();
  const [data, setData] = useState({
    GoogleTag: "",
    FacebookPixel: "",
    GoogleAnalytics: "",
    MicrosoftClarity: "",
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if we're editing or adding

  // Function to fetch existing SEO request
  const fetchSeoRequest = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/seo/view`);
      if (res.data.seorequest) {
        setData({
          GoogleTag: res.data.seorequest.GoogleTag || "",
          FacebookPixel: res.data.seorequest.FacebookPixel || "",
          GoogleAnalytics: res.data.seorequest.GoogleAnalytics || "",
          MicrosoftClarity: res.data.seorequest.MicrosoftClarity || "",
        });
        setIsEditing(true); // Set editing to true if SEO data is found
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      swal({
        title: "Error",
        text: "Failed to load SEO request.",
        icon: "error",
        button: "OK",
      });
    }
  };

  useEffect(() => {
    fetchSeoRequest(); // Fetch the SEO request on component mount
  }, []);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = () => {
    setLoading(true);
    const apiEndpoint = `/api/seo/new`; // Same endpoint for both add and edit
    const successMessage = isEditing
      ? "SEO Request updated successfully!"
      : "SEO Request added successfully!";
    const errorMessage = isEditing
      ? "Error updating SEO request"
      : "Error adding SEO request";

    axios
      .post(apiEndpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        swal({
          title: "Success",
          text: successMessage,
          icon: "success",
          button: "ok",
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        const message = err.response?.data?.message || errorMessage;
        swal({
          title: "Error",
          text: message,
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
      });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h2>{isEditing ? "Edit SEO Request" : "New SEO Request"}</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6 col-md-8 col-sm-12 my-1">
          <div className="card h-100">
            <div className="card-body px-5">
              {/* <div className="mb-3">
                <label htmlFor="GoogleTag" className="form-label">
                  Google Tag
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="GoogleTag"
                  value={data.GoogleTag}
                  onChange={handleChange}
                />
              </div> */}

              {/* <div className="mb-3">
                <label htmlFor="FacebookPixel" className="form-label">
                  Facebook Pixel
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="FacebookPixel"
                  value={data.FacebookPixel}
                  onChange={handleChange}
                />
              </div> */}

              <div className="mb-3">
                <label htmlFor="GoogleAnalytics" className="form-label">
                  Google Analytics ( Enter only id )
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="GoogleAnalytics"
                  value={data.GoogleAnalytics}
                  onChange={handleChange}
                />
              </div>

              {/* <div className="mb-3">
                <label htmlFor="MicrosoftClarity" className="form-label">
                  Microsoft Clarity
                </label>
                <textarea
                  type="text"
                  className="form-control"
                  id="MicrosoftClarity"
                  rows="5"
                  value={data.MicrosoftClarity}
                  onChange={handleChange}
                ></textarea>
              </div> */}

              <Button
                variant="contained"
                color="primary"
                className="mr-1"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Loading" : isEditing ? "Update" : "Save"}
              </Button>
              <Link to="/dashboard">
                <Button variant="contained" color="secondary">
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSeoRequest;
