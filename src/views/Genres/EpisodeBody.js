import React from "react";
import { useAdmin } from "../series/AdminContext";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useNavigate } from "react-router-dom";
import { CircularProgress, TableBody, TableCell, TableRow } from "@material-ui/core";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
} from "@mui/material";

const EpisodeBody = ({
  setDeleteId,
  deleteEpisode,

  getsingleEpisode,
  setViewLoading,
  viewLoading,
  episodes,
  deleteId,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: episodes.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab", // optional
  };

  const navigate = useNavigate();
  return (
    <>
      {episodes?.map((episode, i) => (
        <TableRow
          key={i}
        
        >
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
            <audio controls style={{ width: "100%" }}>
              <source src={episode.audioUrl} type="audio/mpeg" />
            </audio>
          </TableCell>
          <TableCell
            sx={{
              fontWeight: "600",
              color: "gray",
              textAlign: "center",
            }}
          >
            {episode?.episodenumber || null}
          </TableCell>
          <TableCell onClick={(e) => e.stopPropagation()}>
            <Button
              onPointerDown={(e) => e.stopPropagation()}
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
             
                setViewLoading(episode.id);
                getsingleEpisode(episode.id);
                localStorage.setItem("singleEpisodeId", episode.id);
                navigate(`/all/episode/details/${episode.id}`);
              }}
            >
              {viewLoading === episode.id ? (
                <CircularProgress size={25} />
              ) : (
                "View"
              )}
            </Button>
          </TableCell>

          <TableCell onClick={(e) => e.stopPropagation()}>
            <Button
              onPointerDown={(e) => e.stopPropagation()}
              variant="contained"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
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
    </>
  );
};

export default EpisodeBody;
