import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import { isAutheticated } from "src/auth";
import swal from "sweetalert";
import toast from "react-hot-toast";

const deleteChapterData = () => {
  const token = isAutheticated();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(true);
  const [chaptersData, setChaptersData] = useState([]);
  const [genres, setGenres] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [restorechapterdata, setRestoreChapter] = useState("");

  const nameRef = useRef();
  const genreRef = useRef();
  const subjectRef = useRef();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(5);
  const [totalData, setTotalData] = useState(0);

  const getChaptersData = async () => {
    setLoading(true);

    await axios
      .get(`api/chapter/delete/getAll/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: currentPage,
          show: itemPerPage,
          name: nameRef.current.value,
          genre: genreRef.current.value,
          subject: subjectRef.current.value,
        },
      })
      .then((res) => {
        console.log("res.data?.data", res.data?.chapter);
        setChaptersData(res.data?.chapter);
        setTotalData(res.data?.total_data);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || "Something went wrong!";
        swal({
          title: err,
          text: msg,
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        setLoading(false);
      });
  };

  const getGenres = () => {
    axios
      .get(`/api/genre/getAllGenres`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("res?.data?.genres", res?.data?.genres);
        setGenres(res?.data?.genres);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getSubjects = () => {
    axios
      .get(`/api/subject/getSubjects`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("res?.data?.subjects", res?.data?.subjects);
        setSubjects(res?.data?.subjects);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [currencyDetails, setCurrencyDetails] = useState(null);

  const getCurrency = async () => {
    try {
      const response = await axios.get("/api/currency/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setCurrencyDetails(response?.data?.currency[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // restore chapter api

  const restorechapter = (id) => {
    axios
      .get(`/api/chapter/restore/chapter/${id}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("res?.data?.genres", res?.data?.message);
        setRestoreChapter(res?.data?.message);
        getChaptersData();
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getGenres();
    getSubjects();
    getCurrency();
  }, []);

  useEffect(() => {
    getChaptersData();
  }, [success, itemPerPage, currentPage]);

  const handleStatus = (id) => {
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
          .patch(`/api/chapter/admin/status/${id}`, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            swal({
              title: "Changed",
              text: "Chapter status changed successfully!",
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
                  Deleted Chapters
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row ml-0 mr-0 mb-10">
                    <div className="col-lg-1">
                      <div className="dataTables_length">
                        <label className="w-100">
                          Show
                          <select
                            onChange={(e) => {
                              setItemPerPage(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="form-control"
                            disabled={loading}
                          >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                          entries
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <label>Name:</label>
                      <input
                        type="text"
                        placeholder="Chapter name"
                        className="form-control"
                        ref={nameRef}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-lg-3">
                      <label>Filter by Genre:</label>
                      <select
                        className="form-control"
                        ref={genreRef}
                        disabled={loading}
                      >
                        <option value="">All</option>
                        {genres?.map((e, i) => (
                          <option key={i} value={e._id}>
                            {e?.genreName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-3">
                      <label>Filter by Subject:</label>
                      <select
                        className="form-control"
                        ref={subjectRef}
                        disabled={loading}
                      >
                        <option value="">All</option>
                        {subjects?.map((e, i) => (
                          <option key={i} value={e._id}>
                            {e?.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-lg-2">
                      <button
                        className="btn btn-primary ms-1 mt-4"
                        onClick={() => {
                          getChaptersData();
                          setCurrentPage(1);
                        }}
                        disabled={loading}
                      >
                        {loading ? "Searching.." : "Filter"}
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive table-shoot mt-3">
                    <table
                      className="table table-centered table-nowrap"
                      style={{ border: "1px solid" }}
                    >
                      <thead
                        className="thead-light"
                        style={{ background: "#ecdddd" }}
                      >
                        <tr>
                          <th className="text-start">Image</th>
                          <th className="text-start">Chapter</th>
                          <th className="text-start">Genre</th>
                          <th className="text-start">Subject</th>
                          <th className="text-start">Price</th>
                          <th className="text-start">Status</th>
                          {/* <th className="text-start">Actions</th> */}
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td className="text-center" colSpan="8">
                              Loading...
                            </td>
                          </tr>
                        ) : chaptersData?.length > 0 ? (
                          chaptersData?.map((chapter, i) => {
                            return (
                              <tr key={i}>
                                <th>
                                  {chapter?.image &&
                                  chapter?.image?.length !== 0 ? (
                                    <>
                                      <img
                                        src={chapter?.image[0]?.url}
                                        width="50"
                                        alt="preview"
                                      />
                                    </>
                                  ) : (
                                    <div
                                      className=""
                                      style={{ fontSize: "13px" }}
                                    >
                                      <p className="m-0">No</p>
                                      <p className="m-0">image</p>
                                      <p className="m-0">uploaded!</p>
                                    </div>
                                  )}
                                </th>
                                <td className="text-start">{chapter.name}</td>
                                <td className="text-start">
                                  {chapter.genrname !== ""
                                    ? chapter.genrname
                                    : "Genre Not selected"}
                                </td>
                                <td className="text-start">
                                  {chapter.subjectname !== ""
                                    ? chapter.subjectname
                                    : "Subject Not selected"}
                                </td>
                                <td className="text-start">
                                  ₹ &nbsp;
                                  {currencyDetails?.CurrencySymbol}
                                  {chapter?.variants?.length > 0
                                    ? chapter.variants[0].gst_Id?.active
                                      ? (
                                          chapter.variants[0].price *
                                          (1 +
                                            chapter.variants[0].gst_Id.tax /
                                              100)
                                        ).toFixed(2)
                                      : chapter.variants[0].price
                                    : chapter?.master_GST?.active
                                    ? (
                                        chapter.master_price *
                                        (1 + chapter?.master_GST.tax / 100)
                                      ).toFixed(2)
                                    : chapter.master_price}
                                </td>
                                <td className="text-start">
                                  <button
                                    type="button"
                                    className={`badge text-white ${
                                      chapter?.chapter_Status === "Active"
                                        ? "text-bg-success"
                                        : "text-bg-danger"
                                    }`}
                                    onClick={() => {
                                      restorechapter(chapter._id);
                                    }}
                                  >
                                    {/* {chapter?.chapter_Status} */}
                                    Restore Chapter
                                  </button>
                                </td>
                                {/* <td className="text-start">
                                  <Link
                                    to={`/chapter/view/${chapter._id}`}
                                    state={{ currencyDetails }}
                                  >
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
                                    >
                                      View
                                    </button>
                                  </Link>

                                  <Link to={`/chapter/edit/${chapter._id}`}>
                                    <button
                                      style={{
                                        color: "white",
                                        marginRight: "1rem",
                                      }}
                                      type="button"
                                      className="
                                      btn btn-info btn-sm
                                      waves-effect waves-light
                                      btn-table
                                      mt-1
                                      mx-1
                                    "
                                    >
                                      Edit
                                    </button>
                                  </Link>

                                  <Link
                                    to={"#"}
                                    style={{
                                      marginRight: "1rem",
                                    }}
                                  >
                                    <button
                                      style={{ color: "white" }}
                                      type="button"
                                      className="
                                      btn btn-danger btn-sm
                                      waves-effect waves-light
                                      btn-table
                                      mt-1
                                      mx-1
                                    "
                                      onClick={() => {
                                        handleDelete(chapter._id);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </Link>
                                </td> */}
                              </tr>
                            );
                          })
                        ) : (
                          !loading &&
                          chaptersData?.length === 0 && (
                            <tr className="text-center">
                              <td colSpan="8">
                                <h5>No Chapter Available...</h5>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="row mt-20">
                    <div className="col-sm-12 col-md-6 mb-20">
                      <div
                        className="dataTables_info"
                        id="datatable_info"
                        role="status"
                        aria-live="polite"
                      >
                        Showing {currentPage * itemPerPage - itemPerPage + 1} to{" "}
                        {Math.min(currentPage * itemPerPage, totalData)} of{" "}
                        {totalData} entries
                      </div>
                    </div>

                    <div className="col-sm-12 col-md-6">
                      <div className="d-flex">
                        <ul className="pagination ms-auto">
                          <li
                            className={
                              currentPage === 1
                                ? "paginate_button page-item previous disabled"
                                : "paginate_button page-item previous"
                            }
                          >
                            <span
                              className="page-link"
                              style={{ cursor: "pointer" }}
                              onClick={() => setCurrentPage((prev) => prev - 1)}
                              disabled={loading}
                            >
                              Previous
                            </span>
                          </li>

                          {!(currentPage - 1 < 1) && (
                            <li className="paginate_button page-item">
                              <span
                                className="page-link"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setCurrentPage((prev) => prev - 1)
                                }
                                disabled={loading}
                              >
                                {currentPage - 1}
                              </span>
                            </li>
                          )}

                          <li className="paginate_button page-item active">
                            <span
                              className="page-link"
                              style={{ cursor: "pointer" }}
                            >
                              {currentPage}
                            </span>
                          </li>

                          {!(
                            (currentPage + 1) * itemPerPage - itemPerPage >
                            totalData - 1
                          ) && (
                            <li className="paginate_button page-item">
                              <span
                                className="page-link"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setCurrentPage((prev) => prev + 1);
                                }}
                                disabled={loading}
                              >
                                {currentPage + 1}
                              </span>
                            </li>
                          )}

                          <li
                            className={
                              !(
                                (currentPage + 1) * itemPerPage - itemPerPage >
                                totalData - 1
                              )
                                ? "paginate_button page-item next"
                                : "paginate_button page-item next disabled"
                            }
                          >
                            <span
                              className="page-link"
                              style={{ cursor: "pointer" }}
                              onClick={() => setCurrentPage((prev) => prev + 1)}
                              disabled={loading}
                            >
                              Next
                            </span>
                          </li>
                        </ul>
                      </div>
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
};

export default deleteChapterData;
