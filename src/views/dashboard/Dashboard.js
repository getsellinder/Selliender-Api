import React, { lazy } from "react";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import { isAutheticated } from "../../auth.js";

const WidgetsDropdown = lazy(() => import("../widgets/WidgetsDropdown.js"));

const Dashboard = () => {
  //1 st
  const [users, setUsers] = useState([]);
  const token = isAutheticated();

  const getAllUsers = async () => {
    let res = await axios.get(`/api/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("users", res.data);
    setUsers(res.data.users);
  };
  //2nd
  const [category, setCategory] = useState([]);
  const getAllCategory = async () => {
    let res = await axios.get(`/api/category/getCategories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("categories", res.data);
    setCategory(res?.data?.categories);
  };


  const [genre, setGenre] = useState([]);
  const getAllGenre = async () => {
    let res = await axios.get(`api/genre/getGenres`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("categories", res.data);
    setGenre(res?.data?.genres);
  };
  //3rd
  const [product, setProduct] = useState([]);
  const getAllProduct = async () => {
    let res = await axios.get(`/api/product/getAll/user/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("product", res.data);
    setProduct(res?.data?.product);
  };
  // 3rd
  const [Requests, setRequests] = useState([]);
  const getAllRequests = async () => {
    let res = await axios.get(`/api/contact/request/getAll/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("contactRequest", res.data);
    setRequests(res.data.contactRequest);
  };

  // //3 requiment
  // const [requirement, setRequirement] = useState([])
  // // console.log(token)
  // const getRequirement = useCallback(async () => {
  //   let res = await axios.get(
  //     `/api/requirement/getAll`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );

  //   setRequirement(res.data.Requirement)

  // }, [token]);
  // //4 news
  // const [news, setNews] = useState([])

  // const getNews = useCallback(async () => {
  //   let res = await axios.get(
  //     `/api/news/getAll`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );

  //   setNews(res.data.news)

  // }, [token]);
  // //5 offers
  // const [offer, setOffer] = useState([])

  // const getOffer = useCallback(async () => {
  //   let res = await axios.get(
  //     `/api/offer/getAll`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );
  //   // console.log(res.data)
  //   setOffer(res.data.offer)

  // }, [token]);
  // //6 event
  // const [event, setEvent] = useState([])
  // const getEvent = useCallback(async () => {
  //   let res = await axios.get(
  //     `/api/event/getAll`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );
  //   // console.log(res.data)
  //   setEvent(res.data.Event)

  // }, [token]);
  useEffect(() => {
    getAllUsers();
    getAllCategory();
    getAllProduct();
    getAllRequests();
    getAllGenre();
  }, []);
  return (
    <>
      <WidgetsDropdown
        // users={users}
        genre={genre}
        // category={category}
        // product={product}
        // Requests={Requests}
      />
    </>
  );
};

export default Dashboard;
