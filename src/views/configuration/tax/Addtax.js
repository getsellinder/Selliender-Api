import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAutheticated } from "src/auth";
import swal from "sweetalert";

function Addtax() {
  const navigate = useNavigate();
  const token = isAutheticated();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    Gst: "",
  });
  const [limiter, setLimiter] = useState({
    name: 50,
    namehas: 50,
    tax: 2,
    taxhas: 2,
  });

  const handleChange = (e) => {
    if (e.target.name === "tax" && /^\D+$/.test(e.target.value)) return;
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLimiter((prev) => ({
      ...prev,
      [e.target.name + "has"]: prev[e.target.name] - e.target.value.length,
    }));
  };

  async function handleSubmit() {
    if (data.name.trim() === "" || data.tax.trim() === "") {
      return swal("Error", "All fields are required!", "error");
    }
    setLoading(true);
    await axios
      .post("/api/tax/add_tax", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        swal("Success", "Tax added successfully", "success");
        navigate("/gst", { replace: true });
      })
      .catch((err) => {
        // console.log(err)
        swal(
          "Error",
          err.response.data.message
            ? err.response.data.message
            : "Something Went Wrong",
          "error"
        );
        setLoading(false);
      });
  }

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
                <h4 className="mb-0">Add New GST Rate</h4>
              </div>
            </div>
          </div>

          <div className="row my-2">
            <div className="col-12">
              <div className="form-group text-right">
                <button
                  onClick={() => handleSubmit()}
                  type="button"
                  disabled={loading}
                  className="
                        btn btn-success btn-login
                        waves-effect waves-light
                        me-3
                      "
                >
                  Save
                </button>

                <Link to="/gst">
                  <button
                    type="button"
                    className="
                        btn btn-success btn-cancel
                        waves-effect waves-light
                        mr-3
                      "
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </div>
          </div>

           <div className="row">
      <div className="col-lg-8 col-md-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <form>
              <div className="mb-4">
                <label htmlFor="name-input" className="form-label fw-bold">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  id="name-input"
                  value={data.name}
                  onChange={(e) => handleChange(e)}
                  type="text"
                  name="name"
                  className="form-control"
                  maxLength={limiter.name}
                  placeholder="Enter GST name"
                  required
                />
                <small className="text-muted mt-1">
                  Remaining Characters: {limiter.namehas}
                </small>
              </div>

              <div className="mb-4">
                <label htmlFor="tax-input" className="form-label fw-bold">
                  GST Rate (in %) <span className="text-danger">*</span>
                </label>
                <input
                  id="tax-input"
                  value={data.Gst}
                  onChange={(e) => handleChange(e)}
                  type="text"
                  name="Gst"
                  className="form-control"
                  maxLength={limiter.tax}
                  placeholder="Enter GST rate"
                  required
                />
                <small className="text-muted mt-1">
                  Remaining Characters: {limiter.taxhas}
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    

          {/* <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12">
                      <form>
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                Name*
                              </label>
                              <input
                                value={data.name}
                                onChange={(e) => handleChange(e)}
                                type="text"
                                name="name"
                                className="form-control input-field"
                                maxLength={limiter.name}
                              />
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                Remaining Characters: {limiter.namehas}
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center">
                            <label className="col-md-3 col-form-label text-md-end pb-2">
                              GST Rate (in %){" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="col-md-9">
                              <input
                                value={data.tax}
                                onChange={(e) => handleChange(e)}
                                type="text"
                                name="tax"
                                maxLength={limiter.tax}
                                className="form-control input-field"
                              />
                              <small className="form-text text-muted mt-1">
                                Remaining Characters: {limiter.taxhas}
                              </small>
                            </div>
                          </div>
                        </div>

                        {/* <div className="row mt-2">
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                GST Rate (in %)*
                              </label>
                              <input
                                value={data.tax}
                                onChange={(e) => handleChange(e)}
                                type="text"
                                name="tax"
                                maxLength={limiter.tax}
                                className="form-control input-field"
                              />
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                Remaining Characters: {limiter.taxhas}
                              </label>
                            </div>
                          </div>
                        </div> */}
                      {/* </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */} 
        </div>
      </div>
    </div>
  );
}

export default Addtax;
