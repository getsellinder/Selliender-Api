import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
  } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAutheticated } from "src/auth";
  
  export default function Home() {
    const [displayPanel1,setDisplayPanel1] = useState("Not Displayed");
    const [displayPanel2,setDisplayPanel2] = useState("Not Displayed");
    const [displayPanel3,setDisplayPanel3] = useState("Not Displayed");
    const [displayPanel4,setDisplayPanel4] = useState("Not Displayed");
    const [loading, setLoading] = useState(false);
    let token = isAutheticated();

    async function getPanelStatus(){
      try {
        setLoading(true)
        let response1 = await axios.get('/api/panel/panel1/get', {
          headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
          }
        })
        
        let response2 = await axios.get('/api/panel/panel2/get', {
          headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
          }
        });
        let response3 = await axios.get('/api/panel/panel3/get', {
          headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
          }
        });
        let response4 = await axios.get('/api/panel/panel4/get', {
          headers: {
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${token}`,
          }
        });
        if(response1 && response2 && response3 && response4){
          if(response1?.data?.panel1[0]?.displayPanel){
            setDisplayPanel1("Displayed")
          }
          if(response2?.data?.panel2[0]?.displayPanel){
            setDisplayPanel2("Displayed");
          }
          if(response3?.data?.panel3[0]?.displayPanel){
            setDisplayPanel3("Displayed");
          }
          if(response4?.data?.panel4[0]?.displayPanel){
            setDisplayPanel4("Displayed");
          }
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
    useEffect(()=>{
       getPanelStatus()
    },[])

    const pages = [
      {
        name: "Panel 1",
        action: "Edit",
        path: "/home/panel-1",
        status:displayPanel1
      },
      {
        name: "Panel 2",
        action: "Edit",
        path: "/home/panel-2",
        status:displayPanel2
      },
      {
        name: "Panel 3",
        action: "Edit",
        path: "/home/panel-3",
        status:displayPanel3
      },
      {
        name: "Panel 4",
        action: "Edit",
        path: "/home/panel-4",
        status:displayPanel4
      },

    ];
  
    return (
      <div className="main-home">
        <Typography variant="h6" fontWeight={"bold"}>
          Home
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: "bold" }}>Page</TableCell>
                <TableCell style={{ fontWeight: "bold" }} align="right">
                  Display Status
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }} align="right">
                  Action
                </TableCell>
                
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell  align="right" sx={{pr:4}}>
                    {loading ? "loading" : `${row.status}`}
                  </TableCell>
                  
                  <TableCell align="right">
                    {" "}
                    <Link to={row.path}>
                      <button
                        style={{
                          color: "white",
                          marginRight: "1rem",
                        }}
                        type="button"
                        className="
                                        btn btn-info btn-sm
                                      waves-effect waves-light
                                      btn-table
                                      mt-1
                                      mx-1
                                    "
                      >
                        {row.action}
                      </button>
                    </Link>
                  </TableCell>
                
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
  