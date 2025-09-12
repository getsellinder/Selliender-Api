import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";

import { useNavigate } from "react-router-dom";
import { useSeries } from "./SeriesContext";
import { Button, Pagination, Stack } from "@mui/material";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { useTrending } from "../Trending/TreadingContext";

const Series = () => {
  const navigate = useNavigate();
  const { MakeTreading, getAlltreadingsApp } = useTrending();
  const {
    fetchseries,
    hadleSeriesChange,
    genres,
    setTitleFilter,
    subjects,
    title,
    deleteseries,
    getsignleSeries,
    setSingleSeriesId,
    getseries,
    getallserieswithepisode,
    handletitleFilter,
    titleFilter,
    filterLoading,
    getallepisode,
  } = useSeries();
  console.log("fetchseries", fetchseries);
  const [serieLoadingEdit, setSeriesLoadingEdit] = React.useState(null);
  const [serieLoadingview, setSeriesLoadingView] = React.useState(null);
  const [serieLoadingdelete, setSeriesLoadingDelete] = React.useState(null);
  const headingtitle = [
    // "Titleno",
    "Title",
    "Genre",
    "Sub Genre",
    "Total Episodes",
    // "Created",
    "Image",
    "Trending",
    "",
    "",
    "",
    "",
  ];

  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div
              className="
                            page-title-box
                            d-flex
                            align-items-center
                            justify-content-between
                          "
            >
              <div style={{ fontSize: "22px" }} className="fw-bold">
                Title
              </div>

              <div className="page-title-right">
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    textTransform: "capitalize",
                  }}
                  onClick={() => navigate("/add/series")}
                >
                  Add Title
                </Button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* genre filter */}
              <Grid item xs={4} style={{ marginBottom: "1rem"}}>
                <FormControl fullWidth sx={{ padding: "5px" }}>
                  <InputLabel id="demo-simple-select-label">Genre</InputLabel>
                  <Select 
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="isStandalone"
                    name="genreId"
                    onChange={handletitleFilter}
                    value={titleFilter.genreId}
                    fullWidth
                    MenuProps={{
                      PaperProps:{
                        style:{
                          maxHeight:200
                        }
                      }
                    }}
                    
                  >
                    {genres.map((item, index) => (
                      <MenuItem value={item._id} key={item._id} >
                        {item.genreName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* subgner filter */}
              <Grid item xs={4} style={{ marginBottom: "1rem" }}>
                <FormControl fullWidth sx={{ padding: "5px" }}>
                  <InputLabel id="demo-simple-select-label">
                    Subgenre
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="isStandalone"
                    name="subgeneId"
                    onChange={handletitleFilter}
                    value={titleFilter.subgeneId}
                    fullWidth
                    MenuProps={{
                      PaperProps:{
                        style:{
                          maxHeight:200
                        }
                      }
                    }}
                  >
                    {subjects.map((item, index) => (
                      <MenuItem value={item._id} key={item._id}>
                        {item.subjectName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* title filter */}
              <Grid item xs={4} style={{ marginBottom: "1rem" }}>
                <FormControl fullWidth sx={{ padding: "5px" }}>
                  <InputLabel id="demo-simple-select-label">Title</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="isStandalone"
                    name="seriesId"
                    onChange={handletitleFilter}
                    value={titleFilter.seriesId}
                    fullWidth
                    MenuProps={{
                      PaperProps:{
                        style:{
                          maxHeight:200
                        }
                      }
                    }}
                  >
                    {title?.map((item, index) => (
                      <MenuItem value={item._id} key={item._id}>
                        {item.seriestitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={2}>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: "100%", marginTop: "1rem" }}
                  onClick={() => {
                    getseries(1);
                    setTitleFilter({
                      genreId: "",
                      subgeneId: "",
                      seriesId: "",
                    });
                  }}
                >
                  {filterLoading ? <CircularProgress size={25} /> : "Filter"}
                </Button>
              </Grid>
            </div>
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ bgcolor: "orange" }}>
            <TableRow>
              {headingtitle.map((name) => (
                <TableCell
                  sx={{
                    color: "black",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fetchseries?.data?.map((item, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: "center" }}>
                  {item.seriestitle}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {item.genrename}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {item.subjectname}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {item.countepisode}
                </TableCell>
                {/* <TableCell sx={{ textAlign: "center" }}>
                  {item.createdAtIST}
                </TableCell> */}

                {/* <TableCell>{item.description}</TableCell> */}
                <TableCell>
                  <img
                    src={item.coverImage.fileUrl}
                    style={{
                      height: "3rem",

                      borderRadius: "5px",
                    }}
                  />
                </TableCell>

                <TableCell>
                  {item.trendingId === null ? (
                    <Button
                      variant="contained"
                      sx={{
                        cursor: "pointer",
                        width: "8rem",
                        backgroundColor: "#009688", // blue for create
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#009680" },
                      }}
                      onClick={() => navigate(`/Trending/create/${item._id}`)}
                    >
                      MakeTrending
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      sx={{
                        cursor: "pointer",
                        width: "8rem",
                        backgroundColor: item.isTreading
                          ? "#4caf50"
                          : "#9e9e9e", // green if active, grey if inactive
                        color: "#fff",
                        fontWeight: "bold",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: item.isTreading
                            ? "#388e3c"
                            : "#757575", // darker shade on hover
                        },
                      }}
                      onClick={() => {
                        const newStatus =
                          item.isTreading === true ? false : true;

                        console.log("newStatus", newStatus, item._id);
                        MakeTreading(item.trendingId, newStatus);

                        getseries();
                      }}
                    >
                      {item.isTreading ? "Trending ON" : "Trending OFF"}
                    </Button>
                  )}
                </TableCell>

                <TableCell>
                  <Button
                    sx={{ background: "#4f46e5" }}
                    variant="contained"
                    onClick={() => navigate(`/add/episode/${item._id}`)}
                  >
                    +Episode
                    {/* {serieLoadingview === item._id ? (
                      <CircularProgress size={25} />
                    ) : (
                      "+Episode"
                    )} */}
                  </Button>
                </TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={async () => {
                      setSeriesLoadingView(item._id);
                      localStorage.setItem("singleSeriepisodeId", item._id);
                      await getallserieswithepisode(item._id);

                      navigate(`/title/details/${item._id}`);
                      // getallserieswithepisode(item._id)
                    }}
                  >
                    {serieLoadingview === item._id ? (
                      <CircularProgress size={25} />
                    ) : (
                      "View"
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      setSeriesLoadingEdit(item._id);
                      await getsignleSeries(item._id);

                      localStorage.setItem("singleSerieId", item._id);
                      localStorage.setItem("seriesIdlocal", item._id);
                      navigate(`/update/series/${item._id}`);
                    }}
                  >
                    {serieLoadingEdit === item._id ? (
                      <CircularProgress size={25} />
                    ) : (
                      "Edit"
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      setSeriesLoadingDelete(item._id);
                      deleteseries(item._id);
                    }}
                  >
                    {serieLoadingdelete === item._id ? (
                      <CircularProgress size={25} />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
            color="primary"
            count={fetchseries.totalPages}
            page={fetchseries.currentPage}
            onChange={(e, value) => hadleSeriesChange(value)}
          />
        </Stack>
      </TableContainer>
    </div>
  );
};

export default Series;
