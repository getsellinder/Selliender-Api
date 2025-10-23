import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const ViewPatient = () => {
    // const id = useParams()?.id;

    const location = useLocation();
    const { currencyDetails } = location.state || {};
    const [Loading, setLoading] = useState(true);

    const { id } = useParams();
    const token = isAutheticated();

    const [patientData, setPatientData] = useState({});
    const [SAW, setSAW] = useState([
        { volume: "", weight: "" },
        { volume: "", weight: "" },
        { volume: "", weight: "" },
        { volume: "", weight: "" },
        { volume: "", weight: "" },
    ]);
    const navigate = useNavigate();

    const getPatientData = async () => {
        setLoading(true)
        axios
            .get(`/api/patient/getOne/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                console.log(res.data.data);
                setPatientData(res.data.data);
                setLoading(false)

                if (res.data.data?.variants) {
                    setSAW((prev) => [...res.data.data?.variants]);
                }
            })

            .catch((err) => {
                setLoading(true)
            });
    };
    useEffect(() => {
        getPatientData();
    }, []);

    const onCancel = () => {
        navigate("/patients");
    };
    let count = 1;
    return (
        <div className=" main-content">
            <div className="  my-3 page-content">
                <div className="container-fluid">
                    {/* <!-- start page title --> */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box d-flex align-items-center justify-content-between">
                                <h4 className="mb-3">Patient Details</h4>

                                <button
                                    onClick={onCancel}
                                    type="button"
                                    className="mb-2 ml-2 btn btn-warning btn-cancel waves-effect waves-light mr-3"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <!-- end page title --> */}

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="table-responsive table-shoot">
                                        <table className="table  table-centered table-nowrap mb-2  table-sm">
                                            {Loading ? <p className="text-center p-2">Loading....</p> : <thead className="  text-center small-table-header">
                                                <tr>
                                                    <th>Patient Status</th>
                                                    <td
                                                        className={`badge m-1  ${patientData?.isVerified === true
                                                            ? "text-bg-success"
                                                            : "text-bg-danger"
                                                            }`}
                                                    >
                                                        {patientData?.isVerified === true ? "Verified" : "Not Verify"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Name</th>
                                                    <td>{patientData?.name}</td>
                                                </tr>
                                                <tr>
                                                    <th>Image</th>
                                                    <td>
                                                        {patientData?.avatar ?


                                                            <img
                                                                className="p-1"
                                                                src={patientData?.avatar?.url}
                                                                width="100"
                                                                alt="preview"

                                                            />

                                                            : <small>No image Uploaded !</small>}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Mobile Number</th>
                                                    <td>{patientData?.mobileNumber}</td>
                                                </tr>

                                                <tr>
                                                    <th>Email</th>
                                                    <td>{patientData?.email}</td>
                                                </tr>
                                                <tr>
                                                    <th>Age</th>
                                                    <td>{patientData?.age}</td>
                                                </tr>
                                                <tr>
                                                    <th>Gender</th>
                                                    <td>{patientData?.gender}</td>
                                                </tr>


                                                <tr>
                                                    <th>Weight</th>
                                                    <td>{patientData?.weight?.value}{patientData?.weight?.unit}</td>
                                                </tr>
                                                <tr>
                                                    <th>Hight</th>
                                                    <td>{patientData?.height?.value}{patientData?.height?.unit}</td>
                                                </tr>
                                                {patientData?.familyHistory && <tr>
                                                    <th>Family History</th>
                                                    <td>{patientData?.familyHistory}</td>
                                                </tr>}
                                                {patientData?.commonHealthComplaints && <tr>
                                                    <th>Common Health Complaints</th>
                                                    <td>{patientData?.commonHealthComplaints}</td>
                                                </tr>}
                                                {patientData?.personalHistory && <tr>
                                                    <th>Persona History</th>
                                                    <td>{patientData?.personalHistory}</td>
                                                </tr>}
                                                {patientData?.dailyRoutine && <tr>
                                                    <th>Daily Routine</th>
                                                    <td>{patientData?.dailyRoutine}</td>
                                                </tr>}



                                                <tr>
                                                    <th>Device Status</th>
                                                    <td
                                                        className={`badge m-1  ${patientData?.deviceAdded === true
                                                            ? "text-bg-success"
                                                            : "text-bg-danger"
                                                            }`}
                                                    >
                                                        {patientData?.deviceAdded === true ? "Added" : "Not Added"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Register ON</th>
                                                    <td className="">
                                                        {new Date(patientData.createdAt).toLocaleString(
                                                            "en-GB", // Use "en-GB" for UK English locale
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
                                                    </td></tr>

                                            </thead>}
                                            <tbody></tbody>
                                        </table>
                                        {/* <table className="table table-primary mt-3">
                                            <caption
                                                style={{ captionSide: "top" }}
                                                className="text-dark fw-bold"
                                            >
                                                Varients:
                                            </caption>
                                            <thead>
                                                <tr>
                                                    <th className="text-center">Variant Name</th>
                                                    <th className="text-center">Price</th>

                                                    <th className="text-center">VAT</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {SAW.map(
                                                    (r, i) =>
                                                        r.variant_Name !== "" && (
                                                            <tr key={i}>
                                                                <td className="text-center">
                                                                    {r?.variant_Name}
                                                                </td>
                                                                <td className="text-center">
                                                                    {currencyDetails?.CurrencySymbol}
                                                                    {r?.price}
                                                                </td>

                                                                <td className="text-center">
                                                                    {r?.gst_Id?.name + " " + r?.gst_Id?.tax + "%"}
                                                                </td>
                                                            </tr>
                                                        )
                                                )}
                                                {SAW.filter((e) => e.variant_Name !== "").length ===
                                                    0 && (
                                                        <tr>
                                                            <td colSpan={"6"} className="text-center">
                                                                No data available
                                                            </td>
                                                        </tr>
                                                    )}
                                            </tbody>
                                        </table> */}




















                                        {/* <div className="mb-2">
                      <table className="table table-secondary mt-3">
                        <caption
                          style={{ captionSide: "top" }}
                          className="text-dark fw-bold"
                        >
                          Patient Fabric:
                        </caption>
                        {patientData?.patient_Fabric?.length > 0 ? (
                          <>
                            <thead>
                              <tr>
                                <th className="text-center">S. No.</th>
                                <th className="text-center"> Name</th>
                                <th className="text-center"> Use For Part</th>
                              </tr>
                            </thead>
                            <tbody>
                              {patientData?.patient_Fabric?.map((r, i) => (
                                <tr key={i}>
                                  <td className="text-center">{++i}</td>
                                  <td className="text-center">
                                    {r?.fabric_Name}
                                  </td>
                                  <td className="text-center">{r?.for_Part}</td>
                                </tr>
                              ))}
                            </tbody>
                          </>
                        ) : (
                          <>
                            <h5>No Fabric Allotted for this patient!</h5>
                          </>
                        )}
                      </table>
                    </div> */}
                                        {/* <div className="mb-2">
                      <table className="table table-info mt-3">
                        <caption
                          style={{ captionSide: "top" }}
                          className="text-dark fw-bold"
                        >
                          Relevent Patient:
                        </caption>
                        {patientData?.relevent_patient?.length > 0 ? (
                          <>
                            <thead>
                              <tr>
                                <th className="text-center">S. No.</th>
                                <th className="text-center">Patient Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              {patientData?.relevent_patient?.map((r, i) => (
                                <tr key={i}>
                                  <td className="text-center">{count++}</td>
                                  <td className="text-center">{r?.name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </>
                        ) : (
                          <>
                            <h5>No relevent item for this patient !</h5>
                          </>
                        )}
                      </table>
                    </div> */}
                                    </div>

                                    {/* <!-- end table-responsive --> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- container-fluid --> */}
            </div>
        </div>
    );
};

export default ViewPatient;
