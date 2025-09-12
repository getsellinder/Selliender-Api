import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell, Button, CircularProgress } from "@mui/material";

function SortableEpisodeRow({
    episode,
    viewLoading,
    activeId,
    deleteId,
    getsingleEpisode,
    deleteEpisode,
    navigate,
    setDeleteId,
    setViewLoading,
    setActiveId,
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: episode.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab", // optional
    };

    return (
        <TableRow ref={setNodeRef} {...attributes} {...listeners} style={style}>
               <TableCell sx={{ fontWeight: "600", color: "gray",textAlign:"center" }}>
                {episode.episodenumber || null}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "gray",textAlign:"center"  }}>
                {episode.title}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "gray",textAlign:"center"  }}>
                {episode.genrename}
            </TableCell>
            <TableCell sx={{ fontWeight: "600", color: "gray",textAlign:"center"  }}>
                {episode.subjectname}
            </TableCell>
            <TableCell>
                <audio controls style={{ marginTop: "10px", width: "100%" }}>
                    <source
                        src={episode.audioUrl.fileUrl || episode.audioUrl}
                        type="audio/mpeg"
                    />
                </audio>
            </TableCell>
         
            <TableCell onClick={(e) => e.stopPropagation()}>
                <Button
                    variant="contained"
                    color="primary"
                    onPointerDown={(e) => e.stopPropagation()}
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setViewLoading(episode.id);
                        getsingleEpisode(episode.id);
                        localStorage.setItem("singleEpisodeId", episode.id);
                        navigate(`/all/episode/details/${episode.id}`);
                    }}
                >
                    {viewLoading === episode.id ? <CircularProgress size={25} /> : "View"}
                </Button>
            </TableCell>
            <TableCell
                style={{ pointerEvents: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="contained"
                    color="success"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();


                        setActiveId(episode.id)
                        navigate(`/update/episode/${episode.id}`);
                    }}
                >
                    {activeId === episode.id ? <CircularProgress size={30} /> : "Edit"}
                </Button>
            </TableCell>
            <TableCell>
                <Button
                    variant="contained"
                    color="error"
                    onPointerDown={(e) => e.stopPropagation()}
                    sx={{ cursor: "pointer" }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(episode.id);
                        deleteEpisode(episode.id);
                    }}
                >
                    {deleteId === episode.id ? <CircularProgress size={25} /> : "Delete"}
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default SortableEpisodeRow;
