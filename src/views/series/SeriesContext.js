import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";
import { useAdmin } from "./AdminContext";
import { useStepContext } from "@mui/material";

const SeriesContext = createContext();
export const SeriesProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [title, setTitles] = useState([]);
  const [genres, setGenres] = useState([]);
  const [season, setSeason] = useState([]);
  const [fetchseries, setFetchSeries] = useState([]);
  // getallserieswithepisode loading
  const [seriesLoading, setSeriesLoading] = useState(null);
  const { getAdminSubjectView, subjectViewId } = useAdmin();

  // getallserieswithepisode loading

  const [allepisode, setAllEpisode] = useState({
    data: [],
    totalPages: 1,
    currentPage: 1,
  });
  const [episodeDelete, setEpisodeDelte] = useState("");
  const [seriesDelete, setSeriesDelte] = useState("");
  const [singleSeries, setSingleSeries] = useState([]);
  const [gsubjectnames, setGsubjectnames] = useState([]);
  const [getallserieswithepisodeId, setGetallserieswithepisode] =
    useState(null);
  const [signleSeriesEpisodes, setSingleSeriesEpisodes] = useState([]);
  const [edloading, setEdloading] = useState(false);
  const [ederror, setEdError] = useState("");
  const [singleEpisode, setSingleEpisode] = useState([]);
  const [getsingleEpisodeLoading, setgetSingleEpisodeLoading] = useState(false);

  const [singleEpisodeId, setSingleEpisodeId] = useState(
    () => localStorage.getItem("singleEpisodeId") || null
  );
  const [singleSerieId, setSingleSeriesId] = useState(
    () => localStorage.getItem("singleSerieId") || null
  );
  const [singleSeriepisodeId, setSingleSeriesepisodeId] = useState(
    () => localStorage.getItem("singleSeriepisodeId") || null
  );
  const [updateshowdataId, setUpdateShowDataId] = useState(
    () => localStorage.getItem("updateshowdataId") || null
  );
  const [updateshowdata, setUpdateShowData] = useState([]);

  const [seriesIdlocal, setSeriesIdLocal] = useState(
    () => localStorage.getItem("seriesIdlocal") || null
  );

  // getSeasonseries
  const [seasonseries, setSeasonSeries] = useState([]);
  const [episodeFilter, setEpisodeFillter] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState(episodeFilter);
  const [filterLoading, setFilterLoading] = useState(false);
  useEffect(()=>{
    const handle=setTimeout(()=>{
      setDebouncedFilter(episodeFilter)
    },500)
    return ()=>{
      clearTimeout(handle)
    }
  },[episodeFilter])

  const [titleFilter, setTitleFilter] = useState({
    genreId: "",
    subgeneId: "",
    seriesId: "",
  });

  const token = isAutheticated();

  const handletitleFilter = (e) => {
    const { name, value } = e.target;
    setTitleFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // getGenres
  const getGenres = () => {
    axios
      .get(`/api/genre/getAllGenres`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setGenres(res?.data?.genres || []);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  // getSubjects
  const getSubjects = async () => {
    try {
      const response = await axios.get("/api/subject/getSubjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 && response?.data?.subjects?.length > 0) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      const errmsg = error?.response?.data?.message;
      // toast.error(errmsg);
      // swal({
      //   title: "Error",
      //   text: "Failed to fetch subjects. Please try again.",
      //   icon: "error",
      // });
    }
  };
  // gettitle
  const getTitles = async () => {
    try {
      const res = await axios.get("/api/get/all/titles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;
      console.log("data.gettitel", data);
      setTitles(data);
    } catch (error) {
      let message = error.response.data.message;
      console.log("message", message);
    }
  };

  const getSeasons = async (seriesId) => {
    console.log("seriesId", seriesId);
    try {
      const response = await axios.post(
        "/api/episode/seasons",
        { seriesId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response", response.data);
      setSeason(response.data);
      // if (response.status === 200 && response?.data?.length > 0) {
      //   setSeason(response.data);
      // }
    } catch (error) {
      console.error("Error fetching seasons:", error);
      const errmsg = error?.response?.data?.message;
      toast.error(errmsg);
      // swal({
      //   title: "Error",
      //   text: "Failed to fetch seasons. Please try again.",
      //   icon: "error",
      // });
    }
  };
  //   getseries

  const getseries = async (page = 1) => {
    try {
      setFilterLoading(true);
      const { genreId, subgeneId, seriesId } = titleFilter;
      const query = new URLSearchParams({
        page,
        ...(genreId && { genreId }),
        ...(subgeneId && { subgeneId }),
        ...(seriesId && { seriesId }),
      }).toString();
      const response = await axios.get(`/api/all/series?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response.data", response.data);
      setFetchSeries(response.data);
    } catch (error) {
      console.error("Error fetching getseries:", error);
      // swal({
      //   title: "Error",
      //   text: "Failed to fetch getseries. Please try again.",
      //   icon: "error",
      // });
    } finally {
      setFilterLoading(false);
    }
  };

  // delete Series

  const deleteseries = async (id) => {
    try {
      const response = await axios.delete(`/api/delete/series/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSeriesDelte(response.data);
      getseries();
      toast.success("Series Delated successfully");
    } catch (error) {
      if (response?.data?.error?.message) {
        toast.error(response.data.error.message);
      }
      console.log("deleteseries.error", error.message);
    }
  };
  // getbyidseries
  const getsignleSeries = async (id) => {
    try {
      const resp = await axios.get(`/api/get/series/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSingleSeries(resp.data);
    } catch (error) {
      console.log("getsignleSeries.error", error.message);
    }
  };

  // getbyidseries
  const getSeriesSeason = async () => {
    try {
      const resp = await axios.get(`/api/get/season/series`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSeasonSeries(resp.data);
    } catch (error) {
      // let message=error.response.data.message
      // toast.error(message)
      console.log("getsignleSeries.error", error.message);
    }
  };

  // getAllserieswithepisode
  // const {id}=useParams()

  const getallserieswithepisode = async (id) => {
    try {
      setSeriesLoading(id);
      setSingleSeriesepisodeId(id);
      setGetallserieswithepisode(id);
      const resp = await axios.get(`/api/get/series/episode/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSingleSeriesEpisodes(resp.data);
    } catch (error) {
      // toast.error(error?.response?.data?.message )
      console.log("getallserieswithepisode", error.message);
    } finally {
      setSeriesLoading(null);
    }
  };
  useEffect(()=>{
      getallepisode();
  },[debouncedFilter])

  const getallepisode = async (page = 1) => {
    console.log("episodeFilter", episodeFilter);
    try {
      let response;
      if (debouncedFilter) {
        response = await axios.get(
          `/api/all/episodes?page=${page}&title=${encodeURIComponent(
            debouncedFilter
          )}`,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.get(`/api/all/episodes?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setAllEpisode(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      // swal({
      //   title: "Error",
      //   text: "Failed to fetch getallepisode. Please try again.",
      //   icon: "error",
      // });
    }
  };
  const handlePageChange = (newpage) => {
    getallepisode(newpage);
  };
  const hadleSeriesChange = (newPage) => {
    getseries(newPage);
  };

  // delete episode
  const { id: serieId } = useParams();

  const deleteEpisode = async (id) => {
    console.log("serieId", serieId);
    try {
      const res = await axios.delete(`/api/delete/episode/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("res.delete", res.data);

      getallepisode();
      await getallserieswithepisode(getallserieswithepisodeId);
      getAdminSubjectView(subjectViewId);
      toast.success(res.data.message);
    } catch (error) {
      if (error?.response?.data?.message) {
        setEdError(error?.response?.data?.message);
      }
    } finally {
      setEdloading(false);
    }
  };

  const getsingleEpisode = async (id) => {
 
    try {
      setgetSingleEpisodeLoading(true);
      const resp = await axios.get(`/api/episode/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // setSingleEpisodeId(id)
      setSingleEpisode(resp.data);
      setUpdateShowData(resp.data);
  
    } catch (error) {
      console.log("error", error.message);
    } finally {
      setgetSingleEpisodeLoading(false);
    }
  };

  // getsubjectbygenrename

  const getsubjectbygenrename = async (genrename) => {
    
    try {
      const res = await axios.get(
        `/api/subject/getSubjects/by/${genrename.genreId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data) {
        setGsubjectnames(res.data);
      }

      console.log("res", res.data);
    } catch (error) {
      console.log("getsubjectbygenrename", error?.response?.data?.message);
      toast.error(error?.response?.data?.message);
    }
  };

  // useEffect(() => {
  //   if (singleSerieId) {
  //     // localStorage.setItem("singleEpisodeId", singleEpisodeId);
  //     localStorage.setItem("singleSerieId", singleSerieId);
  //   } else {
  //     // localStorage.removeItem("singleEpisodeId");
  //     localStorage.removeItem("singleSerieId");
  //   }
  // }, [singleSerieId]);
  const { id } = useParams();

  useEffect(() => {
    getGenres();
    getSubjects();
    getseries();
    getallepisode();
    getSeriesSeason();
    getTitles();

  }, []);

  // checking this  now
  useEffect(() => {
    if (singleEpisodeId) {
      getsingleEpisode(singleEpisodeId);
    }
  }, [singleEpisodeId]);

  useEffect(() => {
    if (singleSeriepisodeId) {
      getallserieswithepisode(singleSeriepisodeId);
    }
  }, [singleSeriepisodeId]);


  return (
    <SeriesContext.Provider
      value={{
        token,
        subjects,
        genres,
        fetchseries,
        allepisode,
        deleteEpisode,
        edloading,
        ederror,
        handlePageChange,
        hadleSeriesChange,
        singleEpisode,
        getsingleEpisode,
        setSingleEpisodeId,
        getSeasons,
        season,
        setTitleFilter,
        deleteseries,
        getsignleSeries,
        singleSeries,
        setSingleSeriesId,
        getseries,
        signleSeriesEpisodes,
        getallserieswithepisode,
        setSingleSeriesepisodeId,
        setUpdateShowDataId,
        updateshowdataId,
        setSeriesIdLocal,
        seriesIdlocal,
        updateshowdata,
        singleSeriepisodeId,
        seriesLoading,
        getsingleEpisodeLoading,
        getallepisode,
        seasonseries,
        getsubjectbygenrename,
        gsubjectnames,
        getSubjects,
        title,
        handletitleFilter,
        titleFilter,
        filterLoading,
        episodeFilter,
        setEpisodeFillter,
        setSingleSeriesEpisodes,
      }}
    >
      {children}
    </SeriesContext.Provider>
  );
};

export const useSeries = () => useContext(SeriesContext);
