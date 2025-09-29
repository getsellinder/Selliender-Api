import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const { createContext, useContext, useState, useEffect } = require("react");

const LinkedinContext = createContext();

export const LinkedinProvider = ({ children }) => {
  const token = isAutheticated();

  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [name, setName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [PageLimit, setPageLimit] = useState("");
  const [anaysicResult, setAllanaysicResult] = useState([]);
  const [linkedindelLoading, setLinkedinDelLoading] = useState(null);
  const [linkedinviewLoading, setLinkedinViewLoading] = useState(null);
  const [linkedinPlanData, setSingleLinkedinData] = useState([]);

  const [linkedinId, setLinkedinId] = useState(() => {
    return localStorage.getItem("linkedinId") || ""
  })
  const [page, setPage] = useState(1);


  const getAllAnalysis = async (
    page = 1,
    limit = PageLimit,
    name = name,

  ) => {
    try {
      setLinkedinLoading(true);
      const res = await axios.get("/api/linked/analysis", {
        params: {
          page,
          limit,
          name,

        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;

      setAllanaysicResult(result);
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
    } finally {
      setLinkedinLoading(false);
    }
  };


  const handleLinkedinProfileDetails = async (id) => {
    try {

      setLinkedinViewLoading(id);
      const res = await axios.get(`/api/linked/analysis/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSingleLinkedinData(res.data);
      localStorage.setItem("linkedinId", id)
      setLinkedinId(id)
      console.log("red.data", res.data)
    } catch (error) {
      const messsage = error?.response?.data?.message;
      toast.error(messsage || "Internal Server Error");
    } finally {
      setLinkedinViewLoading(null);
    }
  };

  // delete package

  const handleLinkedinDelete = async (id) => {
    try {
      setLinkedinDelLoading(id);
      const res = await axios.delete(`/api/linked/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await getAllAnalysis(page, PageLimit, name);
      toast.success(res.data.message);
    } catch (error) {
      console.log("handleLinkedinDelete.error",error)
      let message = error?.response?.data?.message;
      toast.error(message || "Internarl Server Error");
    } finally {
      setLinkedinDelLoading(null);
    }
  };
  useEffect(() => {

    getAllAnalysis(page, PageLimit, name);

  }, []);
  return (
    <LinkedinContext.Provider
      value={{
   
        getAllAnalysis,
        setName,
        setPackagePrice,
        setPageLimit,
        anaysicResult,
        handleLinkedinDelete,
        linkedindelLoading,
        linkedinLoading,
        handleLinkedinProfileDetails,
        linkedinPlanData, linkedinviewLoading
      }}
    >
      {children}
    </LinkedinContext.Provider>
  );
};

export const useLinkedin = () => useContext(LinkedinContext);
