import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isAutheticated } from "src/auth";
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
import OrderDetails from "./orderDetails";
const CustomerTable = () => {
  const token = isAutheticated();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [loading1, setLoading1] = useState(true);
  const [success, setSuccess] = useState(true);
  const [users, setUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState();
  const [itemPerPage, setItemPerPage] = useState();
  const [totalpages, setTotalPages] = useState();
  const [showData, setShowData] = useState([]);

  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");

  const getUsers = async (
    searchName = name,
    page = currentPage,
    limit = itemPerPage
  ) => {
    axios
      .get(`/api/customer/customers`, {
        params: {
          limit: limit,
          page: page,
          name: searchName,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setShowData(res?.data.data);
        setTotalPages(res.data.total_pages);
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
  const handleSearch = (name) => {
    setCurrentPage(1);
    getUsers(name, 1, itemPerPage);
    setName(name);
    setPlan(name);
  };
  const handleShowEntries = (e) => {
    let newlimit = e.target.value;
    setCurrentPage(1);
    setItemPerPage(newlimit);
    getUsers(name, 1, newlimit);
  };

  useEffect(() => {
    getUsers();
  }, [success]);

  const tableheading = [
    "Id",
    "Customer",
    "Plan Name",
    "Plan Amount",
    "Status",
    "Registation",
    "Action",
  ];
  console.log("showData", showData);
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
                  All Customers
                </div>
                {/* 
                <div className="page-title-right">
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      textTransform: "capitalize",
                    }}
                    onClick={() => {
                      navigate("/add-customer");
                    }}
                  >
                    Add Customer
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
                            <option value="4">4</option>
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
                            placeholder="Search customers..."
                            value={name}
                            name="name"
                            onChange={(e) => {
                              let val = e.target.value;
                              setName(val)
                              getUsers(val, 1, itemPerPage);
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
                            <th style={{ textAlign: "start" }}>{name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!loading && showData?.length === 0 && (
                          <tr className="text-center">
                            <td colSpan="6">
                              <h5>No Data Available</h5>
                            </td>
                          </tr>
                        )}
                        {loading ? (
                          <tr>
                            <td className="text-center" colSpan="6">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          showData?.map((user, i) => {
                            console.log("showData", showData);
                            return (
                              <tr key={i}>
                                <td className="text-start">{user.userId._id}</td>
                                <td className="text-start">
                                  {user.userId.name}
                                </td>
                                <td className="text-start">
                                  {user.PlanId.Package}
                                </td>
                                <td className="text-start">
                                  {user.Amount === "0" ? 0 : `₹${user.Amount}`}
                                </td>
                                <td className="text-start">{user.status}</td>
                                <td className="text-start">
                                  {user.createdAt}
                                </td>

                                <td className="text-start">
                                  {/* <Link to={`/customers-details/${user?._id}`}>
                                    <button
                                      type="button"
                                      className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                    >
                                      View
                                    </button>
                                  </Link> */}
                                  <Link
                                    to={`/${user.userId.name}/invoice/${user?._id}`}
                                  >
                                    <button
                                      style={{ background: "orange" }}
                                      type="button"
                                      className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                    >
                                      Invoice
                                    </button>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
                        )}
                        <Pagination
                          count={totalpages}
                          page={currentPage}
                          onChange={(e, value) => {
                            setCurrentPage(value);
                            getUsers(name, value, itemPerPage);
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

export default CustomerTable;
