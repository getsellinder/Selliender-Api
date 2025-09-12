import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { isAutheticated } from "src/auth";

function Edittax() {
  const { id } = useParams();
  const token = isAutheticated();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    Gst: "",
    hsn_code: "",
  });
  const [limiter, setLimiter] = useState({
    name: 50,
    namehas: 50,
    Gst: 2,
    taxhas: 2,
    hsn_code: 10,
    hsn_codehas: 10,
  });

  useEffect(() => {
    function getTax() {
      setLoading(true);
      axios
        .get(`/api/tax/view_tax/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          setData((prev) => ({
            ...prev,
            name: res.data?.name,
            Gst: res.data?.Gst?.toString(),
            hsn_code: res.data?.hsn_code?.toString(),
          }));
          setLimiter((prev) => ({
            ...prev,
            namehas: prev.name - res.data?.name.length,
            taxhas: prev.Gst - res.data?.Gst?.toString().length,
            hsn_codehas: prev.hsn_code - res.data?.hsn_code.toString()?.length,
          }));
        })
        .catch((res) => {
          setLoading(false);
          navigate("/tax", { replace: true });
        });
    }
    getTax();
  }, []);

  const handleChange = (e) => {
    if (
      (e.target.name === "Gst" || e.target.name === "hsn_code") &&
      /^\D+$/.test(e.target.value)
    )
      return;
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLimiter((prev) => ({
      ...prev,
      [e.target.name + "has"]: prev[e.target.name] - e.target.value.length,
    }));
  };

  function handleSubmit() {
    if (
      (data.name.trim() === "" || data.Gst.trim() === "",
      data.hsn_code.trim() === "")
    ) {
      return swal("Error", "All fields are required!", "error");
    }
    setLoading(true);
    axios
      .patch(`/api/tax/update_tax/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLoading(false);
        swal("Success", "Tax updated successfully", "success");
        navigate("/gst", { replace: true });
      })
      .catch((err) => {
        swal("Error", "Something went wrong!", "error");
        setLoading(false);
      });
  }

  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-12">
              <div className="form-group text-right">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
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

                        <div className="row mt-2">
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                HSN Code*
                              </label>
                              <input
                                value={data.hsn_code}
                                onChange={(e) => handleChange(e)}
                                type="text"
                                name="hsn_code"
                                maxLength={limiter.hsn_code}
                                className="form-control input-field"
                              />
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                Remaining Characters: {limiter.hsn_codehas}
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="row mt-2">
                          <div className="col-lg-12">
                            <div className="form-group">
                              <label
                                htmlFor="basicpill-phoneno-input"
                                className="label-100"
                              >
                                GST Rate (in %)*
                              </label>
                              <input
                                value={data.Gst}
                                onChange={(e) => handleChange(e)}
                                type="text"
                                name="Gst"
                                maxLength={limiter.Gst}
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
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Edittax;
