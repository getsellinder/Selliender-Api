import React, { useEffect, useState } from "react";
import "./Order.css";
import { useCustomer } from "../CustomerSupport/CustomerContext";
import { useNavigate } from "react-router-dom";
import { isAutheticated } from "src/auth";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";

const orders = [
  {
    user: "Mehak kumar",
    amount: "₹4990",
    start: "Sep 16, 2025",
    expiry: "Sep 16, 2026",
    plan: "Professional",
    type: "annually",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹199",
    start: "Sep 16, 2025",
    expiry: "Oct 16, 2025",
    plan: "Starter",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹199",
    start: "Sep 16, 2025",
    expiry: "Oct 16, 2025",
    plan: "Starter",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹499",
    start: "Sep 16, 2025",
    expiry: "Oct 16, 2025",
    plan: "Professional",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹299",
    start: "Sep 16, 2025",
    expiry: "Oct 16, 2025",
    plan: "Growth",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹499",
    start: "Sep 16, 2025",
    expiry: "Oct 16, 2025",
    plan: "Professional",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹499",
    start: "Sep 15, 2025",
    expiry: "Oct 15, 2025",
    plan: "Professional",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹499",
    start: "Sep 12, 2025",
    expiry: "Oct 12, 2025",
    plan: "Professional",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹299",
    start: "Sep 11, 2025",
    expiry: "Oct 11, 2025",
    plan: "Growth",
    type: "monthly",
    status: "paid",
  },
  {
    user: "Mehak kumar",
    amount: "₹499",
    start: "Sep 11, 2025",
    expiry: "Oct 11, 2025",
    plan: "Professional",
    type: "monthly",
    status: "paid",
  },
];

const Order = () => {
  const token = isAutheticated();
  const [search, setSearch] = useState("");
  const { appdetails } = useCustomer();

  const [totalpages, setTotalPages] = useState();
  const [itemPerPage, setItemPerPage] = useState();

  const [currentPage, setCurrentPage] = useState();
  const [errormsge, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState([]);

  const navigate = useNavigate();

  const tablerow = [
    "#",
    "USER",
    "AMOUNT",
    "START",
    "EXPIRY",
    "PLAN",
    "TYPE",
    "STATUS",
    "INVOICE",
  ];

  // const getOrders = async (
  //   searchName = search,
  //   page = 1,
  //   limit = itemPerPage
  // ) => {
  //      setLoading(true);
  //   axios
  //     .get(`/api/order/getAll`, {
  //       params: {
  //         limit: limit,
  //         page: page,
  //         name: searchName,
  //       },
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       console.log("res?.data",res?.data)
  //       setOrder(res?.data);
  //       setTotalPages(res.data.totalPages);
  //       setCurrentPage(res.data.currentPage)
  //       setItemPerPage(res.data.totalItems)
  //           setLoading(false);

  //     })
  //     .catch((error) => {
  //       swal({
  //         title: error,
  //         text: "please login to access the resource or refresh the page  ",
  //         icon: "error",
  //         button: "Retry",
  //         dangerMode: true,
  //       });
  //       setLoading(false);
  //     })
  // };

  const getOrders = async (
    searchName = search,
    page = 1,
    limit = itemPerPage
  ) => {
    try {
      setLoading(true);

      const res = await axios.get("/api/order/getAll", {
        params: { limit, page, name: searchName },
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res?.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
      setItemPerPage(res.data.totalItems);
    } catch (error) {
      const msg = error.response?.data?.message || "Internal Server Error";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders(search, currentPage, itemPerPage);
  }, [currentPage, search]);
  let fetchOrders = order?.data;

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNext = () => {
    if (currentPage < totalpages) setCurrentPage((prev) => prev + 1);
  };
  console.log("Current Page", currentPage);
  return (
    <div className="orders-page">
      <div className="orders-header-bar">
        <input
          className="orders-search"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* <div className="orders-profile">
                    <span className="orders-profile-icon">&#128100;</span>
                    <span className="orders-profile-name">Ayyappa nagubandi</span>
                </div> */}
      </div>

      <div className="orders-table-card">
        <div className="orders-table-title">
          <span className="orders-table-icon">📦</span>
          <span>Orders</span>
        </div>

        <table className="orders-table">
          <thead className="border-y border-white">
            <tr className="divide-x divide-white">
              {tablerow.map((val) => (
                <th className="border-white px-3 py-2">{val}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <CircularProgress size={50}
                      thickness={5}
                      style={{ color: "#1976d2" }} />
                  </div>
                </td>
              </tr>
            ) : (
              fetchOrders?.map((o, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{o.userId.name}</td>

                  <td>{o.Amount === "0" ? 0 : `₹${o.Amount}`}</td>
                  <td>{o.plan_start_date}</td>
                  <td>{o.plan_expiry_date}</td>
                  <td>{o.PlanId.Package}</td>
                  <td>
                    <span className={`orders-pill orders-pill-type`}>
                      {o.duration}
                    </span>
                  </td>
                  <td>
                    <span className={`orders-pill orders-pill-status`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <button className="orders-view-btn">
                      <span className="orders-view-icon">📄</span> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="orders-pagination">
          <button
            className="orders-page-btn"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {/* {Array.from({length:totalpages},(_,i)=>(
<span  key={i+1}   className={`orders-page-btn  orders-page-num ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""}`}      onClick={() => setCurrentPage(i + 1)}>{i+1}</span>
          ))} */}
          {Array.from({ length: totalpages }, (_, i) => (
            <button
              key={i + 1}
              className={`orders-page-num ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="orders-page-btn"
            onClick={handleNext}
            disabled={currentPage === totalpages}
          >
            ›
          </button>
        </div>
      </div>

      {/* <footer className="orders-footer">
        Copyright © 2023-2024{" "}
        <a href="https://neonflake.com" target="_blank" rel="noreferrer">
          Neonflake Enterprises OPC Pvt Ltd
        </a>
      </footer> */}
      <footer className="orders-footer">
        {appdetails.map((val, index) => {
          return (
            <a
              href="https://neonflake.com"
              target="_blank"
              rel="noreferrer"
              key={index}
            >
              {val.copyrightMessage}
            </a>
          );
        })}
      </footer>
    </div>
  );
};

export default Order;
