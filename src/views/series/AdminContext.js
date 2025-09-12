import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { isAutheticated } from "src/auth";
import swal from "sweetalert";
import { useSeries } from "./SeriesContext";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // const {getSubjects}=useSeries()
  const [subjectView, setSubjectView] = useState([]);

  const [subjectViewId, setSubjectViewId] = useState(
    () => localStorage.getItem("subjectViewId") || null
  );
  const [genres, setGenres] = useState([]);
  const [loadingsubject, setLoadingSubject] = useState(false);
  const [GenreSubjectModel, setGenreSubjectModel] = useState([]);
  const [GenreSubjectModelError, setGenreSubjectModelError] = useState(null);
  const [subjectloading, setSubjectLoading] = useState(false);
  const [GenreSubjectModelLoading, setGenreSubjectModelLoading] =
    useState(false);
  const [viewsubgenre, setViewSubGenre] = useState(false);
  const [subdelloading, setSubdelloading] = useState(null);
  // update
  const [subjectUpdateloading, setSubjectUpdateLoading] = useState(false);
  const [editsubgenre, setEditSubGenre] = useState(false);
  const [subjecDataEdit, setSubjectDataEdit] = useState(() => {
    return JSON.parse(localStorage.getItem("subjecDataEdit"));
  });
  const [generId, setgenareId] = useState(
    () => localStorage.getItem("generId") || null
  );
  const [singleSubjectData, setSingleSubjectData] = useState({});
    const [subjects, setSubjects] = useState([]);

  console.log("setSubjectUpdate", singleSubjectData.subjectName);
  const [subjectupdate, setSubjectUpdate] = useState({
    subjectName: "",
    subjectImage: "",
    genreId: "",
  });
  useEffect(() => {
    if (singleSubjectData && Object.keys(singleSubjectData).length > 0) {
      setSubjectUpdate({
        subjectName: singleSubjectData.subjectName || "",
        subjectImage: singleSubjectData?.subjectImage?.secure_url || "",
        genreId: singleSubjectData?.genrename || "",
      });
    }
  }, [singleSubjectData]);
  const [subjectId, setSubjectId] = useState(() => {
    return localStorage.getItem("subjectId") || null;
  });

  const [subjectImage, setsubjectImage] = useState("");

  const [subjectViewError, setSubjectViewError] = useState("");

  const [loading, setLoading] = useState(true);
  const [genreIdlocal, setGenreIdlocal] = useState(() => {
    return localStorage.getItem("genreIdlocal") || null;
  });

  const token = isAutheticated();

  const handleFileChangeSubect = (e) => {
    const files = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (files && allowedTypes.includes(files.type)) {
      setSubjectUpdate((prev) => ({
        ...prev,
        subjectImage: files,
      }));
    } else {
      // Optional: show error message if file type is invalid
      alert("Only JPG, JPEG, and PNG files are allowed.");
    }
  };

  const getGenres = async () => {
    try {
      const response = await axios.get("/api/genre/getAllGenres", {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });
      if (response.status === 200) {
        setGenres(response?.data?.genres);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      swal({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Please login to access the resource",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };
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
  const getsubtbyid = async (id) => {
    try {
      const response = await axios.get(`/api/subject/getSubject/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });
      if (response.status === 200) {
        setSingleSubjectData(response?.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      swal({
        title: "Error",
        text:
          error.response?.data?.message ||
          "Please login to access the resource",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };

  const getAdminSubjectView = async (id) => {
    try {
      setLoadingSubject(true);
      setSubjectView([]);
      const resp = await axios.get(`/api/genre/screen/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubjectView(resp.data);
      setSubjectViewError("");
    } catch (error) {
      const errmsg = error?.response?.data?.message;
      setSubjectViewError(errmsg);
      // toast.error(errmsg);

      console.log("getAdminSubjectView.error", errmsg);
    } finally {
      setLoadingSubject(false);
    }
  };
  const getAllsubgenre = async (id) => {
    try {
      setGenreSubjectModelLoading(true);
      setGenreSubjectModel([]);
      localStorage.setItem("genreIdlocal", id);
      const resp = await axios.get(`/api/genre/getAll/subgenre/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGenreSubjectModel(resp.data);
      setViewSubGenre(true);
    } catch (error) {
      const message = error.response.data.message;
      setGenreSubjectModelError(message);
      // toast.error(message)
    } finally {
      //  setGenreSubjectModelLoading(id)
      setGenreSubjectModelError(null);
      setGenreSubjectModelLoading(false);
    }
  };

  const handleDelete = (_id, genreId) => {

    swal({
      title: "Are you sure?",
      icon: "error",
      buttons: {
        Yes: { text: "Yes", value: true },
        Cancel: { text: "Cancel", value: "cancel" },
      },
    }).then((value) => {
      if (value === true) {
        setSubdelloading(_id);
        axios
          .delete(`/api/subject/delete/${_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          .then((res) => {
            //  getAllsubgenre(genreIdlocal)

            getAllsubgenre(genreId);
            getGenres();
            getSubjects()
            setSubdelloading(null);

            swal({
              title: "Congratulations!!",
              text: "The subject was deleted successfully!",
              icon: "success",
              button: "OK",
            });
          })
          .catch((err) => {
            swal({
              title: "",
              text: "Something went wrong!",
              icon: "error",
              button: "Retry",
              dangerMode: true,
            });
          });
      }
    });
  };

  // updatre subgenre
  const handleUpdateOnchange = (e) => {
    const { name, value } = e.target;
    setSubjectUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handeSubjectUpdate = async (_id) => {
    try {
      console.log("_id", _id);
      const formData = new FormData();
      formData.append("subjectName", subjectupdate.subjectName);
      formData.append("subjectImage", subjectupdate.subjectImage);
      formData.append("genreId", subjectupdate.genreId);
      setSubjectLoading(true);
      const resp = await axios.patch(`/api/subject/update/${_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      getAllsubgenre(genreIdlocal);
      getGenres();
      setEditSubGenre(false);
      toast.success(resp.data.message || "subject Updated successfully!");
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
    } finally {
      setSubjectLoading(false);
    }
  };
  useEffect(() => {
    const idFromStorage = localStorage.getItem("subjectViewId");
    if (idFromStorage) {
      setSubjectViewId(idFromStorage);
      getAdminSubjectView(idFromStorage);
    }
    if (genreIdlocal) {
      getAllsubgenre(genreIdlocal);
    }
  }, []);

  useEffect(()=>{
    getSubjects()
  },[])
  return (
    <AdminContext.Provider
      value={{
        subjectView,
        getAdminSubjectView,
        setSubjectViewId,
        subjectViewId,
        loadingsubject,
        getAllsubgenre,
        GenreSubjectModel,
        GenreSubjectModelLoading,
        setGenreSubjectModelLoading,
        viewsubgenre,
        setViewSubGenre,
        handleDelete,
        subdelloading,
        getGenres,
        loading,
        setLoading,
        genres,
        handleUpdateOnchange,
        handeSubjectUpdate,
        subjectupdate,
        handleFileChangeSubect,
        setSubjectId,
        subjectloading,
        editsubgenre,
        setEditSubGenre,
        setGenreIdlocal,
        subjectId,
        getsubtbyid,
        singleSubjectData,
        subjectViewError,
        setSubjectViewId,
        subjectViewId,
        GenreSubjectModelError,
        getSubjects,
        subjects,
        setSubjectView
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
