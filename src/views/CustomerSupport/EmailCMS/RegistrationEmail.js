import { Typography } from "@material-ui/core";
import { Box, Button } from "@mui/material";

import React, { useEffect, useState } from "react";
import ReactrichTextEditor from "../../Content/reactrichTextEditor";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { isAutheticated } from "src/auth";
import { useNavigate, useNavigation } from "react-router-dom";

// const TOOLBAR_OPTIONS = [
//   [{ header: [1, 2, 3, 4, 5, 6, false] }],
//   [{ font: [] }],
//   [{ list: "ordered" }, { list: "bullet" }],
//   ["bold", "italic", "underline", "strike"],
//   [{ color: [] }, { background: [] }],
//   [{ align: [] }],
//   [{ script: "super" }, { script: "sub" }],
//   ["undo", "redo"],
// ];

export default function RegistrationEmail() {
  const [title, setTitle] = useState("Registration Email");
  const [welcomemsg, setWelcomeMsg] = useState("");
  const [welcomemsgforDescription, setWelcomeMsgForDescription] = useState("");

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [added, setAdded] = useState(false);
  const [olderContent, setOlderContent] = useState("");
  const [id, setId] = useState(null);

  const token = isAutheticated();

  const getTermsAndConditions = async () => {
    const response = await axios.get("/api/get-email-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      if (response.data?.registerEmaildata.length === 0) {
        return;
      }
      // console.log(response);
      //   setContent(response?.data?.registerEmaildata[0]?.termsAndContionContent);
      //   setOlderContent(
      //     response?.data?.registerEmaildata[0]?.termsAndContionContent
      //   );
      setSubject(response?.data?.registerEmaildata[0]?.subject);
      setDescription(response?.data?.registerEmaildata[0]?.description);
      setId(response?.data?.registerEmaildata[0]?._id);
    }
  };

  const addTermsandConditions = async () => {
    const response = await axios.post(
      "/api/register-email",
      { subject: subject, description: description },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status == 200) {
      swal({
        title: "Congratulations!!",
        text: response?.data?.message,
        icon: "success",
        button: "OK",
      });
    }
  };
  const handleCancelClick = () => {
    setAdded(!added);
  };

  const handleSaveClick = async () => {
    // if (id === null) {
    await addTermsandConditions();
    setAdded(true);
    // } else {
    //   await updateContent();
    //   setAdded(false);
    // }

    // Reload terms and conditions
    // await getTermsAndConditions();
  };
  useEffect(() => {
    // addTermsandConditions();
    getTermsAndConditions();
  }, [added]);
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveClick}
          style={{
            fontWeight: "bold",
            marginBottom: "1rem",
            textTransform: "capitalize",
            marginRight: "5px",
          }}
        >
          Save
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCancelClick}
          style={{
            fontWeight: "bold",
            marginBottom: "1rem",
            textTransform: "capitalize",
            marginRight: "5px",
          }}
        >
          Cancel
        </Button>
      </div>

      <Box style={{ background: "#FFFFFF", color: "black", padding: "1rem" }}>
        {/* <TextField
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
        /> */}
        <Typography
          style={{ margin: "0.5rem 0rem", fontWeight: "bold" }}
          variant="h6"
        >
          {" "}
          Email Confiramtion:{" "}
        </Typography>

        <div className="mb-3">
          <label htmlFor="welcomeMsg" className="form-label">
            Welcome Message*
          </label>

          <input
            type="text"
            className="form-control"
            style={{ width: "300px" }}
            id="welcomeMsg"
            placeholder="Eg: Welcome to "
            value={welcomemsg}
            onChange={(e) => setWelcomeMsg(e.target.value)}
          />
          <h6 style={{ fontWeight: "bold", marginTop: "1rem" }}>
            App Name : Audio Stream
          </h6>

          <label htmlFor="title" className="form-label">
            Subject*
          </label>

          <input
            type="text"
            className="form-control"
            id="title"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="welcomeMsgforDes" className="form-label">
            Welcome Message for Description*
          </label>

          <input
            type="text"
            className="form-control"
            style={{ width: "300px" }}
            id="welcomeMsgforDes"
            placeholder="Eg: Welcome to "
            value={welcomemsgforDescription}
            onChange={(e) => setWelcomeMsgForDescription(e.target.value)}
          />
          <label htmlFor="title" className="form-label">
            Description *
          </label>
          <textarea
            type="text"
            className="form-control"
            id="description"
            rows="10"
            cols="100"
            value={description}
            placeholder="your message..."
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
      </Box>
    </div>
  );
}
