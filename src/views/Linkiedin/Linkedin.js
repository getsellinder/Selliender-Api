import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import {
  Box,

  IconButton,

  Pagination,
  Select,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { InputAdornment } from "@material-ui/core";
import { CircularProgress } from "@mui/material";

import { isAutheticated } from "src/auth";
import { useLinkedin } from "./LinkedenContext";

const Linkedin = () => {
  const {
    anaysicResult,
    handleLinkedinDelete,
    linkedindelLoading,
    linkedinLoading,
    handleSinglePackage,
    singlePlanData,
    packageviewLoading,
    getAllAnalysis,
    setPage
  } = useLinkedin();

  const [currentPage, setCurrentPage] = useState();

  const [limit, setLimit] = useState(5);

  const [name, setName] = useState("");

  const token = isAutheticated();
  const navigate = useNavigate();







  const analysic = anaysicResult?.result;




  const handleSearch = (plan) => {
    getAllAnalysis(1, limit, plan);
  };

  const handleShowEntries = (e) => {
    let newlimit = e.target.value;

    setLimit(newlimit)
    getAllAnalysis(1, newlimit, name);
  };


  const tableheading = [

    "Id",
    "Customer",
    "Profile",
    "Date",
    "Action",
    // "Languages",
    // "Posts",
    // "Awards",

  ];

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
                  Usage
                </div>


              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="row ml-0 mr-0 mb-10 ">
                    <div className="col-sm-12 col-md-12">
                      <div
                        className="dataTables_length"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <label className="w-50">
                          Show
                          <select
                            style={{ width: "10%" }}
                            name=""

                            onChange={(e) => handleShowEntries(e)}
                            className="
                                   select-w
                                   custom-select custom-select-sm
                                   form-control form-control-sm
                                 "
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                          </select>
                          entries
                        </label>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "40%",
                            maxWidth: 400,
                            backgroundColor: "#fff",
                          }}
                        >
                          <TextField
                            variant="outlined"
                            placeholder="Search Customer.."
                            value={name}
                            name="name"
                            onChange={(e) => {
                              const val = e.target.value;
                              setName(val);
                              getAllAnalysis(1, limit, val);
                            }}
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => handleSearch(name)}
                                    edge="end"
                                    color="primary"
                                  >
                                    <SearchIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                              sx: { borderRadius: "12px" },
                            }}
                          />
                        </Box>
                      </div>
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
                          {tableheading.map((name) => (
                            <th style={{textAlign:"center"}}
                            >
                              {name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!linkedinLoading && analysic.length === 0 && (
                          <tr className="text-center">
                            <td colSpan="12">
                              <h5>No Data Available</h5>
                            </td>
                          </tr>
                        )}
                        {linkedinLoading ? (
                          <tr>
                            <td className="text-center" colSpan="12">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          analysic.map((user, i) => {
                            let content = user?.LinkedinContentId
                     

                            return (
                              <tr key={i}>
                                <td className="text-center">{user?.LinkedinContentId?._id}</td>
                                <td className="text-center">{user?.LinkedinContentId?.name}</td>


                                <td className="text-center">{(content.education.map(e => e.degree + " at " + e.school))}</td>
                                <td className="text-center">
                                 {user?.createdAt}
                                </td>









                                <td className="text-center">
                                  <Link to={`/Usage-user/view/${user?._id}`}>
                                    <button
                                      style={{
                                        fontWeight: "600",
                                        color: "#000",
                                      }}
                                      type="button"
                                      className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                    >
                                      {packageviewLoading === user._id ? (
                                        <CircularProgress size={25} />
                                      ) : (
                                        "View"
                                      )}
                                    </button>
                                  </Link>
                                </td>
                                {/* <td className="text-start">
                                  <button
                                    onClick={() =>
                                      handleLinkedinDelete(user?._id)
                                    }
                                    style={{
                                      background: "red",
                                      fontWeight: "600",
                                      color: "#000",
                                    }}
                                    type="button"
                                    className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                  >
                                    {linkedindelLoading === user?._id ? (
                                      <CircularProgress size={25} />
                                    ) : (
                                      "Delete"
                                    )}
                                  </button>
                                </td> */}
                              </tr>
                            );
                          })
                        )}
                        <Pagination sx={{ textAlign: "end" }}
                          count={anaysicResult.totalPages}
                          page={anaysicResult.currentPage}
                          onChange={(e, value) => {
                            setCurrentPage(value);
                            getAllAnalysis(value, undefined, undefined, undefined);
                          }}
                          color="primary"
                          shape="rounded"
                        />
                      </tbody>
                    </table>
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

export default Linkedin;
