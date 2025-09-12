import axios from "axios";
import { useSeries } from "../series/SeriesContext";
import { isAutheticated } from "src/auth";
import toast from "react-hot-toast";

const { createContext, useContext, useState, useEffect } = require("react");

const TrendingContext = createContext();

export const TrendingPrivoder = ({ children }) => {
  const token = isAutheticated();

  console.log("token", token);
  // getAlltreadings
  const [AllTreadings, setAllTreadings] = useState([]);
  const [AllTreadingsLoading, setAllTreadingsLoading] = useState(false);
  const [AllTreadingsError, setAllTreadingsError] = useState("");
  const [isTreading, setIsTrending] = useState("true");
  const [titleData,setTitleData]=useState("")

  // getByIdtreading
  const [singleTrending, setSingleTrending] = useState([]);
  const [singleTrendingLoading, setsingleTrendingLoading] = useState(false);

  const [TreadingId, setTreadingId] = useState(() => {
    return localStorage.getItem("TreadingId") || null;
  });
  //   deleted treading
  const [treadingdelLoading, setTreadingDelLoading] = useState(null);
  console.log("titleData",titleData)

  const getAlltreadings = async (isTreading,title = "") => {
    try {
      setAllTreadingsLoading(true);
    
      

      const resp = await axios.get(
        `/api/get/trading?isTreading=${isTreading}&title=${title}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = resp.data;
           
      if (!data || data.length === 0) {
        setAllTreadings([]);
      } else {
        setAllTreadingsError("");
        //  setTitleData("");
        setAllTreadings(data);
      }
    } catch (error) {
      let message = error.response.data.message;
      setAllTreadingsError(message);
      // toast.error(message);
      console.log("message", message);
    } finally {
      setAllTreadingsLoading(false);
 
      // setAllTreadingsError("")
    }
  };
  const getSingletreadings = async (id) => {
    try {
      const resp = await axios.get(`/api/get/trading/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem("TreadingId", id);
      // setTreadingId(id);
      const data = resp.data;
      setSingleTrending(data);
      return data;
    } catch (error) {
      let message = error.response?.data?.message;
      console.log("message", message);
      throw error;
    } finally {
      setAllTreadingsLoading(false);
    }
  };
  const handleTrendingDel = async (id) => {
    try {
      setTreadingDelLoading(id);
      const resp = await axios.delete(`/api/delete/trading/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = resp.data.message;
      getAlltreadings(isTreading);
      toast.success(data);
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
    } finally {
      setTreadingDelLoading(null);
    }
  };
  const MakeTreading = async (id, isTreading) => {
    console.log("isTreading.MakeTreading", isTreading);
    try {
      const resp = await axios.put(
        `/api/make/trading/${id}`,
        { isTreading },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = resp.data.message;
      getAlltreadings(isTreading);
      console.log("MakeTreading", data);
      toast.success(data);
    } catch (error) {
      const message = error.response.data.message;
      toast.error(message);
    }
  };
  useEffect(() => {
    getAlltreadings(isTreading);
  }, []);
  useEffect(() => {
    if (TreadingId) {
      getSingletreadings(TreadingId);
    }
  }, [TreadingId]);

  return (
    <TrendingContext.Provider
      value={{
        AllTreadings,
        AllTreadingsLoading,
        getAlltreadings,
        setIsTrending,
        isTreading,
        handleTrendingDel,
        treadingdelLoading,
        MakeTreading,
        isTreading,
        setIsTrending,
        singleTrending,
        getSingletreadings,
        AllTreadingsError,
        setAllTreadingsLoading,
        setTitleData,
        titleData,
        
      }}
    >
      {children}
    </TrendingContext.Provider>
  );
};

export const useTrending = () => useContext(TrendingContext);
