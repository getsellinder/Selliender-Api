import axios from "axios";

import toast from "react-hot-toast";
import { isAutheticated } from "src/auth";
import { getUser } from "src/loginUserdetails";


const { createContext, useContext, useState, useEffect } = require("react");

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const token = isAutheticated();
  const user = getUser();
  const userId = user?.id;
  console.log("userId",userId)
  const [totalPage, setTotalPages] = useState();
  const [SupportRequestsData, setSupportRequestsData] = useState([]);
  const [SupportRequestsDataError, setSupportRequestsDataError] = useState("");
  const [closeRequestTicketId, setCloseRequestTicketId] = useState(null);
  const [searchInput,setSearchInput]=useState("")
  // chat
  const [chatLoading, setChatLoading] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [ticketDetails, setTicketDetails] = useState([]);
  const [chatErorr, setChatError] = useState("");

  // delete state
  const [deleteLoading, setDeleteLoading] = useState(null);
const [loading, setLoading] = useState(false);
const [cloading, setCLoading] = useState(false);
const [appdetails, setAppDetails] = useState([]);




   const GetAllAPPdetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/config/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let resp = res.data.result;
      if (resp) {
        setAppDetails(resp);
      }
    } catch (error) {
      let msg = error.response.data.message;
      toast.error(msg || "Internal Server Error");
    } finally {
      setLoading(false);
    }
  };

// get contact us customers
  const getcontacts = async (
    searchName = name,
    page = currentPage,
    limit = itemPerPage
  ) => {
    axios
      .get(`/api/contact/request/getAll/`, {
        params: {
          limit: limit,
          page: page,
          name: searchName,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSupportRequestsData(res?.data);
        setTotalPages(res.data.total_pages);
        setCLoading(false);
      })
      .catch((error) => {
        swal({
          title: error,
          text: "please login to access the resource or refresh the page  ",
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        setCLoading(false);
      });
  };

  // chat finish
  const getSupportTicketsData = async (status, page = 1,limit,searchInput = "") => {
    try {
    

       let url = `/api/support/getAll/?page=${page}&limit=${limit}`;
       if(status){
        url += `&status=${status}`;
       }
         if (searchInput) {
      url += `&searchInput=${encodeURIComponent(searchInput)}`;
    }


      let resp = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = resp?.data;

      if (result) {
        setSupportRequestsDataError("");
        // setStatus(status)
        setSupportRequestsData(result);
      }
    } catch (error) {
      const message = error?.response?.data?.message;
      setSupportRequestsDataError(message || "Internal Server Error");
    }
  };

  // close request

  const CloseRequest = async (ticketId, statusData) => {
    try {
      setCloseRequestTicketId(ticketId);
      const closeRequest = await axios.put(
        `/api/support/user/update/status/${ticketId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const succes = closeRequest.data.message;
      toast.success(succes);
      getSupportTicketsData(statusData);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong!";
      toast.error(msg);
    } finally {
      setCloseRequestTicketId(null);
    }
  };

  //   delete request
  const DeleteRequest = async (id, statusData) => {
    try {
      setDeleteLoading(id);
      const closeRequest = await axios.delete(
        `/api/support/delete/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const succes = closeRequest.data.message;

      getSupportTicketsData(statusData);
      toast.success(succes);
    } catch (error) {
      const msg = error.response.data.message;
      toast.error(msg);
    } finally {
      setDeleteLoading(null);
    }
  };

  // getmessages
  const getMessagesChat = async (ticketId) => {
    console.log("ticketId", typeof ticketId);
    try {
      setChatLoading(ticketId);
      const resp = await axios.get(`/api/user/message/get/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const ticketDetails = resp.data;
      const result = resp.data.messages;
      setChatError("");

      setChatData(result);
      setTicketDetails(ticketDetails);
    } catch (error) {
      const msg = error.response.data.message;
      // toast.error(msg);
      setChatError(msg);
    } finally {
      setChatLoading(null);
    }
  };

  useEffect(() => {
    getSupportTicketsData("OPEN");
  }, []);

  useEffect(()=>{
    GetAllAPPdetails()
let currentPage=1
    getcontacts("",currentPage,"")
  },[])
  

  return (
    <CustomerContext.Provider
      value={{
        getSupportTicketsData,
        SupportRequestsData,
        setSupportRequestsData,
        SupportRequestsDataError,
        setSupportRequestsDataError,
        CloseRequest,
        getMessagesChat,
        chatData,
        chatLoading,
        userId,
        ticketDetails,
        DeleteRequest,
        deleteLoading,
        closeRequestTicketId,
        chatErorr,
        setChatData,
        setSearchInput,
        searchInput,
        appdetails,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
