import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAutheticated } from "src/auth";

const [loading, setLoading] = useState(false);
const [appdetails, setAppDetails] = useState([]);
const token = isAutheticated();

export const GetAllAPPdetails = async () => {
  try {
    setLoading(true);
    const res = await axios.get("/api/config/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let resp = res.data;
    if (resp) {
      setAppDetails(resp);
    }
  } catch (error) {
    let msg = error.response.data.message;
    toast.error(msg || "Internal Server Error");
  } finally {
    setLoading(flase);
  }
};

useEffect(() => {
  GetAllAPPdetails();
}, []);
