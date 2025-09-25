import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";

const { createContext, useContext, useState, useEffect } = require("react");

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const token = isAutheticated();
  const [getgst, setGetGst] = useState([]);
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [PageLimit, setPageLimit] = useState("");
  const [allPackages, setAllPackages] = useState([]);
  const [packagedelLoading, setPackageDelLoading] = useState(null);
  const [packageviewLoading, setPackageViewLoading] = useState(null);
  const [singlePlanData, setSinglePlanData] = useState([]);

  const [packageId,setPackageId]=useState(()=>{
    return localStorage.getItem("packageId") || ""
  })
  const [page, setPage] = useState(1);

  function getTaxes() {
    axios
      .get(`/api/tax/view_tax`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setGetGst(res.data);
      })
      .catch((err) => console.log("error gst", err));
  }

  const getAllpackages = async (
    page = page,
    limit = PageLimit,
    packagename = packageName,
    packageprice = packagePrice
  ) => {
    try {
      setPackageLoading(true);
      const res = await axios.get("/api/package/get/all", {
        params: {
          page,
          limit,
          packagename,
          packageprice,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = res.data;

      setAllPackages(result);
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
    } finally {
      setPackageLoading(false);
    }
  };


  const handleSinglePackage = async (id) => {
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

  // delete package

  const handlePackageDelete = async (id) => {
    try {
      setPackageDelLoading(id);
      const res =await axios.delete(`/api/package/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await getAllpackages(1, undefined, undefined, undefined);
      toast.success(res.data.message);
    } catch (error) {
      let message = error?.response?.data?.message;
      toast.error(message || "Internarl Server Error");
    } finally {
      setPackageDelLoading(null);
    }
  };
  useEffect(() => {
    getTaxes();
    getAllpackages(page, PageLimit, packageName, packagePrice);

  }, []);
  return (
    <PlanContext.Provider
      value={{
        getgst,
        getAllpackages,
        setPackageName,
        setPackagePrice,
        setPageLimit,
        allPackages,
        handlePackageDelete,
        packagedelLoading,
        packageLoading,
        handleSinglePackage,
        singlePlanData,packageviewLoading
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);
