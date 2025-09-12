import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import { Button, CircularProgress, Pagination, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
// import { useSeries } from "./SeriesContext";

import { Box, Input, InputAdornment } from "@material-ui/core";
import { useTrending } from "./TreadingContext";

const Trending = () => {
  const [editloading, setEditLoading] = React.useState(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const {
    titleData,
    AllTreadings,
    AllTreadingsLoading,
    getAlltreadings,
    setIsTrending,
    isTreading,
    handleTrendingDel,
    treadingdelLoading,
    getSingletreadings,
    setAllTreadingsLoading,
    singleTrending,
    setTreadingId,
    AllTreadingsError,
    setTitleData,
  } = useTrending();

  const handlePageChange = (newpage) => {
    getAlltreadings(newpage);
  };

  const headingtable = [
    "Content",
    "Image",
    "EpisodeTitle",
    "Title",
    "IsTreading",
    "Created",
    "",
    "",
  ];

  const navigate = useNavigate();
  const handleactiveTogle = (data) => {
    setIsTrending(data);
    getAlltreadings(data);
  };
  const fechItmes = AllTreadings?.data || [];
  const handleEdit = async (id) => {
    try {
      // setAllTreadingsLoading(false)
      setEditLoading(id);
      await getSingletreadings(id);
      navigate(`/Trending/update/${id}`);
    } catch (error) {
      console.log("errors", error.message);
    } finally {
      setEditLoading(null);
    }
  };

  const handleSearchIcon = async () => {
    try {
      setSearchLoading(true);
      setTitleData("");
      await getAlltreadings(isTreading, titleData);
    } catch (error) {
      console.log("error", error.message);
    } finally {
      setSearchLoading(false);
    }
  };
  React.useEffect(()=>{
    const delayDebounce =setTimeout(() => {
       getAlltreadings(isTreading,titleData);
    }, 500);
    return()=>clearTimeout(delayDebounce)
  },[titleData])
  console.log("AllTreadingsError", AllTreadingsError);

  return (
    <div>
      <div>
        <h4>Trending</h4>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            marginBottom: "1rem",
            paddingTop: "1rem",
          }}
        >
          <Button
            onClick={() => handleactiveTogle("true")}
            variant="contained"
            sx={{
              background: "#f57c00",
              fontWeight: "600",
              cursor: "pointer",
              "&:hover:": {
                backgroundColor: "#f57c01",
              },
            }}
          >
            {AllTreadingsLoading && isTreading === "true" ? (
              <CircularProgress size={25} />
            ) : (
              "Active Trending list"
            )}
          </Button>
          <Button
            variant="contained"
            onClick={() => handleactiveTogle("false")}
            sx={{ background: "red", fontWeight: "600", cursor: "pointer" }}
          >
            {AllTreadingsLoading && isTreading === "false" ? (
              <CircularProgress size={25} />
            ) : (
              " Deactive Trending list"
            )}
          </Button>
        </Box>
        <Box sx={{ width: "40%" }}>
          <Input   value={titleData} 
            onChange={(e) => {
              setTitleData(e.target.value);
            }}
            placeholder="Enter title here"
            endAdornment={
              <InputAdornment position="end">
                {searchLoading ? (
                  <CircularProgress size={25} />
                ) : (
                  <SearchIcon
                    onClick={() => handleSearchIcon()}
                    sx={{ cursor: "pointer" }}
                  />
                )}
              </InputAdornment>
            }
            fullWidth
          />
        </Box>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {headingtable.map((name) => (
                <TableCell sx={{ color: "black", fontWeight: "600" }}>
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {AllTreadingsError ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {AllTreadingsError}
                </TableCell>
              </TableRow>
            ) : (
              fechItmes?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.t.content}</TableCell>
                  <TableCell>
                    <img
                      src={item.t.image.fileUrl}
                      style={{
                        height: "4rem",
                        width: "5rem",
                        borderRadius: "5px",
                      }}
                      alt="thumbnail"
                    />
                  </TableCell>
                  <TableCell>
                    {item.t.episodeId ? item.t.episodeId.title : "null"}
                  </TableCell>
                  <TableCell>
                    {item.t.titleId ? item.t.titleId.seriestitle : "null"}
                  </TableCell>
                  <TableCell>
                    {item.t.isTreading ? "Active" : "DeActive"}
                  </TableCell>
                  <TableCell>{item.createdAt}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleEdit(item.t._id)}
                    >
                      {editloading === item.t._id ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Edit"
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      sx={{ cursor: "pointer" }}
                      variant="contained"
                      color="error"
                      onClick={() => handleTrendingDel(item.t._id)}
                    >
                      {treadingdelLoading === item.t._id ? (
                        <CircularProgress size={24} />
                      ) : (
                        "delete"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Stack
          sx={{
            display: "flex",
            justifyContent: "end",
            width: "100%",
            alignItems: "flex-end",
            py: "1rem",
          }}
        >
          <Pagination
            count={AllTreadings.totalPages}
            page={AllTreadings.currentPage}
            onChange={(e, value) => handlePageChange(value)}
            color="primary"
          />
        </Stack>
      </TableContainer>
    </div>
  );
};

export default Trending;
