

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { useNavigate } from "react-router-dom";
import { isAutheticated } from "src/auth";
import swal from "sweetalert";
const Patient = () => {
    const token = isAutheticated();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(true);
    const [patientsData, setPatientsData] = useState([]);

    const nameRef = useRef();
    // const categoryRef = useRef();
    const mobileRef = useRef()
    const VerifyPatientRef = useRef();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [totalData, setTotalData] = useState(0);

    // const {
    //   edit,
    //   add,
    //   delete: deletepermission,
    // } = checkPermission("Patient Master");
    const getPatientsData = async () => {
        setLoading(true);
        await axios
            .get(`/api/patient/getAll/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    page: currentPage,
                    show: itemPerPage,
                    name: nameRef.current.value,
                    mobileNumber: mobileRef.current.value,
                    isVerified: VerifyPatientRef.current.value,
                },
            })
            .then((res) => {
                console.log("res.data?.data", res.data);
                setPatientsData(res.data?.patient);
                setTotalData(res.data?.total_data);
                setLoading(false);
            })
            .catch((err) => {
                const msg = err?.response?.data?.message || "Something went wrong!";
                swal({
                    title: err,
                    text: msg,
                    icon: "error",
                    button: "Retry",
                    dangerMode: true,
                });
                setLoading(false);
            });

        setLoading(false);
    };

    // const getCatagories = () => {
    //     axios
    //         .get(`/api/category/getCategories`, {
    //             headers: {
    //                 "Access-Control-Allow-Origin": "*",
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         })
    //         .then((res) => {
    //             setCategories(res?.data?.categories);
    //         });
    // };


    // useEffect(() => {
    //     getCatagories();
    // }, []);

    useEffect(() => {
        getPatientsData();
    }, [success, itemPerPage, currentPage]);

    const handleDelete = (id) => {
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
                    .delete(`/api/patient/delete/${id}`, {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .then((res) => {
                        swal({
                            title: "Deleted",
                            text: "Patient Deleted successfully!",
                            icon: "success",
                            button: "ok",
                        });
                        setSuccess((prev) => !prev);
                    })
                    .catch((err) => {
                        let msg = err?.response?.data?.message
                            ? err?.response?.data?.message
                            : "Something went wrong!";
                        swal({
                            title: "Warning",
                            text: msg,
                            icon: "error",
                            button: "Retry",
                            dangerMode: true,
                        });
                    });
            }
        });
    };
    const handleVerifydPatient = (id) => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: {
                Yes: { text: "Yes", value: true },
                Cancel: { text: "Cancel", value: "cancel" },
            },
        }).then((value) => {
            if (value === true) {
                axios
                    .patch(`/api/patient/admin/feature_product/status/${id}`, {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .then((res) => {
                        swal({
                            title: "Changed",
                            text: " Verify Patient status changed successfully!",
                            icon: "success",
                            button: "ok",
                        });
                        setSuccess((prev) => !prev);
                    })
                    .catch((err) => {
                        let msg = err?.response?.data?.msg
                            ? err?.response?.data?.msg
                            : "Something went wrong!";
                        swal({
                            title: "Warning",
                            text: msg,
                            icon: "warning",
                            button: "ok",
                            dangerMode: true,
                        });
                    });
            }
        });
    };
    const handleStatus = (id) => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: {
                Yes: { text: "Yes", value: true },
                Cancel: { text: "Cancel", value: "cancel" },
            },
        }).then((value) => {
            if (value === true) {
                axios
                    .patch(`/api/patient/admin/status/${id}`, {
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .then((res) => {
                        swal({
                            title: "Changed",
                            text: "Patient status changed successfully!",
                            icon: "success",
                            button: "ok",
                        });
                        setSuccess((prev) => !prev);
                    })
                    .catch((err) => {
                        swal({
                            title: "Warning",
                            text: "Something went wrong!",
                            icon: "error",
                            button: "Retry",
                            dangerMode: true,
                        });
                    });
            }
        });
    };
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
                                    Patients
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
                                            navigate("/patient/add", { replace: true });
                                        }}
                                    >
                                        Add Patient
                                    </Button>
                                </div> */}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row ml-0 mr-0 mb-10">
                                        <div className="col-lg-1">
                                            <div className="dataTables_length">
                                                <label className="w-100">
                                                    Show
                                                    <select
                                                        onChange={(e) => {
                                                            setItemPerPage(e.target.value);
                                                            setCurrentPage(1);
                                                        }}
                                                        className="form-control"
                                                        disabled={loading}
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
                                        <div className="col-lg-3">
                                            <label>Patient Name:</label>
                                            <input
                                                type="text"
                                                placeholder="Patient name"
                                                className="form-control"
                                                ref={nameRef}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-lg-3">
                                            <label>Mobile Number:</label>
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                className="form-control"
                                                ref={mobileRef}
                                                disabled={loading}
                                            />
                                        </div>
                                        {/* <div className="col-lg-3">
                                            <label>Filter by Mobile No.:</label>
                                            <select
                                                className="form-control"
                                                ref={categoryRef}
                                                disabled={loading}
                                            >
                                                <option value="">All</option>
                                                {categories?.map((e, i) => (
                                                    <option key={i} value={e._id}>
                                                        {e?.categoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div> */}
                                        <div className="col-lg-3">
                                            <label>Verify Patient:</label>
                                            <select
                                                className="form-control"
                                                ref={VerifyPatientRef}
                                                disabled={loading}
                                            >
                                                <option value="">----Select----</option>
                                                <option value="true">YES</option>
                                                <option value="false">NO</option>
                                            </select>
                                        </div>
                                        <div className="col-lg-2">
                                            <button
                                                className="btn btn-primary ms-1 mt-4"
                                                onClick={() => {
                                                    getPatientsData();
                                                    setCurrentPage(1);
                                                }}
                                                disabled={loading}
                                            >
                                                {loading ? "Searching.." : "Filter"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-responsive table-shoot mt-3">
                                        <table
                                            className="table table-centered table-nowrap"
                                            style={{ border: "1px solid" }}
                                        >
                                            <thead
                                                className="thead-light"
                                                style={{ background: "#ecdddd" }}
                                            >
                                                <tr>
                                                    {/* <th className="text-start">Image</th> */}
                                                    <th className="text-start">Name</th>
                                                    {/* <th className="text-start">Category</th> */}
                                                    <th className="text-start">Mobile No.</th>

                                                    {/* <th className="text-start">Price</th> */}
                                                    <th className="text-start">Email</th>

                                                    <th className="text-start">Verify</th>
                                                    <th className="text-start">Device Added</th>


                                                    <th className="text-start">Register On</th>
                                                    <th className="text-start">Action</th>
                                                </tr>

                                            </thead>

                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td className="text-center" colSpan="6">
                                                            Loading...
                                                        </td>
                                                    </tr>
                                                ) : patientsData?.length > 0 ? (
                                                    patientsData?.map((patient, i) => {
                                                        return (
                                                            <tr key={i}>
                                                                {/* <th>
                                                                    {patient?.image &&
                                                                        patient?.image?.length !== 0 ? (
                                                                        <>
                                                                            <img
                                                                                src={patient?.image[0]?.url}
                                                                                width="50"
                                                                                alt="preview"
                                                                            />
                                                                        </>
                                                                    ) : (
                                                                        <div
                                                                            className=""
                                                                            style={{ fontSize: "13px" }}
                                                                        >
                                                                            <p className="m-0">No</p>
                                                                            <p className="m-0">image</p>
                                                                            <p className="m-0">uploaded!</p>
                                                                        </div>
                                                                    )}
                                                                </th> */}
                                                                <td className="text-start">{patient?.name}</td>





                                                                <td className="text-start">{patient?.mobileNumber}</td>
                                                                <td className="text-start">{patient?.email ? patient?.email : <><small className="m-0 text-secondary">No Email Added!</small>
                                                                </>}</td>



                                                                <td className="text-start">
                                                                    <span className={`badge  text-white ${patient?.isVerified === true
                                                                        ? "text-bg-success"
                                                                        : "text-bg-danger"
                                                                        }`}>
                                                                        {patient?.isVerified ? "YES" : "NO"}

                                                                    </span>

                                                                </td>

                                                                <td className="text-start">
                                                                    <span className={`badge  text-white ${patient?.deviceAdded === true
                                                                        ? "text-bg-success"
                                                                        : "text-bg-danger"
                                                                        }`}>
                                                                        {patient?.deviceAdded ? "YES" : "NO"}

                                                                    </span>

                                                                </td>


                                                                <td className="text-start">
                                                                    {new Date(patient.createdAt).toLocaleString(
                                                                        "en-GB",
                                                                        {
                                                                            timeZone: "Europe/London", // Set the time zone to UK

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
                                                                    {/* <Link to={`/patients/variants/${patient._id}`}>
                                    <button
                                      style={{ color: 'white', marginRight: '1rem' }}
                                      type="button"
                                      className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                                    >
                                      Variants
                                    </button>
                                  </Link> */}
                                                                    <Link
                                                                        // to={`/patient/view/${patient._id}`}
                                                                        to={`/test/patient/${patient._id}`}
                                                                    >
                                                                        <button
                                                                            style={{
                                                                                color: "white",
                                                                                marginRight: "1rem",
                                                                            }}
                                                                            type="button"
                                                                            className="
                                      btn btn-info btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                                                                        >
                                                                            Test
                                                                        </button>
                                                                    </Link>
                                                                    <Link
                                                                        to={`/patient/view/${patient._id}`}
                                                                    >
                                                                        <button
                                                                            style={{
                                                                                color: "white",
                                                                                marginRight: "1rem",
                                                                            }}
                                                                            type="button"
                                                                            className="
                                      btn btn-primary btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mx-1
                                    mt-1
                                  "
                                                                        >
                                                                            View
                                                                        </button>
                                                                    </Link>

                                                                    {/* <Link to={`/patient/edit/${patient._id}`}>
                                                                        <button
                                                                            style={{
                                                                                color: "white",
                                                                                marginRight: "1rem",
                                                                            }}
                                                                            type="button"
                                                                            className="
                                      btn btn-info btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mt-1
                                    mx-1
                                  "
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </Link> */}

                                                                    <Link
                                                                        to={"#"}
                                                                        style={{
                                                                            marginRight: "1rem",
                                                                        }}
                                                                    >
                                                                        <button
                                                                            style={{ color: "white" }}
                                                                            type="button"
                                                                            className="
                                    btn btn-danger btn-sm
                                    waves-effect waves-light
                                    btn-table
                                    mt-1
                                    mx-1
                                    
                                  "
                                                                            onClick={() => {
                                                                                handleDelete(patient._id);
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    !loading &&
                                                    patientsData?.length === 0 && (
                                                        <tr className="text-center">
                                                            <td colSpan="6">
                                                                <h5>No Patient Available...</h5>
                                                            </td>
                                                        </tr>
                                                    )
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
                                                {Math.min(currentPage * itemPerPage, totalData)} of{" "}
                                                {totalData} entries
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
                                                            disabled={loading}
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
                                                                disabled={loading}
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
                                                        totalData - 1
                                                    ) && (
                                                            <li className="paginate_button page-item ">
                                                                <span
                                                                    className="page-link"
                                                                    style={{ cursor: "pointer" }}
                                                                    onClick={() => {
                                                                        setCurrentPage((prev) => prev + 1);
                                                                    }}
                                                                    disabled={loading}
                                                                >
                                                                    {currentPage + 1}
                                                                </span>
                                                            </li>
                                                        )}

                                                    <li
                                                        className={
                                                            !(
                                                                (currentPage + 1) * itemPerPage - itemPerPage >
                                                                totalData - 1
                                                            )
                                                                ? "paginate_button page-item next"
                                                                : "paginate_button page-item next disabled"
                                                        }
                                                    >
                                                        <span
                                                            className="page-link"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                                            disabled={loading}
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
};

export default Patient;
