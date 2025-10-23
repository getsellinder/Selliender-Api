import React, { useEffect, useState } from "react";

import swal from "sweetalert";
import ClipLoader from "react-spinners/ClipLoader";
import { Link } from "react-router-dom";
import axios from "axios";
import { isAutheticated } from "src/auth";
import { object } from "prop-types";

function Web_Images() {
  const [loading, setLoading] = useState(false);
  const [RegisterImglogo, setRegisterImglogo] = useState("");
  const [LoginImg, setLoginImg] = useState("");
  const [ShopImg, setShopImg] = useState("");
  const [display, setDisplay] = useState(true);
  const token = isAutheticated();

  // urlcreated images

  const [RegisterImglogoUrl, setRegisterImglogoUrl] = useState("");
  const [LoginImgUrl, setLoginImgUrl] = useState("");
  const [ShopImgUrl, setShopImgUrl] = useState("");

  useEffect(() => {
    // async function getConfiguration() {
    //   const configDetails = await axios.get(`/api/config`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });

    //   console.log("configDetails.data.result", configDetails.data.result);
    //   configDetails.data.result.map((item) => {
    //     setRegisterImglogo(item?.logo[0]?.Adminlogo);
    //     setLoginImg(item?.logo[0]?.Footerlogo);
    //     setShopImg(item?.logo[0]?.Adminlogo);
    //   });
    // }
    const getRegisterImage = async () => {
      const response = await axios.get("/api/registerImage/getImage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setRegisterImglogo(response?.data?.image[0]?.image?.secure_url);
      }
    };
    const getLoginImage = async () => {
      const response = await axios.get("/api/loginImage/getImage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setLoginImg(response?.data?.image[0]?.image?.secure_url);
      }
    };
    const getShopImage = async () => {
      const response = await axios.get("/api/shopImage/getImage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setShopImg(response?.data?.image[0]?.image?.secure_url);
      }
    };

    getRegisterImage();
    getLoginImage();
    getShopImage();
  }, []);
  // async function handelChange(e) {
  //   setDisplay(false);
  //   console.log(e.target.name === "Web_Images htmlFor Website RegisterImg(148 x 48 px)");
  //   if (e.target.name === "Web_Images htmlFor Website RegisterImg(148 x 48 px)") {
  //     console.log(e.target.files[0]);
  //     setRegisterImglogo(e.target.files[0]);
  //   } else if (e.target.name === "Web_Images htmlFor Website Footer(148 x 48 px)") {
  //     setLoginImg(e.target.files[0]);
  //   } else if (e.target.name === "Web_Images htmlFor Admin RegisterImg(148 x 48 px)") {
  //     setShopImg(e.target.files[0]);
  //   }
  // }
  const [Rloading, setRLoading] = useState(false);
  async function handeRegister(e) {
    e.preventDefault();
    if (typeof RegisterImglogo !== "object" || RegisterImglogo === null) {
      swal({
        title: "Warning",
        text: "Please select file",
        icon: "warning",
        button: "Ok",
        dangerMode: true,
      });
      return;
    }

    const formdata = new FormData();
    formdata.append("RegisterImglogo", RegisterImglogo);
    setRLoading(true);
    await axios
      .post(`/api/registerImage/addmodify/`, formdata, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/formdata",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        setRLoading(false);
        swal("Success!", res.data.message);
      })
      .catch((error) => {
        setRLoading(false);
      });
  }
  const [Lloading, setLLoading] = useState(false);

  async function handeLogin(e) {
    e.preventDefault();
    if (typeof LoginImg !== "object" || LoginImg === null) {
      swal({
        title: "Warning",
        text: "Please select file",
        icon: "warning",
        button: "Ok",
        dangerMode: true,
      });
      return;
    }

    const formdata = new FormData();
    formdata.append("LoginImg", LoginImg);
    setLLoading(true);

    await axios
      .post(`/api/loginImage/addmodify/`, formdata, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/formdata",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        setLLoading(false);
        swal("Success!", res.data.message);
      })
      .catch((error) => {
        setLLoading(false);
      });
  }

  const [Shoploading, setShoploading] = useState(false);
  async function handeShopImage(e) {
    e.preventDefault();
    if (typeof ShopImg !== "object" || ShopImg === null) {
      swal({
        title: "Warning",
        text: "Please select file",
        icon: "warning",
        button: "Ok",
        dangerMode: true,
      });
      return;
    }

    const formdata = new FormData();
    formdata.append("ShopImg", ShopImg);
    setShoploading(true);
    await axios
      .post(`/api/shopImage/addmodify/`, formdata, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/formdata",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        setShoploading(false);
        swal("Success!", res.data.message);
      })
      .catch((error) => {
        setShoploading(false);
      });
  }

  //   async function handelSubmit() {
  //     setLoading(true);

  //     const formdata = new FormData();
  //     formdata.append("RegisterImglogo", RegisterImglogo);
  //     formdata.append("LoginImg", LoginImg);
  //     formdata.append("ShopImg", ShopImg);

  //     await axios
  //       .post(`/api/config/logo`, formdata, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/formdata",
  //           "Access-Control-Allow-Origin": "*",
  //         },
  //       })
  //       .then((res) => {
  //         setLoading(false);
  //         swal("Success!", res.data.message, res.data.status);
  //       })
  //       .catch((error) => {
  //         setLoading(false);
  //       });
  //   }

  return (
    <div>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-12 col-lg-6 col-xl-6">
                        <h1 className="text-left head-small">Website Images</h1>

                        <form>
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="form-group">
                                <>
                                  <label
                                    htmlFor="basicpill-phoneno-input"
                                    className="label-100 mt-3"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    Register Image for Website(800 x 600 pixels){" "}
                                    <br />
                                  </label>
                                  <div>
                                    <input
                                      type="file"
                                      name="Register_Images htmlFor Website RegisterImg(800 x 600 pixels)"
                                      onChange={(e) => {
                                        setRegisterImglogo(e.target.files[0]);
                                        if (
                                          e.target.files &&
                                          e.target.files[0]
                                        ) {
                                          setRegisterImglogoUrl({
                                            image: URL.createObjectURL(
                                              e.target.files[0]
                                            ),
                                          });
                                        }
                                      }}
                                      className="form-control input-field mb-3 col-md-6 d-inline-block"
                                      id="basicpill-phoneno-input"
                                    />
                                    <button
                                      className="mx-2  mb-1 btn btn-success"
                                      onClick={(e) => handeRegister(e)}
                                    >
                                      <ClipLoader
                                        loading={Rloading}
                                        size={18}
                                      />
                                      {!Rloading && "New"}
                                    </button>

                                    {display ? (
                                      <img
                                        className="ms-1"
                                        style={{ width: "100px" }}
                                        src={
                                          RegisterImglogoUrl.image
                                            ? RegisterImglogoUrl.image
                                            : RegisterImglogo
                                        }
                                        alt=""
                                      />
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                  <label
                                    htmlFor="basicpill-phoneno-input"
                                    className="label-100 mt-3"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    {/* Web_Images htmlFor Website Footer(148 x 48 px) */}
                                    Login logo for Website(800 x 600 pixels){" "}
                                    <br />
                                  </label>
                                  <br />
                                  <input
                                    type="file"
                                    name="Web_Images htmlFor Website Footer(800 x 600 px)"
                                    onChange={(e) => {
                                      setLoginImg(e.target.files[0]);

                                      if (e.target.files && e.target.files[0]) {
                                        setLoginImgUrl({
                                          image: URL.createObjectURL(
                                            e.target.files[0]
                                          ),
                                        });
                                      }
                                    }}
                                    className="form-control input-field mt-1 col-md-6 d-inline-block"
                                    id="basicpill-phoneno-input"
                                  />
                                  <button
                                    className="mx-2 btn mb-1 btn-success"
                                    onClick={(e) => handeLogin(e)}
                                  >
                                    <ClipLoader loading={Lloading} size={18} />
                                    {!Lloading && "New"}
                                  </button>{" "}
                                  {display ? (
                                    <img
                                      style={{ width: "100px" }}
                                      src={
                                        LoginImgUrl.image
                                          ? LoginImgUrl.image
                                          : LoginImg
                                      }
                                      alt=""
                                    />
                                  ) : (
                                    ""
                                  )}
                                  <label
                                    htmlFor="basicpill-phoneno-input"
                                    className="label-100 mt-2 row ms-1"
                                    style={{ fontWeight: "bold" }}
                                  >
                                    {/* Web_Images htmlFor Admin RegisterImg(148 x 48 px) */}
                                    Shop Page Image for website(1200 x 800
                                    pixels) <br />
                                  </label>
                                  <input
                                    type="file"
                                    name="Web_Images htmlFor Admin RegisterImg(1200 x 800 px)"
                                    onChange={(e) => {
                                      setShopImg(e.target.files[0]);

                                      if (e.target.files && e.target.files[0]) {
                                        setShopImgUrl({
                                          image: URL.createObjectURL(
                                            e.target.files[0]
                                          ),
                                        });
                                      }
                                    }}
                                    className="form-control input-field col-md-6 d-inline-block"
                                    id="basicpill-phoneno-input"
                                  />
                                  <button
                                    className="mx-2 btn btn-login btn-success mb-1"
                                    onClick={(e) => handeShopImage(e)}
                                  >
                                    <ClipLoader
                                      loading={Shoploading}
                                      size={18}
                                    />
                                    {!Shoploading && "New"}{" "}
                                  </button>{" "}
                                  {display ? (
                                    <img
                                      style={{ width: "100px" }}
                                      src={
                                        ShopImgUrl.image
                                          ? ShopImgUrl.image
                                          : ShopImg
                                      }
                                      alt=""
                                    />
                                  ) : (
                                    ""
                                  )}
                                </>
                              </div>
                            </div>
                          </div>
                          {/* <div className="row">
                            <div className="col-lg-12">
                              <div className="form-group text-left">
                                <button
                                  type="button"
                                  disabled={
                                    ShopImg === "" ||
                                    LoginImg === "" ||
                                    RegisterImglogo === ""
                                  }
                                  onClick={handelSubmit}
                                  className="btn btn-success btn-login waves-effect waves-light mr-3 pt-2 pb-2 pr-4 pl-4"
                                >
                                  <ClipLoader loading={loading} size={18} />
                                  {!loading && "Save"}
                                </button>
                              </div>
                            </div>
                          </div> */}
                        </form>
                      </div>
                    </div>

                    {/* <!-- end table-responsive --> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- container-fluid --> */}
        </div>
        {/* <!-- End Page-content --> */}
      </div>
    </div>
  );
}

export default Web_Images;
