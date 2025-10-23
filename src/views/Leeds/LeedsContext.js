import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const { createContext, useContext, useState, useEffect } = require("react");

const LeedsContext = createContext();

export const LeedsProvider = ({ children }) => {
  const token = isAutheticated();
  const [packageLoading, setPackageLoading] = useState(false);


  const [PageLimit, setPageLimit] = useState("");
  const [allLeeds, setAllLeeds] = useState([]);
  const [packagedelLoading, setPackageDelLoading] = useState(null);
  const [packageviewLoading, setPackageViewLoading] = useState(null);
  const [singlePlanData, setSinglePlanData] = useState([]);

  const [packageId,setPackageId]=useState(()=>{
    return localStorage.getItem("packageId") || ""
  })
  const [page, setPage] = useState(1);



  const getAllLeeds = async (
    page = 1,
    limit = PageLimit,
    name = name,

  ) => {
    try {
      setPackageLoading(true);
      const res = await axios.get("/api/contact/request/getAll/contact/sales", {
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

      setAllLeeds(result);
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
    } finally {
      setPackageLoading(false);
    }
  };


  const handleSingleLeed = async (id) => {
    try {
    
      setPackageViewLoading(id);
      const res = await axios.get(`/api/package/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSinglePlanData(res.data);
      localStorage.setItem("packageId",id)
      setPackageId(id)
      console.log("red.data",res.data)
    } catch (error) {
      const messsage = error?.response?.data?.message;
      toast.error(messsage || "Internal Server Error");
    } finally {
      setPackageViewLoading(null);
    }
  };

  useEffect(() => {

    getAllLeeds(page, PageLimit, name);

  }, []);
  return (
    <LeedsContext.Provider
      value={{
   
        getAllLeeds,
      
    
        setPageLimit,
        allLeeds,
     
        packagedelLoading,
        packageLoading,
        handleSingleLeed,
        singlePlanData,packageviewLoading
      }}
    >
      {children}
    </LeedsContext.Provider>
  );
};

export const useLeeds = () => useContext(LeedsContext);
