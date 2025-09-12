import axios from "axios";

const { createContext, useContext } = require("react");
import swal from "sweetalert";
import { useSeries } from "../series/SeriesContext";
import toast from "react-hot-toast";

const GenreContext = createContext();

export const GenreProvider = ({ children }) => {
  const { token, getSubjects } = useSeries();
  console.log("token",token)
  
  const [loading, setLoaidng] = useState(false);

  const [createsubgenre, setCreatesubGenre] = useState({
    subjectName: "",
    genreId: "",
    subjectImage: "",
    coverImagePreview: "",
  });
  const handleChange = (e) => {
    const { value, name } = e.target;
    setCreatesubGenre((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      const MAX_IMAGE_SIZE_MB = 2;

      if (fileSizeInMB > MAX_IMAGE_SIZE_MB) {
        toast.error("Please select an image smaller than 2MB.");
        return;
      }
      const previewURL = URL.createObjectURL(file);
      setCreatesubGenre((prev) => ({
        ...prev,
        subjectImage: file,
        coverImagePreview: previewURL,
      }));
    }
  };

  const handleSaveSubject = async (id) => {
    try {
      e.preventDefault();
      console.log("createsubgenre", createsubgenre);

      if (!createsubgenre.subjectName || !createsubgenre.subjectImage) {
        swal({
          title: "Warning",
          text: "Please fill all the required fields!",
          icon: "error",
          button: "Retry",
          dangerMode: true,
        });
        return;
      }

      const formData = new FormData();
      formData.append("subjectName", createsubgenre.subjectName);
      formData.append("subjectImage", createsubgenre.subjectImage);
      // formData.append("genreId", createsubgenre.genreId);
      setLoaidng(true);

      const response = await axios.post(`/api/genre/subgenre/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        getSubjects();

        swal({
          title: "Added",
          text: "New subject added successfully!",
          icon: "success",
          button: "OK",
        });
        navigate(-1);
        setCreatesubGenre({
          subjectName: "",
          genreId: "",
          subjectImage: "",
          coverImagePreview: "",
        });
      }
    } catch (error) {
      const message = error.response.data.message;
      //  setSaveLoading(true);
      swal({
        title: error,
        text: message || "something went wrong",
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    } finally {
      setLoaidng(false);
    }
  };
  return (
    <GenreContext.Provider
      value={{
        handleSaveSubject,
        loading,
        createsubgenre,
        handleImageChange,
        handleChange,
      }}
    >
      {children}
    </GenreContext.Provider>
  );
};

export const useGenreContext = () => useContext(GenreContext);
