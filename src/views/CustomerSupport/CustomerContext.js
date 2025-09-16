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



  // chat finish
  const getSupportTicketsData = async (status, page = 1,limit,searchInput = "") => {
    try {
      // const url = status
      //   ? `/api/support/getAll/?page=${page}&limit=${limit}&status=${status}`
      //   : `/api/support/getAll/?page${page}&limit=${limit}`;

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

      const result = resp.data;

      if (result) {
        setSupportRequestsDataError("");
        // setStatus(status)
        setSupportRequestsData(result);
      }
    } catch (error) {
      const message = error.response.data.message;
      setSupportRequestsDataError(message);
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
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
