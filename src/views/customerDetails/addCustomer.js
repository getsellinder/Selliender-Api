import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  FormControl,
  Grid,
  FormHelperText,
  OutlinedInput,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios"; // Import axios for making HTTP requests
import { isAutheticated } from "src/auth";
import { Typography } from "@material-ui/core";
const styles = {
  formStyle: {
    fontWeight: "700",
    fontSize: "12px",
    fontFamily: "inter",
    marginBottom: "3px",
    marginLeft: "0",
  },
};
const AddCustomer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",

    // phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });
  const [id, setUserId] = useState("");
  const token = isAutheticated();

  const [loading, setLoading] = useState(false);

  // console.log(data);
  // const handleChange = (e) => {
  //   setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  // };

  const handerInputChanges = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // function handleAddressSubmit(e) {
  //   e.preventDefault();
  //   if (
  //     data.first_Name === "" ||
  //     data.last_Name === "" ||
  //     data.phone === null ||
  //     data.street === "" ||
  //     data.city === "" ||
  //     data.state === "" ||
  //     data.postalCode === "" ||
  //     data.country === ""
  //   ) {
  //     swal({
  //       title: "Warning",
  //       text: "Please fill All mendetory fields ",
  //       icon: "warning",
  //       button: "ok",
  //       dangerMode: true,
  //     });
  //     return;
  //   }
  //   setLoading(true);
  //   axios
  //     .post(
  //       `/api/shipping/address/admin/new/${id}`,
  //       {
  //         ...data,
  //       },

  //       {
  //         headers: {
  //           "Access-Control-Allow-Origin": "*",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       setLoading(false);
  //       // setSuccess((prev) => !prev);
  //       navigate("/customers-details");
  //       toast.success(res.data.message ? res.data.message : "Address Added!");
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       toast.error(
  //         error.response.data.message
  //           ? error.response.data.message
  //           : "Something went wrong!"
  //       );
  //     });
  // }

  // Generate password function
  const generatePassword = (name, email) => {
    const combinedStr = (name + email).toLowerCase(); // Convert to lowercase for consistency
    const specialChars = "@#*"; // Define the set of special characters
    const alphaChars = combinedStr.match(/[a-zA-Z]/g); // Filter out alphabetic characters
    const filteredChars = combinedStr.match(/[^\W_]/g); // Filter out non-alphanumeric characters
    let passwordChars = alphaChars.concat(filteredChars); // Combine alphabetic and filtered characters

    // Insert a random special character at a random position in the password characters array
    const specialChar = specialChars.charAt(
      Math.floor(Math.random() * specialChars.length)
    ); // Pick a random special character
    const randomIndex = Math.floor(Math.random() * (passwordChars.length + 1)); // Pick a random position to insert the special character
    passwordChars.splice(randomIndex, 0, specialChar); // Insert the special character at the random position

    passwordChars = passwordChars.sort(() => Math.random() - 0.5); // Shuffle the characters
    const password = passwordChars.join("").slice(0, 8); // Take the first 8 characters
    return password;
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("register users", user);
    console.log("type of pincode", typeof user.pincode);
    try {
      const response = await axios.post("/api/v1/create/customer", user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message);
      navigate("/customers-details");
      setUserId(response.data.userId);
    } catch (error) {
      console.log("Addeding customer details", error.response.data.message);
      toast.error(error.response.data.message);
    }
  };

  console.log(user);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#000" }}>
        Add Customer
      </h3>
      <Card sx={{ padding: "1rem", marginBottom: "1rem", width: "60%" }}>
        <form
          autoComplete="new-password"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3px",
          }}
          onSubmit={handleFormSubmit}
        >
          <TextField
            autoComplete="off"
            id="name"
            required
            type="text"
            sx={{ width: "100%" }}
            name="name"
            value={user.name}
            label="Name"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />
          <TextField
            autoComplete="new-password"
            id="email"
            type="eamil"
            sx={{ width: "100%" }}
            required
            name="email"
            value={user.email}
            label="Email"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />
          <br />
          <TextField
            autoComplete="new-password"
            id="password"
            type="text"
            sx={{ width: "100%" }}
            required
            name="password"
            value={user.password}
            label="password"
            variant="outlined"
            onChange={handerInputChanges}
          />

          {/* <TextField autoComplete="new-password"
            id="phone"
            type="text"
            sx={{  width: "100%" }}
            required
            name="phone"
            value={user.phone}
            label="Phone number"
            variant="outlined"
            onChange={handerInputChanges}
          /> */}
          <br />
          <TextField
            autoComplete="new-password"
            id="city"
            type="text"
            sx={{ width: "100%" }}
            required
            name="city"
            value={user.city}
            label="City"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />
          <TextField
            autoComplete="new-password"
            id="state"
            type="text"
            sx={{ width: "100%" }}
            required
            name="state"
            value={user.state}
            label="State"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />
          <TextField
            autoComplete="new-password"
            id="country"
            type="text"
            sx={{ width: "100%" }}
            required
            name="country"
            value={user.country}
            label="Country"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />
          <TextField
            autoComplete="new-password"
            id="pincode"
            type="text"
            sx={{ width: "100%" }}
            required
            name="pincode"
            value={user.pincode}
            label="Pincode"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />
          <TextField
            autoComplete="new-password"
            id="street"
            type="text"
            sx={{ width: "100%" }}
            required
            name="street"
            value={user.street}
            label="Street"
            variant="outlined"
            onChange={handerInputChanges}
          />
          <br />

          <Button
            variant="contained"
            disabled={id?.length > 0}
            type="submit"
            style={{ width: "100%" }}
          >
            Add user
          </Button>
          <br />
        </form>
      </Card>
    </div>
  );
};

export default AddCustomer;
