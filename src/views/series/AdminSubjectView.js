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
import { useAdmin } from "./AdminContext";
import EpisodeBody from "../Genres/EpisodeBody";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { closestCorners, DndContext } from "@dnd-kit/core";
import toast from "react-hot-toast";

const AdminSubjectView = () => {
  const { subjectView, loadingsubject, subjectViewError ,setSubjectView} = useAdmin();
  const {setSingleSeriesEpisodes, 
    
    signleSeriesEpisodes, deleteEpisode,getallserieswithepisode,
     getsingleEpisode } = useSeries();
  const [activeId, setActiveId] = useState();
  const [deleteId, setDeleteId] = useState();
  const [viewLoading, setViewLoading] = useState(null);
  const [expandedSeriesId, setExpandedSeriesId] = useState(0);
  console.log("subjectView", subjectView);
 const { id } = useParams();
  const headingtitle = [
    "Title",
    "Description",
    "About",
    "Duration",
    "Audio",
    "Episode Number",

    "",
    "",
    // "",
  ];
  const handleDragEnd = async (event, seasonIndex) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const episodes=[...subjectView.series[seasonIndex].episodes]
   console.log("episodes",episodes)
   const oldIndex =episodes.findIndex((ep)=>ep.id===active.id)
   const newIndex=episodes.findIndex((ep)=>ep.id===over.id)
 const newEpisodes=arrayMove(episodes,oldIndex,newIndex)
 setSubjectView((prev)=>{
      const newState = { ...prev };
    newState.seasons[0].episodes = newEpisodes;
    return newState;

 })
   const payload = newEpisodes.map((ep, idx) => ({
     id: ep.id,
     orderIndex: idx + 1,
   }));
 console.log("payload",payload)
   try {
     const res = await axios.put(
       `/api/get/series/episode/order/${id}`,
  {   episodes: payload},
       {
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
       }
     );
 
     getallserieswithepisode()
         toast.success(res.data.message);
   } catch (error) {
     console.log("handleDragEnd",error.message)
     toast.error(error.message);
   }

  };
  console.log("subjectView",subjectView)

  return (
    <div>
      <Container>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: "2rem",
            fontWeight: "600",
            color: "#000",
            textAlign: "center",
          }}
        >
          Subgenre View
        </Typography>

        {loadingsubject ? (
          <Stack
            sx={{
              height: "50vh",
              width: "100%",
              display: "flex",
              opacity: "0.5",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "2rem",
                color: "gray",
                fontWeight: "600",
                paddingBottom: "1rem",
              }}
            >
              Feaching The data..........
            </Typography>
            <CircularProgress size={30} />
          </Stack>
        ) : (
          <>
            {subjectViewError && (
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  paddingTop: "1rem",
                  fontSize: "1.2rem",
                  color: "gray",
                  fontWeight: "600",
                }}
              >
                {subjectViewError}
              </Typography>
            )}
            {subjectView?.length > 0 ? (
              subjectView?.map((subjectItem, subjectIndex) => {
                return (
                  <Box key={subjectIndex}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: "orange",
                        textAlign: "center",
                        paddingY: "10px",
                      }}
                    ></Typography>
                    {subjectItem.series.map((item, index) => {
                      console.log("item", item);
                      return (
                        <>
                          <CardContent key={index}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              flexDirection="column"
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  backgroundColor: "#e0f7fa", // light background
                                  padding: "1rem",
                                  borderRadius: "8px",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: "80%",
                                    display: "grid", // use grid instead of flex for better alignment
                                    gridTemplateColumns: "repeat(2, 1fr)", // 2 columns layout
                                    gap: "1rem", // spacing between items
                                  }}
                                >
                                  {/* Genre */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        mr: 1,
                                      }}
                                    >
                                      Genre:
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "1.2rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.Genretitle}
                                    </Typography>
                                  </Box>

                                  {/* Subgenre */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        mr: 1,
                                      }}
                                    >
                                      Subgenre:
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "1.2rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.subgenre}
                                    </Typography>
                                  </Box>

                                  {/* Series No */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        mr: 1,
                                      }}
                                    >
                                      Series No:
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "1.2rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.seriespart}
                                    </Typography>
                                  </Box>

                                  {/* Series Title */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        mr: 1,
                                      }}
                                    >
                                      Series Title:
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: "1.2rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {item.seriestitle}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Button
                                  onClick={() =>
                                    setExpandedSeriesId(
                                      expandedSeriesId === item.Id
                                        ? null
                                        : item.Id
                                    )
                                  }
                                >
                                  {expandedSeriesId === item.Id
                                    ? "Hide Episode"
                                    : "Show Episode"}
                                </Button>
                              </Box>

                              {expandedSeriesId === item.Id && (
                                <TableContainer>
                                  <Table>
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: "orange" }}>
                                        {headingtitle.map((item) => (
                                          <TableCell
                                            key={item}
                                            sx={{
                                              fontSize: "1rem",
                                              fontWeight: "600",
                                              color: "#000",
                                            }}
                                          >
                                            {item}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                 
                                  
                                        <TableBody>
                                          <EpisodeBody
                                            episodes={item.episodes}
                                            setDeleteId={setDeleteId}
                                            deleteEpisode={deleteEpisode}
                                            setViewLoading={setViewLoading}
                                            getsingleEpisode={getsingleEpisode}
                                            viewLoading={viewLoading}
                                            deleteId={deleteId}
                                          />
                                        </TableBody>
                                  

                                    {/* <TableBody>
                                      {item.episodes?.map((episode, i) => (
                                        <TableRow key={i}>
                                          <TableCell
                                            sx={{
                                              fontWeight: "600",
                                              color: "gray",
                                            }}
                                          >
                                            {episode.title}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontWeight: "600",
                                              color: "gray",
                                            }}
                                          >
                                            {episode.description}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontWeight: "600",
                                              color: "gray",
                                            }}
                                          >
                                            {episode.about}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              fontWeight: "600",
                                              color: "gray",
                                            }}
                                          >
                                            {episode.duration}
                                          </TableCell>
                                          
                                          <TableCell
                                            sx={{
                                              fontWeight: "600",
                                              color: "gray",
                                            }}
                                          >
                                            <audio
                                              controls
                                              style={{ width: "100%" }}
                                            >
                                              <source
                                                src={episode.audioUrl}
                                                type="audio/mpeg"
                                              />
                                            </audio>
                                          </TableCell>
                                            <TableCell
                                            sx={{
                                              fontWeight: "600",
                                              color: "gray",
                                              textAlign:"center"
                                            }}
                                          >
                                            
                                            {episode?.episodenumber || null}
                                          </TableCell>
                                          <TableCell>
                                            <Button
                                              variant="contained"
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
                                              color="error"
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
                                      ))}
                                    </TableBody> */}
                                  </Table>
                                </TableContainer>
                              )}
                            </Box>
                          </CardContent>
                        </>
                      );
                    })}
                  </Box>
                );
              })
            ) : (
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  paddingTop: "1rem",
                  fontSize: "1.2rem",
                  color: "gray",
                  fontWeight: "600",
                }}
              >
                No data found
              </Typography>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default AdminSubjectView;
