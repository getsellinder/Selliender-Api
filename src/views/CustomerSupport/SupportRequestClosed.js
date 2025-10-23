import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isAutheticated } from "src/auth";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress, TextField } from "@material-ui/core";
import { cilSearch } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Fuse from "fuse.js";
const SupportRequestClosed = () => {
  const token = isAutheticated();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(true);
  const [status, setStatus] = useState("");
  const [SupportRequestsData, setSupportRequestsData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [showData, setShowData] = useState(SupportRequestsData);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => {
      if (searchTerm !== "") {
        let searchedResult = [];
        searchedResult = SupportRequestsData.filter((item) =>
          item.ticketId.toString().includes(searchTerm)
        );

        setShowData(searchedResult);
      } else {
        getSupportTicketsData();
      }
    }, 100);
  }, [searchTerm]);

  const handleShowEntries = (e) => {
    setCurrentPage(1);
    setItemPerPage(e.target.value);
  };
  const [ticketsData, setticketsData] = React.useState([]);
  ///api/support/getAll/
  const getSupportTicketsData = async () => {
    axios
      .get(`/api/support/getAll/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSupportRequestsData(
          res.data?.support.filter((ticket) => ticket.status === "Close")
        );
        setLoading(false);
      })
      .catch((error) => {
        swal({
          title: error,
          text: "please login to access the resource or refresh the page  ",
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        setLoading(false);
      });
  };
  React.useEffect(() => {
    setLoading(true);
    getSupportTicketsData();
  }, []);

  //  console.log(showData);

  //********************************* */
  useEffect(() => {
    const loadData = () => {
      const indexOfLastPost = currentPage * itemPerPage;
      const indexOfFirstPost = indexOfLastPost - itemPerPage;
      setShowData(SupportRequestsData.slice(indexOfFirstPost, indexOfLastPost));
    };
    loadData();
  }, [currentPage, itemPerPage, SupportRequestsData]);

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
                  Closed Customer Support Requests
                </div>

                <div className="page-title-right"></div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div
                  className="card-body 
                  "
                >
                  <div className="d-flex align-items-center">
                    <div className="row ml-0 mr-0 mb-10">
                      <div className="col-sm-12 col-md-12">
                        <div className="dataTables_length">
                          <label className="w-auto">
                            Show
                            <select
                              style={{ width: "50px" }}
                              name=""
                              onChange={(e) => handleShowEntries(e)}
                              className="select-w custom-select custom-select-sm form-control form-control-sm"
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
                    </div>
                    <div className="ml-2 mt-2">
                      <Button
                        variant="contained"
                        style={{
                          fontWeight: "bold",
                          marginBottom: "1rem",
                          textTransform: "capitalize",
                          marginRight: "5px",
                        }}
                        onClick={() => {
                          navigate(`/support/request`, {
                            replace: true,
                          });
                        }}
                      >
                        Open Requests
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        style={{
                          fontWeight: "bold",
                          marginBottom: "1rem",
                          textTransform: "capitalize",
                          color: "red",
                        }}
                        onClick={() => {
                          navigate(`/support/request/closed`, {
                            replace: true,
                          });
                        }}
                      >
                        Close Requests
                      </Button>
                    </div>
                    {/* ********* */}
                    <div className="ml-5 mt-2">
                      <TextField
                        type="text"
                        placeholder="Search by Ticket ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <CIcon
                        icon={cilSearch}
                        size="xl"
                      // onClick={() => handleSearch(searchTerm)}
                      />
                    </div>
                    {/* ********** */}
                  </div>

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
                          <th className="text-start">Ticket ID</th>
                          <th className="text-start">Subject</th>
                          <th className="text-start">From</th>

                          <th className="text-start">Created On</th>
                          <th className="text-start">Last Reply</th>
                          <th className="text-start">Status</th>
                          <th
                            className="text-start"
                            style={{ paddingLeft: "15px" }}
                          >
                            Action
                          </th>
                          {/* <th className="text-start">Action</th> */}
                        </tr>
                      </thead>

                      <tbody>
                        {!loading && showData.length === 0 && (
                          <tr className="text-center">
                            <td colSpan="6">
                              <h5>No Close Tickets Available</h5>
                            </td>
                          </tr>
                        )}
                        {loading ? (
                          <tr>
                            <td className="text-center" colSpan="6">
                              {/* Loading... */}
                              <CircularProgress />
                            </td>
                          </tr>
                        ) : (
                          showData.map((ticket, i) => {
                            return (
                              <tr key={i}>
                                <td className="text-start">
                                  {ticket?._id}
                                </td>
                                <td className="text-start">{ticket.subject}</td>
                                <td className={`text-start badge ${ticket?.from === 'Mobile' ? 'bg-warning' : 'bg-primary'}`}>
                                  {ticket?.from}
                                </td>
                                <td className="text-start">{new Date(ticket?.createdAt).toLocaleString("en-GB", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })}</td>

                                <td className="text-start">
                                  {ticket.lastreply}
                                </td>
                                <td className="text-start">{ticket.status}</td>
                                <td className="text-start">
                                  <Link
                                    to={`/support/request/closed/${ticket?._id}`}
                                  >
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      style={{
                                        fontWeight: "bold",
                                        marginBottom: "1rem",
                                        textTransform: "capitalize",
                                        marginRight: "5px",
                                      }}
                                    >
                                      View
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
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
                        {Math.min(
                          currentPage * itemPerPage,
                          SupportRequestsData.length
                        )}{" "}
                        of {SupportRequestsData.length} entries
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
                            >
                              Previous
                            </span>
                          </li>

                          {!(currentPage - 1 < 1) && (
                            <li className="paginate_button page-item">
                              <span
                                className="page-link"
                                style={{ cursor: "pointer" }}
                                onClick={(e) =>
                                  setCurrentPage((prev) => prev - 1)
                                }
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
                            SupportRequestsData.length - 1
                          ) && (
                              <li className="paginate_button page-item ">
                                <span
                                  className="page-link"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setCurrentPage((prev) => prev + 1);
                                  }}
                                >
                                  {currentPage + 1}
                                </span>
                              </li>
                            )}

                          <li
                            className={
                              !(
                                (currentPage + 1) * itemPerPage - itemPerPage >
                                SupportRequestsData.length - 1
                              )
                                ? "paginate_button page-item next"
                                : "paginate_button page-item next disabled"
                            }
                          >
                            <span
                              className="page-link"
                              style={{ cursor: "pointer" }}
                              onClick={() => setCurrentPage((prev) => prev + 1)}
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

export default SupportRequestClosed;
