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
  const [totalpages,setTotalPages]=useState()
  const [showData, setShowData] = useState([]);

  const [name, setName] = useState("");

  const getUsers = async (
    searchName = name,
    page = currentPage,
    limit = itemPerPage
  ) => {
    axios
      .get(`/api/v1/admin/customer`, {
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
        setShowData(res?.data);
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
  const handleSearch = () => {
    setCurrentPage(1);
    getUsers(name, 1, itemPerPage); // pass query explicitly
    setName(name);
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

  const tableheading = ["Id", "Customer","Plan Name","Plan Amount","Registation","Action"];

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
                            placeholder="Search customers..."
                            value={name}
                            name="name"
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={handleSearch}
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
                            <th style={{textAlign:"center"}}>{name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!loading && showData.length === 0 && (
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
                          showData?.customers?.map((user, i) => {
                            return (
                              <tr key={i}>
                                <td className="text-start" style={{textAlign:"center"}}>{user._id}</td>
                                 <td className="text-start">{user.name}</td>
                                     <td className="text-start">{user._id}</td>
                                 {/* <td className="text-start">{user.name}</td> */}
                                <td>
                                  {user.logintype
                                    ? user.logintype
                                    : "not login yet"}
                                </td>

                                <td className="text-start">
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
                                  <Link to={`/customers-details/${user?._id}`}>
                                    <button
                                      type="button"
                                      className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                    >
                                      View
                                    </button>
                                  </Link>
                                   <Link >
                                    <button style={{background:"orange"}}
                                      type="button"
                                      className="mt-1 btn btn-info btn-sm  waves-effect waves-light btn-table ml-2"
                                    >
                                      Invoices
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
                            setCurrentPage(value)
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
