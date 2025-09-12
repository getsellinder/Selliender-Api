


import React, { useEffect, useState } from "react";
import { CRow, CCol, CWidgetStatsA } from "@coreui/react";
import { isAutheticated } from "src/auth";
import axios from "axios";

const WidgetsDropdown = ({ genre = [] }) => {
  const token = isAutheticated();

  // Keep only the genre-related data
  const [genres, setGenres] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  

  const getAllGenre = async () => {
    try {
      let res = await axios.get(`/api/genre/getAllGenres`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("genres", res.data);
      setGenres(res?.data?.genres || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
      // setGenres([]);
    }
  };

  const getAllSubjects = async ()=>{
    try {
      let res = await axios.get(`/api/subject/getSubjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("subjects", res.data);
      setSubjects(res?.data?.subjects || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
      setGenres([]);
    }
  };

  const getAllChaptersbyUser = async ()=>{
    try {
      let res = await axios.get(`/api/chapter/getAll/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("chapters", res.data);
      setChapters(res?.data?.chapter || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
      setChapters([]);
    }
  };

  useEffect(() => {
    if (!genres.length && token) {
      getAllGenre();
    }
    if (!subjects.length && token) {
      getAllSubjects();
    }
    if(!chapters.length && token) {
      getAllChaptersbyUser();
    }
  }, [ ]);
  console.log("genres.WidgetsDropdown",genres)

  return (
    <>
      <h4>Genre & Subjects</h4>
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={<>{genres.length}</>}
            title="Total Genres"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={<>{subjects.length}</>}
            title="Total Subjects"
          />
        </CCol>
      </CRow>

      <h4>Chapters</h4>
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={<>{chapters.length}</>}
            title="Total Chapters"
          />
        </CCol>
      </CRow>
    </>
  );
};

export default WidgetsDropdown;