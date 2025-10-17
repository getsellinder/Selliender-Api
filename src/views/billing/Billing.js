import React from "react";
import "./Billing.css";

const summaryData = [
    { title: "Total Sales", value: "Rs. 22700.00", color: "#27ae60" },
    // { title: "Total Due Amount", value: "Rs. 8300.00", color: "#e74c3c" },
    { title: "Total Received Amount", value: "Rs. 14400.00", color: "#111" },
];

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
    "Sale Number",
    "Customer Name",
    "Total Amount",
    "Due Amount",
    "Status",
    "Action",
];

const Billing = () => {
    return (
        <>
            <div>
                <h3>Billing</h3>
            </div>
            <div className="billing-page">
                <main className="billing-main">
                    <header className="billing-header">
                        <div className="date-range">
                            Last 7 Days - 15 July 2023 to 21 July 2023
                        </div>
                    </header>

                    <section className="summary-cards">
                        {summaryData.map((s) => (
                            <div className="card" key={s.title}>
                                <div className="card-title">{s.title}</div>
                                <div className="card-value" style={{ color: s.color }}>
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="billing-table-wrap">
                        <table className="billing-table">
                            <thead>
                                <tr>
                                    {tableheadings.map((val) => (
                                        <th>{val}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i} className={i % 2 === 0 ? "odd" : "even"}>
                                        <td>{r.date}</td>
                                        <td>{r.saleNo}</td>
                                        <td>{r.customer}</td>
                                        <td>₹{r.total}</td>
                                        <td>{r.due}</td>
                                        <td>{r.status}</td>
                                        <td>{r.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </>
    );
};

export default Billing;
