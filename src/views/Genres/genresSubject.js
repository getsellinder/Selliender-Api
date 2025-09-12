import React from "react";
import { useAdmin } from "../series/AdminContext";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Card,
  CardContent,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { Table } from "react-bootstrap";
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const GenresSubject = () => {
  const {
    handleDelete: handlesubjectDelete,

    GenreSubjectModel,
    GenreSubjectModelLoading,

    subdelloading,

    getGenres,
    GenreSubjectModelError,
  } = useAdmin();
  const navigate = useNavigate();
  const tablestyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };
  const viewsubjectheading = ["Genrename", "Subgename", "Image", ""];
  const { name, id } = useParams();

  return (
    <div>
      <h1>{name} details</h1>
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {viewsubjectheading.map((item) => (
                  <TableCell
                    style={{
                      background: "orange",
                      fontWeight: "600",
                      fontSize: "1rem",
                    }}
                  >
                    {item}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {GenreSubjectModelLoading ? (
                <TableRow sx={{textAlign:"center"}}>
                  <TableCell colSpan={4}
                    style={{
                      fontSize: "1rem",
                      color: "gray",
                      fontWeight: "600",
                      textAlign: "center",
                    
                    }}
                  >
                    Loading.......
                    
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {GenreSubjectModelError ? (
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "gray",
                        fontWeight: "600",
                      }}
                    >
                      {GenreSubjectModelError}
                    </div>
                  ) : GenreSubjectModel.length > 0 ? (
                    <>
                      {GenreSubjectModel.map((item, index) => {
                        console.log("item", item);
                        return (
                          <>
                            <TableRow key={index}>
                              <TableCell
                                style={{
                                  fontWeight: "500",
                                  fontSize: "0.95rem",
                                }}
                              >
                                {item.genrame}
                              </TableCell>
                              <TableCell
                                style={{
                                  fontWeight: "500",
                                  fontSize: "0.95rem",
                                }}
                              >
                                {item.subjectName}
                              </TableCell>
                              <TableCell>
                                <img
                                  src={item.subjectImage.fileUrl}
                                  style={{ height: "3rem", width: "3rem" }}
                                />
                              </TableCell>

                              {/* <TableCell sx={{ textAlign: "center" }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          // navigate("")
                          setEditSubGenre(true);
                          getsubtbyid(item._id);
                          localStorage.setItem("subjectId", item._id);
                          localStorage.setItem(
                            "subjecDataEdit",
                            JSON.stringify(item)
                          );
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell> */}
                              <TableCell sx={{ textAlign: "center" }}>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => {
                                    handlesubjectDelete(item._id, item.genreId);

                                    getGenres();
                                  }}
                                >
                                  {subdelloading === item._id ? (
                                    <CircularProgress />
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })}
                    </>
                  ) : (
                  
                    <TableRow>
                      <TableCell
                        colSpan={4} // change 4 to however many columns you have
                        style={{
                          fontSize: "1rem",
                          color: "gray",
                          fontWeight: "600",
                          textAlign: "center",
                          padding: "2rem",
                        }}
                      >
                        <Typography>No subgenres available for this genre.</Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ marginTop: "1rem" }}
                          onClick={() => {
                            navigate(`/create/subgenre/${name}/${id}`);
                          }}
                        >
                          Create
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </div>
  );
};

export default GenresSubject;
