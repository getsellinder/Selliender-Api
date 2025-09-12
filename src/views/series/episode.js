import * as React from "react";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
// import Button from "@material-ui/core/Button";
import { Button, CircularProgress, Pagination, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSeries } from "./SeriesContext";
import { InputOutlined, Search } from "@mui/icons-material";
import { Input } from "@material-ui/core";
import { useTrending } from "../Trending/TreadingContext";

const episode = () => {
  const [editloading, setEditLoading] = React.useState(null);
  const [viewloading, setViewLoading] = React.useState(null);
  const [deleteloading, setDeleteLoading] = React.useState(null);
  const [toggledata, setToggleData] = useState("");
  const navigate = useNavigate();

  const {
    allepisode,
    deleteEpisode,
    edloading,
    handlePageChange,
    getsingleEpisode,
    setSingleEpisodeId,
    getallepisode,
    episodeFilter,
    setEpisodeFillter,
  } = useSeries();
  const { MakeTreading, getAlltreadingsApp } = useTrending();
  // console.log("allepisode", allepisode);

  const headingtitle = [
    "Title",
    "Audio",
    "Duration",
    "Thumbnail",
    "Description",
    "Treadings",

    "",
    "",
    "",
  ];

  // console.log("toggledata", toggledata);
  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div
              style={{ marginBottom: "1.5rem" }}
              className="
                            page-title-box
                            d-flex
                            align-items-center
                            justify-content-between

                          "
            >
              <div style={{ fontSize: "22px" }} className="fw-bold">
                Episodes
              </div>
              <div
                style={{
                  fontSize: "22px",
                  border: "2px solid gray ",
                  width: "40%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "5px",
                  padding: "5px 0px 0px 5px",
                }}
                className="fw-bold"
              >
                <Input
                  placeholder="Enter episode name"
                  style={{ outline: "none", border: "none" }}
                  onChange={(e) => {
                    setEpisodeFillter(e.target.value);
                    getallepisode();
                  }}
                  value={episodeFilter}
                />
                <Search
                  sx={{ fontSize: "1.5rem", cursor: "pointer", color: "gray" }}
                  onClick={() => getallepisode()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {headingtitle.map((name) => (
                <TableCell
                  sx={{
                    color: "black",
                    fontWeight: "600",
                  }}
                >
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allepisode?.data?.length > 0 &&
              allepisode.data?.map((item, index) => {
                // console.log("item",item)
                return (
                  <>
                    <TableRow key={index}>
                      <TableCell>{item.title}</TableCell>

                      <TableCell>
                        <audio controls style={{ width: "100%" }}>
                          <source
                            type="audio/mpeg"
                            src={item.audioUrl.fileUrl}
                          ></source>
                        </audio>
                      </TableCell>
                      <TableCell>{item.duration}</TableCell>
                      <TableCell>
                        <img
                          src={item.thumbnail.fileUrl}
                          style={{
                            height: "5rem",
                            width: "5rem",
                            borderRadius: "5px",
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.description}</TableCell>

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
                            onClick={() =>
                              navigate(`/Trending/create/${item._id}`)
                            }
                          >
                            MakeTrending
                          </Button>
                        ) : (
                          // <Button
                          //   variant="contained"
                          //   sx={{
                          //     cursor: "pointer",
                          //     width: "8rem",
                          //     backgroundColor: item.isTreading
                          //       ? "#f57c00"
                          //       : "red",
                          //     color: "#fff",
                          //     fontWeight: "bold",
                          //     textTransform: "none",
                          //     "&:hover": {
                          //       backgroundColor: item.isTreading
                          //         ? "#f57c01"
                          //         : "#f57c00",
                          //     },
                          //   }}
                          //   onClick={() => {

                          //    const newStatus = item.isTreading === true ? false : true;
                          //     setToggleData(newStatus);

                          //     console.log("newStatus", newStatus,item._id);
                          //     MakeTreading(item.trendingId,newStatus);

                          //     getallepisode();

                          //   }}
                          // >
                          //   {item.isTreading ? "Active" : "Deactivate"}
                          // </Button>
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
                              setToggleData(newStatus);

                              console.log("newStatus", newStatus, item._id);
                              MakeTreading(item.trendingId, newStatus);

                              getallepisode();
                            }}
                          >
                            {item.isTreading ? "Trending ON" : "Trending OFF"}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          sx={{
                            cursor: "pointer",
                            bgcolor: "orangered",
                            "&: hover": {
                              background: "orange",
                            },
                          }}
                          onClick={async () => {
                            setViewLoading(item._id);
                            setSingleEpisodeId(item._id);
                            await getsingleEpisode(item._id);
                            localStorage.setItem("singleEpisodeId", item._id);
                            localStorage.setItem("updateshowdataId", item._id);
                            navigate(`/all/episode/details/${item._id}`);
                          }}
                        >
                          {viewloading === item._id ? (
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
                          sx={{ cursor: "pointer" }}
                          onClick={async () => {
                            setEditLoading(item._id);
                            await getsingleEpisode(item._id);
                            localStorage.setItem("singleEpisodeId", item._id);
                            localStorage.setItem("updateshowdataId", item._id);

                            navigate(`/update/episode/${item._id}`);
                          }}
                        >
                          {editloading === item._id ? (
                            <CircularProgress size={25} />
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
                          onClick={() => {
                            setDeleteLoading(item._id);
                            deleteEpisode(item._id);
                          }}
                        >
                          {deleteloading === item._id ? (
                            <CircularProgress size={25} />
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
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
            count={allepisode.totalPages}
            page={allepisode.currentPage}
            onChange={(e, value) => handlePageChange(value)}
            color="primary"
          />
        </Stack>
      </TableContainer>
    </div>
  );
};

export default episode;
