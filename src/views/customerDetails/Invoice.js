import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import { isAutheticated } from "src/auth";
import { usePlan } from "../Plans/PlanContext";
import toast from "react-hot-toast";
import { CircularProgress } from "@material-ui/core";

const Invoice = () => {
  const token = isAutheticated();
  const {
    allPackages,

    packageLoading,

    getAllpackages,
  } = usePlan();
  const { name: username, id } = useParams();
  const [invoice, setInvoice] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(null);
  const packages = allPackages?.getpackages;

  const tableheading = [
    "InvoiceNo",
    "TransactionId",
    "Plan",
    "Plan start date",
    "Plan expiry date",
    "Amount",
    "Status",
    // "Created",
  ];

  const handleInvoice = async () => {
    try {
      setInvoiceLoading(true);
      const res = await axios.get(`/api/package/get/invoice/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvoice(res.data);
      localStorage.setItem("packageId", id);

      console.log("red.data", res.data);
    } catch (error) {
      const messsage = error?.response?.data?.message;
      toast.error(messsage || "Internal Server Error");
    } finally {
      setInvoiceLoading(false);
    }
  };
  useEffect(() => {
    handleInvoice(id);
  }, [id]);
  console.log("invoice", invoice);

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
                <div
                  style={{ fontSize: "22px" }}
                  className="fw-bold m-auto mb-2"
                >
                  {username?.charAt(0).toUpperCase()+username?.slice(1)} Invoice
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-10 flex justify-center m-auto">
              <div className="card">
                <div className="card-body">
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
                            <th className="text-center">{name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceLoading ? (
                          <tr className="text-center m-auto">
                            <td
                              className="auto"
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              Loading.........
                            </td>
                          </tr>
                        ) : invoice.length === 0 ? (
                          <tr>
                            <td className="text-center">No Invoices Found</td>
                          </tr>
                        ) : (
                          invoice.map((val,index) => {
                            return (
                              <tr key={index}>
                                <td className="text-center">
                                  {val?.InvoiceNo}
                                </td>

                                <td className="text-center">
                                  {val?.TransactionId === null
                                    ? "null"
                                    : val?.TransactionId}
                                </td>
                                <td className="text-center">
                                  {val?.PlanId?.Package}
                                </td>
                                <td className="text-center">
                                  {val?.plan_start_date}
                                </td>
                                <td className="text-center">
                                  {val?.plan_expiry_date}
                                </td>
                                <td className="text-center">
                                  ₹{val?.Amount}
                                </td>
                                <td className="text-center">
                                  {val?.status}
                                </td>
                              </tr>
                            );
                          })
                        )}
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

export default Invoice;
