import React, { useEffect, useState } from "react";
import "./Billing.css";
import { useCustomer } from "../CustomerSupport/CustomerContext";
import { isAutheticated } from "src/auth";
import axios from "axios";
import { CircularProgress } from "@material-ui/core";


const rows = new Array(8).fill(0).map((_, i) => ({
    date: "23 April, 2023 6:00 PM",
    saleNo: `Sale S0${10 - i}`,
    customer: [
        "Saket",
        "Karan",
        "Aman Kumar Singh",
        "Manish",
        "Karan Godhwani",
        "Aman Kumar Singh",
        "Abhishek Verma",
        "Nitin Chandel",
    ][i % 8],
    total: "2500.00",
    due: i % 3 === 0 ? "1000.00" : "0.00",
    status: ["Partial", "Paid", "Unpaid", "Partially Paid"][i % 4],
}));
const tableheadings = [
    "Date & Time",
    "Invoice Number",
    "Customer Name",
    "Total Amount",
    // "Due Amount",
    "Status",
    "Action",
];

const Billing = () => {
    const token = isAutheticated();
    const [search, setSearch] = useState();
    const [searchByDate, setSearchByDate] = useState();
    const { appdetails } = useCustomer();

    const [totalpages, setTotalPages] = useState();
    const [itemPerPage, setItemPerPage] = useState(10);

    const [currentPage, setCurrentPage] = useState();
    const [errormsge, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [biling, setBiling] = useState([]);

    const getBiling = async (
        searchName = search,
        page = 1,
        limit = itemPerPage,
        date = searchByDate
    ) => {
        try {
            setLoading(true);
            const params = { limit, page };
            if (searchName && searchName.trim() !== "") {
                params.name = searchName.trim();
            }
            if (searchByDate && searchByDate.trim() !== "") {
                params.date = searchByDate.trim();
            }

            const res = await axios.get("/api/billing/get", {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });

            setBiling(res?.data);
            setTotalPages(res.data.totalPages);
            // setCurrentPage(res.data.currentPage);
            setItemPerPage(limit);
        } catch (error) {
            const msg = error.response?.data?.message || "Internal Server Error";
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getBiling(search, currentPage, itemPerPage, searchByDate);
    }, [search, currentPage, itemPerPage, searchByDate]);
    console.log("biling", biling)
    const summaryData = [
        { title: "Total Sales", value: `${biling?.totalsales}`, color: "#27ae60" },
        // { title: "Total Due Amount", value: "Rs. 8300.00", color: "#e74c3c" },
        { title: "Total Received Amount", value: `${biling?.totalAmount}`, color: "#111" },
    ];

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1)
    }
    const handleNext = () => {
        if (currentPage < totalpages) setCurrentPage((prev) => prev - 1)
    }
    return (
        <>
            <div>
                <h3>Billing</h3>
            </div>
            <div className="billing-page">
                <main className="billing-main">
                    <header className="billing-header">
                        {/* <div className="date-range">
                            Last 7 Days - 15 July 2023 to 21 July 2023
                        </div> */}
                        <div className="date-range-picker">
                            <label htmlFor="filterDate" className="date-label">
                                Select Date:
                            </label>
                            <input
                                type="text"
                                id="filterDate"
                                placeholder="dd/mm/yyyy"
                                value={searchByDate}
                                onChange={(e) => setSearchByDate(e.target.value)}
                                className="date-input"
                            />
                            <button
                                className="orders-view-btn p-2"
                                onClick={() => setSearchByDate(selectedDate)}
                            >
                                Filter
                            </button>
                        </div>

                        <div className="">
                            <input
                                className="billing-search "
                                type="text"
                                placeholder="Search By Invoice Number"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>
                    </header>

                    <section className="summary-cards">
                        {summaryData.map((s) => (
                            <div className="card" key={s.title}>
                                <div className="card-title">{s.title}</div>
                                <div className="card-value" style={{ color: s.color }}>
                                    {loading ? <CircularProgress size={25} /> : s.value}

                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="billing-table-wrap">
                        <table className="billing-table">
                            <thead>
                                <tr>
                                    {tableheadings.map((val) => (
                                        <th >{val}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? <tr>
                                    <td colSpan="9" className="text-center py-10">
                                        <div className="flex justify-center items-center">
                                            <CircularProgress size={50}
                                                thickness={5}
                                                style={{ color: "#1976d2" }} />
                                        </div>
                                    </td>
                                </tr> : biling?.getresult?.map((r, i) => (
                                    <tr key={i} className={i % 2 === 0 ? "odd" : "even"}>
                                        <td>{r.createdAt}</td>
                                        <td>{r.InvoiceNo}</td>
                                        <td>{r.userId.name}</td>
                                        <td>₹{r.Amount}</td>
                                        {/* <td>{r.due}</td> */}
                                        <td>{r.status}</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button className="orders-view-btn p-2" onClick={() => navigate(`/${o.userId.name}/invoice/${o.userId._id}`)}>
                                                    View
                                                </button>
                                                <div>
                                                    <button className="orders-view-btn p-2" onClick={() => navigate(`/${o.userId.name}/invoice/${o.userId._id}`)}>
                                                        Invoice
                                                    </button>
                                                </div>
                                                <div>

                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

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

                            {Array.from({ length: totalpages }, (_, i) => {
                                const isActive = currentPage === i + 1
                                return (
                                    <button
                                        key={i + 1}
                                        className={isActive ? "orders-page-num-active" : "orders-page-num-inactive"}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            })}

                            <button
                                className="orders-page-btn"
                                onClick={handleNext}
                                disabled={currentPage === totalpages}
                            >
                                ›
                            </button>
                        </div>
                    </section>
                </main>

            </div>
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
        </>
    );
};

export default Billing;
