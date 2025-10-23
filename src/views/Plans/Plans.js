import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import swal from "sweetalert";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Fuse from "fuse.js";
import { InputAdornment, Typography } from "@material-ui/core";
import { CircularProgress } from "@mui/material";

import { isAutheticated } from "src/auth";
import { usePlan } from "./PlanContext";

const Plans = () => {
  const token = isAutheticated();
  const {
    allPackages,
    handlePackageDelete,
    packagedelLoading,
    packageLoading,
    handleSinglePackage,
    singlePlanData,
    packageviewLoading,
    getAllpackages,
  } = usePlan();
  const packages = allPackages?.getpackages;

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState();
  const [itemPerPage, setItemPerPage] = useState();
  const [limit, setLimit] = useState(5);

  const [name, setName] = useState("");


  // const handleSearch = (e) => {
  //   let plan=e.target.value
  //   // setCurrentPage(1);

  //   getAllpackages(1, limit, plan, undefined);
  //   // setName(name);
  // };

  const handleSearch = (plan) => {
    getAllpackages(1, limit, plan, undefined);
  };

  const handleShowEntries = (e) => {
    let newlimit = e.target.value;
    setLimit(newlimit)
    getAllpackages(1, newlimit, undefined, undefined);
  };


  const tableheading = [

    "Plan",
    "M.Price", // Monthly Price
    "Y.Price", // Yearly Price
    "GST",
    "T.M.Price", // Total-Monthly-Price
    "T.Y.Price", // Total-Yearly-Price
    "Status",
    "Created",
    "",
    "",
    "",
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
                  All Plans
                </div>

                {/* <div className="page-title-right">
                  <Button
                    variant="contained"
                    color="primary" 
                    style={{
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      textTransform: "capitalize",
                    }}
                    onClick={() => {
                      navigate("/Pricing-Plans/add");
                    }}
                  >
                    Add Plan
                  </Button>
                </div> */}
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
                            placeholder="Search Plan..."
                            value={name}
                            name="name"
                            onChange={(e) => {
                              const val = e.target.value;
                              setName(val);
                              getAllpackages(1, limit, val, undefined);
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
                            <th

                            >
                              {name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!packageLoading && packages.length === 0 && (
                          <tr className="text-center">
                            <td colSpan="12">
                              <h5>No Data Available</h5>
                            </td>
                          </tr>
                        )}
                        {packageLoading ? (
                          <tr>
                            <td className="text-center" colSpan="12">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          packages.map((user, i) => {
                            console.log("user", user)

                            return (
                              <tr key={i}>
                                <td className="text-start">{user.Package}</td>

                                <td className="text-center">
                                  {user.Monthly_Price===null?0:`₹${user.Monthly_Price}`}
                                </td>
                                <td className="">{user.Yearly_Price===null?0:`₹${user.Yearly_Price}`}</td>
                                <td className="">{user.GST?.Gst===undefined?0:`${user.GST?.Gst}%`}</td>
                                <td className="text-center">
                                  {" "}
                                 {user.Total_Monthly_Price===null?0:` ₹${user.Total_Monthly_Price}`}
                                </td>
                                <td className="text-center">
                                  {" "}
                                  {user.Total_Yearly_Price===null?0:`₹${user.Total_Yearly_Price}`}
                                </td>

                                <td className="text-center"> {user.Status}</td>

                                <td className="text-center">
                                  {new Date(user.createdAt).toLocaleString(
                                    "en-IN",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    }
                                  )}
                                </td>

                                <td className="text-start">
                                  <Link
                                    to={`/Pricing-Plans/update/${user?._id}`}

                                  >
                                    <button
                                      style={{
                                        background: "orange",
                                        fontWeight: "600",
                                        color: "#000",
                                      }}
                                      type="button"
                                      className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                    >
                                      Update
                                    </button>
                                  </Link>
                                </td>
                                <td className="text-start">
                                  <Link to={`/Pricing-Plans/view/${user?._id}`}>
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
                                      handlePackageDelete(user?._id)
                                    }
                                    style={{
                                      background: "red",
                                      fontWeight: "600",
                                      color: "#000",
                                    }}
                                    type="button"
                                    className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                  >
                                    {packagedelLoading === user?._id ? (
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
                          count={allPackages.totalPages}
                          page={allPackages.currentPage}
                          onChange={(e, value) => {
                            setCurrentPage(value);
                            getAllpackages(value, undefined, undefined, undefined);
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

export default Plans;
