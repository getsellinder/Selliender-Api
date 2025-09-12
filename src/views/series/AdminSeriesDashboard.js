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
import { useAdmin } from "./AdminContext";

const AdminSeriesDashboard = () => {
  const navigate = useNavigate();
  const { getAdminSubjectView ,setSubjectViewId} = useAdmin();
  const {
    getallserieswithepisode,
    

    genres,
  } = useSeries();

  const [serieLoadingEdit, setSeriesLoadingEdit] = React.useState(null);
  const [serieLoadingview, setSeriesLoadingView] = React.useState(null);
  const [serieLoadingdelete, setSeriesLoadingDelete] = React.useState(null);
  const headingtitle = [
    // "Seriesno",
    "Genrename",
    // "Subjectname",
    "CoverImage",
    "",
    // "",
    // "",
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
              <div
                style={{ fontSize: "22px", paddingBottom: "10px" }}
                className="fw-bold"
              >
                Admin Series Dashboard
              </div>
            </div>
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ bgcolor: "orange" }}>
            <TableRow>
              {headingtitle.map((name) => (
                <TableCell sx={{ color: "black", fontWeight: "600" }}>
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ width: "100%" }}>
            {genres?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.genreName}</TableCell>
                {/* <TableCell>{item.genrename}</TableCell>
                <TableCell>{item.subjectname}</TableCell> */}
                {/* <TableCell>{item.description}</TableCell> */}
                <TableCell>
                  <img
                    src={item.genreImage.fileUrl}
                    style={{ height: "2rem", width: "2rem" }}
                  />
                </TableCell>

                <TableCell>
                  <Button
                    sx={{ width: "100%" }}
                    variant="contained"
                    color="success"
                    onClick={async () => {
                      setSeriesLoadingView(item._id);
                      setSubjectViewId(item._id)
                      await getAdminSubjectView(item._id);

                      localStorage.setItem("subjectViewId", item._id);

                      navigate(`/AdminSubjectView/${item.genreName}/${item._id}`);
                      // getallseries
                      // withepisode(item._id)
                    }}
                  >
                    {serieLoadingview === item._id ? (
                      <CircularProgress size={25} />
                    ) : (
                      "View"
                    )}
                  </Button>
                </TableCell>
                {/* <TableCell>
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
                </TableCell> */}
                {/* <TableCell>
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
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* <Stack
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
        </Stack> */}
      </TableContainer>
    </div>
  );
};

export default AdminSeriesDashboard;
