import axios from "axios";
import toast from "react-hot-toast";
import { isAutheticated } from "src/auth";

const { createContext, useContext, useState, useEffect } = require("react");

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const token = isAutheticated();
  const [getgst, setGetGst] = useState([]);
  function getTaxes() {
    axios
      .get(`/api/tax/view_tax`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // setLoading(false);
        // console.log(res.data);
        setGetGst(res.data);
      })
      .catch((err) => console.log("error gst", err));
  }

  useEffect(() => {
    getTaxes();
  }, []);
  return (
    <PlanContext.Provider value={{ getgst }}>{children}</PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);
