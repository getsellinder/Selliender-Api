import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { useSeries } from "./SeriesContext";
import Table from "@mui/material/Table";
import CircularProgress from "@mui/material/CircularProgress";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Pagination, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableEpisodeRow from "./SortableEpisodeRow";
import toast from "react-hot-toast";
import axios from "axios";

const SeriesAllDetails = () => {
  const {
    signleSeriesEpisodes,
    token,
    setSingleSeriesEpisodes,
    getallserieswithepisode,
    deleteEpisode,
    getsingleEpisode,
    seriesLoading,
    setSingleEpisodeId,
    getsingleEpisodeLoading,
  } = useSeries();
  const [activeId, setActiveId] = useState();
  const [deleteId, setDeleteId] = useState();
  const [viewLoading, setViewLoading] = useState(null);
  const [expandedSeriesId, setExpandedSeriesId] = useState(0);
  const { id } = useParams();
  console.log("sereis id ", id);

  const headingtitle = [
    "Episode Number",
    "Title",
    "Genre Name",
    "Subgenre Name",
    "Audio",

    "",
    "",
    "",
  ];
  const navigate = useNavigate();

  const handleDragEnd = async (event, seasonIndex) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const episodes = [...signleSeriesEpisodes.seasons[seasonIndex].episodes];
    const oldIndex = episodes.findIndex((ep) => ep.id === active.id);
    const newIndex = episodes.findIndex((ep) => ep.id === over.id);

    const newEpisodes = arrayMove(episodes, oldIndex, newIndex);

    setSingleSeriesEpisodes((prev) => {
      const newState = { ...prev };
      newState.seasons[0].episodes = newEpisodes;
      return newState;
    });

    // prepare payload
    const payload = newEpisodes.map((ep, idx) => ({
      id: ep.id,
      orderIndex: idx + 1,
    }));
    console.log("payload", payload);
    try {
      const res = await axios.put(
        `/api/get/series/episode/order/${id}`,
        { episodes: payload },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      getallserieswithepisode();
      toast.success(res.data.message);
    } catch (error) {
      console.log("handleDragEnd", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <Container>
        <Box sx={{ paddingBottom: "1rem" }}>
          <Box
            sx={{ display: "flex", justifyContent: "start", alignItems: "c" }}
          >
            <Typography
              sx={{
                width: "20%",
                fontSize: "1.3rem",
                color: "#000",
                fontWeight: "600",
              }}
            >
              genre
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "#000",
                fontWeight: "600",
                width: "5%",
              }}
            >
              :
            </Typography>
            <Typography
              sx={{ fontSize: "1.2rem", color: "#000", fontWeight: "600" }}
            >
              {signleSeriesEpisodes?.series?.genre}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "start", alignItems: "c" }}
          >
            <Typography
              sx={{
                width: "20%",
                fontSize: "1.3rem",
                color: "#000",
                fontWeight: "600",
              }}
            >
              subgenre
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "#000",
                fontWeight: "600",
                width: "5%",
              }}
            >
              :
            </Typography>
            <Typography
              sx={{ fontSize: "1.2rem", color: "#000", fontWeight: "600" }}
            >
              {signleSeriesEpisodes?.series?.subject}
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "start", alignItems: "c" }}
          >
            <Typography
              sx={{
                width: "20%",
                fontSize: "1.3rem",
                color: "#000",
                fontWeight: "600",
              }}
            >
             Title
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                color: "#000",
                fontWeight: "600",
                width: "5%",
              }}
            >
              :
            </Typography>
            <Typography
              sx={{ fontSize: "1.2rem", color: "#000", fontWeight: "600" }}
            >
              {signleSeriesEpisodes?.series?.seriestitle}
            </Typography>
          </Box>
        </Box>

        {signleSeriesEpisodes?.seasons?.length > 0 ? (
          signleSeriesEpisodes?.seasons?.map((series, index) => {
            return (
              <Card key={index}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "1.3rem",
                        fontWeight: "600",
                        color: "#000",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "600",
                          color: "gray",
                        }}
                      >
                        Season:
                      </span>{" "}
                      {series.season !== "undefined"
                        ? series.season
                        : `Season ${index + 1}`}
                    </Typography>

                    <Button
                      onClick={() =>
                        setExpandedSeriesId((prev) =>
                          prev === index ? null : index
                        )
                      }
                    >
                      {expandedSeriesId === index
                        ? "Hide Episodes"
                        : "Show Episodes"}
                    </Button>
                  </Box>

                  {/* Episodes Table */}
                  {expandedSeriesId === index && (
                    <TableContainer>
                      <Table sx={{ marginY: "1rem", fontFamily: "sans-serif" }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "orange" }}>
                            {headingtitle.map((item, idx) => (
                              <TableCell
                                key={idx}
                                sx={{
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  color: "#000",
                                  textAlign:"center" 
                                }}
                              >
                                {item}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <DndContext
                          collisionDetection={closestCorners}
                          onDragEnd={(event) => handleDragEnd(event, index)}
                        >
                          <SortableContext
                            items={series.episodes.map((ep) => ep.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <TableBody>
                              {series.episodes.map((episode) => (
                                <SortableEpisodeRow
                                  key={episode.id}
                                  episode={episode}
                                  viewLoading={viewLoading}
                                  activeId={activeId}
                                  deleteId={deleteId}
                                  getsingleEpisode={getsingleEpisode}
                                  deleteEpisode={deleteEpisode}
                                  navigate={navigate}
                                  setDeleteId={setDeleteId}
                                  setViewLoading={setViewLoading}
                                  setActiveId={setActiveId}
                                />
                              ))}
                            </TableBody>

                            {/* <TableBody>
                              {series.episodes.map((episode, i) => {
                                const id= episode._id 
                                const { attributes, listeners, setNodeRef, transform, transition } = useSortable({id})
                                return (
                                  <TableRow key={i}>
                                    <TableCell
                                      sx={{ fontWeight: "600", color: "gray" }}
                                    >
                                      {episode.title}
                                    </TableCell>
                                    <TableCell
                                      sx={{ fontWeight: "600", color: "gray" }}
                                    >
                                      {episode.genrename}
                                    </TableCell>
                                    <TableCell
                                      sx={{ fontWeight: "600", color: "gray" }}
                                    >
                                      {episode.subjectname}
                                    </TableCell>
                                    <TableCell>
                                      <audio
                                        controls
                                        style={{
                                          marginTop: "10px",
                                          width: "100%",
                                        }}
                                      >
                                        <source
                                          src={episode.audioUrl}
                                          type="audio/mpeg"
                                        />
                                      </audio>
                                    </TableCell>
                                    <TableCell
                                      sx={{ fontWeight: "600", color: "gray" }}
                                    >
                                      {episode?.episodenumber || null}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setViewLoading(episode.id);
                                          getsingleEpisode(episode.id);
                                          localStorage.setItem(
                                            "singleEpisodeId",
                                            episode.id
                                          );
                                          navigate(
                                            `/all/episode/details/${episode.id}`
                                          );
                                        }}
                                      >
                                        {viewLoading === episode.id ? (
                                          <CircularProgress size={25} />
                                        ) : (
                                          "View"
                                        )}
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        onClick={async () => {
                                          setActiveId(episode.id);
                                          await getsingleEpisode(episode.id);
                                          localStorage.setItem(
                                            "singleEpisodeId",
                                            episode.id
                                          );
                                          navigate(
                                            `/update/episode/${episode.id}`
                                          );
                                        }}
                                      >
                                        {activeId === episode.id ? (
                                          <CircularProgress size={30} />
                                        ) : (
                                          "Edit"
                                        )}
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="error"
                                        sx={{ cursor: "pointer" }}
                                        onClick={() => {
                                          setDeleteId(episode.id);
                                          deleteEpisode(episode.id);
                                        }}
                                      >
                                        {deleteId === episode.id ? (
                                          <CircularProgress size={25} />
                                        ) : (
                                          "Delete"
                                        )}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody> */}
                          </SortableContext>
                        </DndContext>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "20vh",
            }}
          >
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "2rem",
                color: "gray",
                fontWeight: "600",
              }}
            >
              {seriesLoading ? (
                <CircularProgress size={50} />
              ) : (
                "No episodes under this series"
              )}
            </Typography>
          </Box>
        )}
      </Container>
    </div>
  );
};

export default SeriesAllDetails;
