import axios from "axios";
import React, { useEffect, useState } from "react";
import { isAutheticated } from "src/auth";

import { Link } from "react-router-dom";
import swal from "sweetalert";

function Tax() {
  const [taxList, settaxList] = useState([]);
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const token = isAutheticated();

  useEffect(() => {
    function getTaxes() {
      setLoading(true);
      axios
        .get(`/api/tax/view_tax`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLoading(false);
          // console.log(res.data);
          settaxList(res.data);
        })
        .catch((err) => setLoading(false));
    }
    getTaxes();
  }, [success]);

  function handleDelete(id) {
    axios
      .delete(`/api/tax/delete_tax/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setSuccess((prev) => !prev))
      .catch((err) => swal("Error!", "Something went wrong!", "error"));
  }

  const handleStatus = () => {
    swal({
      title: "Are you sure?",
      icon: "warning",
      buttons: {
        Yes: { text: "Yes", value: true },
        Cancel: { text: "Cancel", value: "cancel" },
      },
    }).then((value) => {
      if (value === true) {
        axios
          .patch(
            `/api/tax/update`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            swal({
              title: "Changed",
              text: "status changed successfully!",
              icon: "success",
              button: "ok",
            });
            setSuccess((prev) => !prev);
          })
          .catch((err) => {
            swal({
              title: "Warning",
              text: "Something went wrong!",
              icon: "error",
              button: "Retry",
              dangerMode: true,
            });
          });
      }
    });
  };
  return (
    <div className="main-content">
      <div className="page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row ml-0 mr-0 mb-10">
                    <div className="col-sm-12 col-md-6"></div>
                    <div className="col-sm-12 col-md-6">
                      <div className="m-1 d-flex align-items-center justify-content-end gap-3">
                        <button
                          type="button"
                          className=" btn btn-warning text-white  "
                          onClick={() => handleStatus()}
                        >
                          <i className="fa fa-plus mb-2" aria-hidden="true"></i>{" "}
                          Change Status
                        </button>
                        <Link to="/tax/add">
                          <button
                            type="button"
                            className="
                                btn btn-primary"
                          >
                            <i
                              className="fa fa-plus mb-2"
                              aria-hidden="true"
                            ></i>{" "}
                            Add New GST Rate
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive table-shoot mt-2">
                    <table className="table table-centered table-nowrap mb-0">
                      <thead
                        className="thead"
                        style={{ background: "rgb(140, 213, 213)" }}
                      >
                        <tr>
                          <th>Name</th>
                          <th>GST Rate</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td colSpan="6" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        )}
                        {taxList.map((tax, index) => {
                          return (
                            <tr key={index}>
                              <td>{tax.name}</td>
                              <td>{tax.Gst}%</td>
                              <td
                                className={`badge mt-1 text-white ${
                                  tax?.active === true
                                    ? "text-bg-success"
                                    : "text-bg-secondary"
                                }`}
                              >
                                {" "}
                                {tax?.active ? "Active" : "Not Active"}
                              </td>

                              <td>
                                {tax?.active ? (
                                  <Link to={`/tax/edit/${tax._id}`}>
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm waves-effect waves-light btn-table me-2"
                                    >
                                      Edit
                                    </button>
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm waves-effect waves-light btn-table me-2"
                                    disabled
                                  >
                                    Edit
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className=" btn btn-danger btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    ml-2
                                  "
                                  disabled={!tax?.active}
                                  onClick={() => handleDelete(tax?._id)}
                                  id="sa-params"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* <div className="row mt-20">
                    <div className="col-sm-12 col-md-6 mb-20">
                      <div
                        className="dataTables_info"
                        id="datatable_info"
                        role="status"
                        aria-live="polite"
                      >
                        Showing 1 to 10 of 57 entries
                      </div>
                    </div>

                    <div className="col-sm-12 col-md-6">
                      <div
                        className="
                            dataTables_paginate
                            paging_simple_numbers
                            float-right
                          "
                      >
                        <ul className="pagination">
                          <li
                            className="
                                paginate_button
                                page-item
                                previous
                                disabled
                              "
                          >
                            <a
                              href="#"
                              aria-controls="datatable"
                              data-dt-idx="0"
                              tabindex="0"
                              className="page-link"
                            >
                              Previous
                            </a>
                          </li>

                          <li className="paginate_button page-item active">
                            <a
                              href="#"
                              aria-controls="datatable"
                              data-dt-idx="1"
                              tabindex="0"
                              className="page-link"
                            >
                              1
                            </a>
                          </li>

                          <li className="paginate_button page-item">
                            <a
                              href="#"
                              aria-controls="datatable"
                              data-dt-idx="2"
                              tabindex="0"
                              className="page-link"
                            >
                              2
                            </a>
                          </li>

                          <li className="paginate_button page-item">
                            <a
                              href="#"
                              aria-controls="datatable"
                              data-dt-idx="3"
                              tabindex="0"
                              className="page-link"
                            >
                              3
                            </a>
                          </li>

                          <li className="paginate_button page-item next">
                            <a href="#" tabindex="0" className="page-link">
                              Next
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tax;
