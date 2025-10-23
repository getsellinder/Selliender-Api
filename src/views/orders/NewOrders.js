import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { isAutheticated } from "src/auth";
import Button from "@material-ui/core/Button";
import { cilSearch } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { TextField, FormControl, Select, MenuItem } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function NewOrders() {
  const token = isAutheticated();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(true);
  const [newOrdersData, setNewOrdersData] = useState([]);
  // console.log(newOrdersData);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const [showData, setShowData] = useState(newOrdersData);

  const handleShowEntries = (e) => {
    setCurrentPage(1);
    setItemPerPage(e.target.value);
  };

  function getNewOrder() {
    axios
      .get(`/api/order/getAll/new`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const filteredOrders = res.data.order.filter(
          (order) => order.orderType === "WebSite"
        );

        setNewOrdersData(filteredOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }
  useEffect(() => {
    setLoading(true);
    getNewOrder();
  }, []);

  // Export to excel
  const exportToExcel = () => {
    const flattenedData = newOrdersData.map((order) => ({
      "Order ID": order?.orderID,
      Customer: order?.user?.name,
      "Order value": `${order?.currency}${order?.total_amount}`,
      "Order At": new Date(order?.paidAt).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "numeric",
        hour12: true,
      }),
      Status: order?.orderStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);

    // Apply styles to header row
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCFF" } }, // Light blue background
      alignment: { horizontal: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" } },
    };
    Object.keys(worksheet).forEach((cell) => {
      const cellRef = worksheet[cell];
      if (cellRef.t === "s" && cellRef.s) {
        cellRef.s = headerStyle;
      }
    });

    // Apply styles to data rows
    const dataStyle = {
      border: { bottom: { style: "thin" } },
    };
    Object.keys(worksheet).forEach((cell) => {
      const cellRef = worksheet[cell];
      if (cellRef.t !== "s" && cellRef.s) {
        cellRef.s = dataStyle;
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "exportedData.xlsx");
  };

  const handleDelete = (id) => {
    console.log(id);
    swal({
      title: "Are you sure?",
      icon: "error",
      buttons: {
        Yes: { text: "Yes", value: true },
        Cancel: { text: "Cancel", value: "cancel" },
      },
    }).then((value) => {
      if (value === true) {
        axios
          .delete(`/api/order/delete/${id}`, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setSuccess((prev) => !prev);
          })
          .catch((err) => {
            swal({
              title: "Warning",
              text: err.response.data.message
                ? err.response.data.message
                : "Something went wrong!",
              icon: "error",
              button: "Retry",
              dangerMode: true,
            });
          });
      }
    });
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [searchValue, setsearchValue] = useState("orderId");
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "Search") {
      setsearchValue(value);
    }
  };
  const formatDate = (dateString) => {
    const dateArray = dateString.split(" ");
    const day = dateArray[0];
    const month = dateArray[1];
    const year = dateArray[2];
    const monthNumber = new Date(Date.parse(`${month} 1, 2022`)).getMonth() + 1;
    return `${year}-${
      monthNumber < 10 ? "0" + monthNumber : monthNumber
    }-${day}`;
  };
  // const formatDate = (date) => {
  //   const day = ("0" + date.getDate()).slice(-2);
  //   const month = ("0" + (date.getMonth() + 1)).slice(-2);
  //   const year = date.getFullYear();
  //   return `${year}-${month}-${day}`;
  // };
  // console.log(searchTerm);
  useEffect(() => {
    setTimeout(() => {
      if (searchTerm !== "") {
        let searchedResult = [];
        if (searchValue === "orderId") {
          searchedResult = newOrdersData.filter((item) =>
            item.orderID.toString().includes(searchTerm)
          );
        } else if (searchValue === "Name") {
          searchedResult = newOrdersData.filter((item) =>
            item.user?.name
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        } else if (searchValue === "City") {
          searchedResult = newOrdersData.filter((item) =>
            item.shippingInfo.city
              .toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        } else if (searchValue === "Amount") {
          searchedResult = newOrdersData.filter((item) =>
            item.total_amount.toString().includes(searchTerm)
          );
        } else if (searchValue === "OrderDate") {
          // Format input date
          const formattedDate = formatDate(searchTerm);

          searchedResult = newOrdersData.filter((item) =>
            item.createdAt.includes(formattedDate)
          );
        } else if (searchValue === "ProductName") {
          searchedResult = newOrdersData.filter((order) =>
            order.orderItems.some((item) =>
              item.name
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          );
        } else if (searchValue === "MobileNumber") {
          searchedResult = newOrdersData.filter((item) =>
            item.shippingInfo.phone_Number.toString().includes(searchTerm)
          );
        }

        setShowData(searchedResult);
      } else {
        getNewOrder();
      }
    }, 100);
  }, [searchTerm, searchValue, newOrdersData]);

  useEffect(() => {
    const loadData = () => {
      const indexOfLastPost = currentPage * itemPerPage;
      const indexOfFirstPost = indexOfLastPost - itemPerPage;
      setShowData(newOrdersData.slice(indexOfFirstPost, indexOfLastPost));
    };
    loadData();
  }, [currentPage, itemPerPage, newOrdersData]);

  console.log(showData);
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
                  New Orders
                </div>

                {/* <div className="page-title-right">
                  <Link to="/order/add">
                    <Button
                      variant="contained"
                      color="primary"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        textTransform: "capitalize",
                      }}
                    >
                      Add Order
                    </Button>
                  </Link>
                </div> */}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="row ml-0 mr-0 mb-10">
                      <div className="col-sm-12 col-md-12">
                        <div className="dataTables_length">
                          <label className="w-100">
                            Show
                            <select
                              style={{ width: "50px" }}
                              name=""
                              onChange={(e) => handleShowEntries(e)}
                              className="
                                select-w
                                custom-select custom-select-sm
                                form-control form-control-sm
                              "
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
                    <div
                      className="ml-5 mt-2"
                      style={{ display: "flex", flex: 1 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "1rem",
                        }}
                      >
                        <Typography
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            marginRight: "1rem",
                          }}
                        >
                          Search by :
                        </Typography>
                        <FormControl>
                          <Select
                            name="Search"
                            value={searchValue}
                            onChange={handleChange}
                            style={{
                              display: "flex",
                              marginBottom: "1rem",
                              width: "120px",
                              height: "2rem",
                            }}
                          >
                            <MenuItem
                              value="orderId"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              orderId
                            </MenuItem>
                            <MenuItem
                              value="Name"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              Name
                            </MenuItem>
                            <MenuItem
                              value="City"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              City
                            </MenuItem>
                            <MenuItem
                              value="Amount"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              Amount
                            </MenuItem>
                            <MenuItem
                              value="OrderDate"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              OrderDate
                            </MenuItem>
                            <MenuItem
                              value="ProductName"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              ProductName
                            </MenuItem>
                            <MenuItem
                              value="MobileNumber"
                              style={{ display: "block", marginLeft: "0.5rem" }}
                            >
                              MobileNumber
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      {/* <div>
                        {searchValue === "OrderDate" && (
                          <DatePicker
                            selected={searchTerm}
                            onChange={(date) => setSearchTerm(date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select a date"
                          />
                        )}
                        {searchValue !== "OrderDate" && (
                          <TextField
                            type="text"
                            placeholder="Search Here"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        )}
                        <CIcon icon={cilSearch} size="xl" />
                      </div> */}
                      <div>
                        <TextField
                          type="text"
                          placeholder="Search Here"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <CIcon icon={cilSearch} size="xl" />
                      </div>
                    </div>
                    <Button
                      // color="primary"
                      variant="contained"
                      style={{ background: "green", color: "white" }}
                      onClick={exportToExcel}
                    >
                      Export as excel
                    </Button>
                  </div>

                  <div className="table-responsive table-shoot mt-3">
                    <table
                      className="table table-centered table-nowrap"
                      style={{ border: "1px solid" }}
                    >
                      <thead
                        className="thead"
                        style={{ background: "rgb(140, 213, 213)" }}
                      >
                        <tr>
                          <th className="text-start">Order ID</th>
                          <th className="text-start">Customer</th>
                          <th className="text-start">Order value</th>
                          <th className="text-start">Order At</th>
                          <th className="text-start">Payment</th>
                          <th className="text-start">Status</th>
                          <th className="text-start">Actions</th>
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
                          showData.map((order, i) => {
                            return (
                              <tr key={i}>
                                <td className="text-start">{order?.orderID}</td>
                                <td className="text-start">
                                  {order?.user?.name}
                                </td>
                                <td className="text-start">
                                  {order?.currency}
                                  {order?.total_amount}
                                </td>
                                <td className="text-start">
                                  {new Date(
                                    order?.paidAt
                                      ? order?.paidAt
                                      : order?.createdAt
                                  ).toLocaleString("en-GB", {
                                    timeZone: "Europe/London", // Set the time zone to UK

                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  })}
                                </td>
                                <td className="text-start">
                                  <span
                                    className={`badge ${
                                      order?.isPaid
                                        ? "text-bg-success"
                                        : `text-bg-danger`
                                    } text-white`}
                                  >
                                    {order?.isPaid ? "Paid" : "Not Paid"}
                                  </span>
                                </td>
                                <td className="text-start">
                                  <span className="badge text-bg-primary text-white">
                                    {order?.orderStatus}
                                  </span>
                                </td>
                                <td className="text-start">
                                  {/* <Link to={`/orders/${order.orderStatus}/${order._id}`}> */}
                                  <Link
                                    to={`/orders/${order.orderStatus}/${order._id}`}
                                  >
                                    <button
                                      style={{ color: "white" }}
                                      type="button"
                                      className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    ms-2 mt-1
                                  "
                                    >
                                      View
                                    </button>
                                  </Link>
                                  {/* <Link to={`/orders/edit/${order._id}`}>
                                    <button
                                      style={{ color: "white" }}
                                      type="button"
                                      className="
                                      btn btn-info btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    ms-2  mt-1
                                  "
                                    >
                                      Edit
                                    </button>
                                  </Link> */}

                                  {/* <button
                                    style={{ color: "white" }}
                                    type="button"
                                    className="
                                      btn btn-danger btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    ms-2  mt-1
                                  "
                                    onClick={() => handleDelete(order._id)}
                                  >
                                    Delete
                                  </button> */}
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
                          newOrdersData.length
                        )}{" "}
                        of {newOrdersData.length} entries
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
                            newOrdersData.length - 1
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
                                newOrdersData.length - 1
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
}

export default NewOrders;
