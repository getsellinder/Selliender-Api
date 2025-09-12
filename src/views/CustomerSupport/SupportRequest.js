import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import { CircularProgress, TextField } from "@material-ui/core";

import { cilSearch } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import { Pagination } from "@mui/material";
import { useCustomer } from "./CustomerContext";
const SupportRequest = () => {
  const navigate = useNavigate();
  const {
    getSupportTicketsData,
    SupportRequestsData,
    CloseRequest,
    getMessagesChat,
    chatLoading,
    DeleteRequest,
    deleteLoading,
    closeRequestTicketId,
    setSearchInput,
    searchInput
  } = useCustomer();


  const [status, setStatus] = useState("OPEN");
  const [showData, setShowData] = useState(SupportRequestsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [searchLoading,setSearchLoading]=useState(false)

  
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
    try {
      setPaginationLoading(true);
      const selectedLimit = parseInt(e.target.value);
      const page = 1;

      getSupportTicketsData(status, page, selectedLimit);
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setPaginationLoading(false);
    }
  };
  const tableHeading = [
    "Ticket ID",
    "Subject",
    "Description",

    "Name",
    "Email",
    "Created",
    "Status",
  ];
  const paginationNumber = [10, 0, 30, 40];

  const hadleSeriesChange = (page = 1, newPage) => {
    getSupportTicketsData(status, page, newPage);
  };

  const chatBtn = {
    color: "white",
    fontWeight: 600,
    backgroundColor: "#2196f3", // Blue
    "&:hover": { backgroundColor: "#1976d2" },
  };

  const processBtn = {
    color: "white",
    fontWeight: 600,
    backgroundColor: "#9c27b0", // Purple
    "&:hover": { backgroundColor: "#7b1fa2" },
  };

  const closeBtn = {
    color: "white",
    fontWeight: 600,
    backgroundColor: "#ff9800", // Orange
    "&:hover": { backgroundColor: "#fb8c00" },
  };

  const deleteBtn = {
    color: "white",
    fontWeight: 600,
    backgroundColor: "#f44336", // Red
    "&:hover": { backgroundColor: "#d32f2f" },
  };
  const handleSearch=async(searchInput)=>{
  try {
    setSearchLoading(true)
      const page = 1
    const limit=4
  await  getSupportTicketsData(status, page,limit,searchInput)
    setSearchInput("")
  } catch (error) {
    console.log("error",error,message)
  }finally{
    setSearchLoading(false)
  }
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
                <div style={{ fontSize: "22px" }} className="fw-bold">
                  Customer Support Requests
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
                              <option value="4">4</option>
                              <option value="20">20</option>
                              <option value="30">30</option>
                              <option value="40">40</option>
                            </select>
                            entries
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 mt-2">
                      <Button
                        variant="contained"
                        color={status === "OPEN" ? "primary" : ""}
                        style={{
                          fontWeight: "bold",
                          marginBottom: "1rem",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          getSupportTicketsData("OPEN");
                          setStatus("OPEN");
                        }}
                      >
                        Open Requests
                      </Button>
{/* 
                      <Button
                        variant="contained"
                        color={status === "IN_PROGRESS" ? "primary" : ""}
                        style={{
                          fontWeight: "bold",
                          marginBottom: "1rem",
                          marginLeft: "10px",
                          marginRight: "10px",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          setStatus("IN_PROGRESS");
                          getSupportTicketsData("IN_PROGRESS");
                        }}
                      >
                        In_Progress
                      </Button> */}
                      <Button
                        variant="contained"
                        color={status === "CLOSED" ? "primary" : ""}
                        style={{
                          fontWeight: "bold",
                          marginBottom: "1rem",
                          marginLeft:"1rem",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          setStatus("CLOSED");
                          getSupportTicketsData("CLOSED");
                        }}
                      >
                        {status==="OPEN"}
                        Close Requests
                      </Button>
                    </div>

                    <div className="ml-5 mt-2">
                      <TextField
                        type="text"
                        placeholder="Search by Ticket ID"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      {searchLoading?<CircularProgress size={25}/>:    <CIcon icon={cilSearch} size="xl" onClick={()=>handleSearch(searchInput)} 
                        style={{cursor:"pointer"}}/>}
                  
                    </div>
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
                          {tableHeading.map((item) => (
                            <th
                              style={{
                                border: "1px solid #ddd",
                                padding: "8px",
                              }}
                            >
                              {item}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SupportRequestsData.data?.map((item) => {
                          console.log("item.ticketId", item);
                          return (
                            <tr>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.t.ticketId}
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.t.subject}
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.t.description}
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.t.userId?.name}
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.t.userId?.email}
                              </td>
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.createdAt}
                              </td>
                              {/* <td>{item.t.status}</td> */}
                              <td
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "8px",
                                }}
                              >
                                {item.t.status}
                              </td>
                              <td>
                                <Button
                                  style={{ ...chatBtn }}
                                  onClick={async () => {
                                    await getMessagesChat(item.t._id);
                                    navigate(
                                      `/chat/${item.t.userId?.name}/${item.t._id}`
                                    );
                                  }}
                                >
                                  {chatLoading === item.t._id ? (
                                    <CircularProgress size={25} />
                                  ) : (
                                    "Chat"
                                  )}
                                </Button>
                              </td>
                              {/* <td>
                                <Button
                                  variant="contained"
                                  style={{ ...processBtn }}
                                >
                                  Process
                                </Button>
                              </td> */}
                              <td>
                                {status==="OPEN"&& <Button
                                  variant="contained"
                                  style={{ ...closeBtn }}
                                  onClick={() =>
                                    CloseRequest(item.t._id, status)
                                  }
                                >
                                  {closeRequestTicketId ? (
                                    <CircularProgress size={25} />
                                  ) : (
                                    "   Close"
                                  )}
                                </Button>}
                               
                              </td>
                              <td>
                                <Button
                                  variant="contained"
                                  style={{ ...deleteBtn }}
                                  onClick={() =>
                                    DeleteRequest(item.t._id, status)
                                  }
                                >
                                  {deleteLoading === item.t._id ? (
                                    <CircularProgress size={25} />
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <Pagination
                      color="primary"
                      count={SupportRequestsData.totalPage}
                      page={SupportRequestsData.currentPage}
                      onChange={(e, value) => hadleSeriesChange(value)}
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

export default SupportRequest;
