import React from "react";
import "./BilingInvoice.css";

const sample = {
    invoice: "#2942398222",
    customer: "Mehak kumar",
    plan: {
        name: "Professional",
        type: "annually",
        start: "Sep 16, 2025",
        expiry: "Sep 16, 2026",
    },
    payment: {
        paymentId: "pay_RI9rIBC76qo5pf",
        orderId: "order_RI9rbNC4Dr4Kxf",
        signature: "7a7ed5d11432607783e88c6bd9f99e5c0777bd63037085505d11b42547957576",
        ip: "::1",
        paidAt: "9/16/2025, 11:00:19 AM",
    },
    additional: "No additional notes.",
};

const BilingInvoice = () => {
    return (
        <div className="invoice-page">
            <header className="invoice-header">
                <div className="invoice-left">
                    <div className="invoice-icon">i</div>
                    <div>
                        <div className="invoice-title">Invoice <span className="invoice-num">{sample.invoice}</span></div>
                        <div className="invoice-customer">{sample.customer}</div>
                    </div>
                </div>
                <div className="invoice-badge">razorpay</div>
            </header>

            <main className="invoice-content">
                <section className="card">
                    <h3 className="card-title"><span className="card-icon">📅</span> Plan Information</h3>
                    <table className="info-table">
                        <tbody>
                            <tr><td>Plan Name</td><td>{sample.plan.name}</td></tr>
                            <tr><td>Plan Type</td><td>{sample.plan.type}</td></tr>
                            <tr><td>Start Date</td><td>{sample.plan.start}</td></tr>
                            <tr><td>Expiry Date</td><td>{sample.plan.expiry}</td></tr>
                        </tbody>
                    </table>
                </section>

                <section className="card">
                    <h3 className="card-title"><span className="card-icon">💵</span> Payment Information</h3>
                    <table className="info-table">
                        <tbody>
                            <tr><td>Razorpay Payment ID</td><td>{sample.payment.paymentId}</td></tr>
                            <tr><td>Razorpay Order ID</td><td>{sample.payment.orderId}</td></tr>
                            <tr><td>Razorpay Signature</td><td className="long">{sample.payment.signature}</td></tr>
                            <tr><td>IP Address</td><td>{sample.payment.ip}</td></tr>
                            <tr><td>Paid At</td><td>{sample.payment.paidAt}</td></tr>
                        </tbody>
                    </table>
                </section>

                <section className="card">
                    <h3 className="card-title"><span className="card-icon">ℹ️</span> Additional Details</h3>
                    <div className="additional">{sample.additional}</div>
                </section>
            </main>
        </div>
    );
};

export default BilingInvoice;