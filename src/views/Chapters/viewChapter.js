import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const ViewChapter = () => {
  const location = useLocation();
  const { currencyDetails } = location.state || {};

  const { id } = useParams();
  const token = isAutheticated();
  const navigate = useNavigate();

  const [chapterData, setChapterData] = useState({});
  const [variants, setVariants] = useState([
    { volume: "", weight: "", variant_Name: "", price: "" },
    { volume: "", weight: "", variant_Name: "", price: "" },
    { volume: "", weight: "", variant_Name: "", price: "" },
    { volume: "", weight: "", variant_Name: "", price: "" },
    { volume: "", weight: "", variant_Name: "", price: "" },
  ]);

  const getChapterData = async () => {
    try {
      const res = await axios.get(`/api/chapter/getOne/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChapterData(res.data.data);
      if (res.data.data?.variants && res.data.data.variants.length > 0) {
        setVariants(res.data.data.variants);
      }
    } catch (err) {
      console.error("Error fetching chapter data:", err);
    }
  };

  useEffect(() => {
    getChapterData();
  }, []);

  const onCancel = () => {
    navigate("/chapters");
  };

  const isVideo = (url) => {
    return url && (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg"));
  };
  console.log("chapterData",chapterData)

  return (
    <div className="main-content">
      <div className="my-3 page-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-3">Chapter Details</h4>
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

          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive table-shoot">
                    <table className="table table-centered table-nowrap mb-0">
                      <thead className="thead-light">
                        <tr>
                          <th>Name</th>
                          <td>{chapterData?.name || "---"}</td>
                        </tr>
                        <tr>
                          <th>Subject</th>
                          <td>{chapterData?.subject?.subjectName || "---"}</td>
                        </tr>
                        <tr>
                          <th>Genre</th>
                          <td>{chapterData?.genre?.genreName || "---"}</td>
                        </tr>
                        <tr>
                          <th>Images</th>
                          <td>
                            {chapterData?.image && chapterData.image.length > 0 ? (
                              chapterData.image.map((e, i) => {
                                console.log("e",e.url)
                                return(
                                <div key={i}>
                                  <img
                                      className="p-1"
                                      src={e.url}
                                      width="100"
                                      alt="image preview"
                                    />
                                  {/* {isVideo(e.url) ? (
                                    <video
                                      className="p-1"
                                      src={e.url}
                                      width="100"
                                      controls
                                      alt="video preview"
                                    />
                                  ) : (
                                    <img
                                      className="p-1"
                                      src={e.url}
                                      width="100"
                                      alt="image preview"
                                    />
                                  )} */}
                                </div>
                              )
                              })
                            ) : (
                              "No Images Uploaded!"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>List Price</th>
                          <td>
                            {currencyDetails?.CurrencySymbol}
                            {/* ₹{chapterData?.master_price || "0"} */}
                         ₹{Number(chapterData?.master_price || "0").toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
                          </td>
                        </tr>
                        <tr>
                          <th>Sale Price</th>
                          <td>
                            {currencyDetails?.CurrencySymbol}
                            {/* {chapterData?.sale_price || "0"} */}
                            ₹{Number(chapterData?.sale_price || "0").toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
                          </td>
                        </tr>
                        {chapterData?.master_GST?.active && (
                          <tr>
                            <th>GST Rate</th>
                            <td>
                              {chapterData?.master_GST?.tax}%{" "}
                              {chapterData?.master_GST?.name}
                            </td>
                          </tr>
                        )}
                        {chapterData?.master_GST?.active && (
                          <tr>
                            <th>GST Price</th>
                            <td>
                              {currencyDetails?.CurrencySymbol}
                              {(
                                (Number(chapterData?.master_price) *
                                  Number(chapterData?.master_GST?.tax)) /
                                100
                              )?.toFixed(2) || "0"}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <th>
                            Total Price{" "}
                            {chapterData?.master_GST?.active ? "(with GST)" : ""}
                          </th>
                          <td>
                             ₹{currencyDetails?.CurrencySymbol}
                            {(
                              Number(chapterData?.master_price) +
                              (chapterData?.master_GST?.active
                                ? (Number(chapterData?.master_price) *
                                    Number(chapterData?.master_GST?.tax)) /
                                  100
                                : 0)
                                   ).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          
                          </td>
                        </tr>
                        <tr>
                          <th>Colors</th>
                          <td>
                            {chapterData?.colors && chapterData.colors.length > 0 ? (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "1rem",
                                }}
                              >
                                {chapterData.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      width: "4rem",
                                      height: "4rem",
                                      borderRadius: "10px",
                                      backgroundColor: color.colorCode,
                                      textAlign: "center",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                    }}
                                  >
                                    {color.colorName}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p>No colors available</p>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>Shipping Charge</th>
                          <td>
                            {currencyDetails?.CurrencySymbol}
                            ₹{Number(chapterData?.shipping_charge || "0").toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
                          </td>
                        </tr>
                        <tr>
                          <th>Description</th>
                          <td>{chapterData?.description || "---"}</td>
                        </tr>
                        <tr>
                          <th>Chapter Status</th>
                          <td
                            className={`badge m-1 ${
                              chapterData?.chapter_Status === "Active"
                                ? "text-bg-success"
                                : "text-bg-danger"
                            }`}
                          >
                            {chapterData?.chapter_Status || "---"}
                          </td>
                        </tr>
                        <tr>
                          <th>Special Instructions</th>
                          <td>
                            <p style={{ whiteSpace: "pre-line" }} className="m-0 p-0">
                              {chapterData?.special_instructions || "---"}
                            </p>
                          </td>
                        </tr>
                      </thead>
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

export default ViewChapter;