import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardHeader, CFormSwitch, CButton } from '@coreui/react';
import axios from 'axios';
import { isAutheticated } from "src/auth";
import swal from "sweetalert";
import { cilCheckCircle, cilXCircle } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const ReviewsStatus = () => {
  const token = isAutheticated();

  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true); // To track loading state

  // Fetch the current review status from the backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('/api/v1/reviews/status');
        // console.log(res)
        if (res.data && res.data.success) {
          setIsEnabled(res.data.review_status); // Set status from API
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchStatus(); // Call the function to fetch status
  }, []); // Empty dependency array to call once on mount

  // Handle toggle change
  const handleToggle = async (e) => {
    const newStatus = e.target.checked;
    setIsEnabled(newStatus);
    //   console.log("status",newStatus)

    try {
      const res = await axios.patch('/api/v1/reviews/status',

        // {
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //       "Content-Type": "multipart/form-data",
        //       "Access-Control-Allow-Origin": "*",
        //     },
        //   },
        { status: newStatus }
      ); // Update status in the backend
      // console.log(res)
      if (res.data && res.data.success) {
        swal({
          title: "success",
          text: "Status updated successfully",
          icon: "success",
          button: "ok",
        });
        //   console.log('Status updated successfully');
      }
    } catch (err) {
      console.error(err);
      swal({
        title: "Warning",
        text: err,
        icon: "error",
        button: "Retry",
        dangerMode: true,
      });
    }
  };





  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="text-center">
        <strong>Reviews Status</strong>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column align-items-start">
            <h5>{isEnabled ? 'Feature Enabled' : 'Feature Disabled'}</h5>
            <p className="text-muted">
              {isEnabled ? 'The feature is currently active.' : 'The feature is currently inactive.'}
            </p>
          </div>
          <div className="d-flex align-items-center">
            <CFormSwitch
              checked={isEnabled}
              onChange={handleToggle}
              id="feature-toggle"
              label={isEnabled ? 'Disable' : 'Enable'}
              className="me-3"
            />
            <CButton
              color={isEnabled ? 'success' : 'danger'}
              variant="outline"
              className="px-3 py-2"
            >
              <CIcon
                icon={isEnabled ? cilCheckCircle : cilXCircle}
                size="lg"
                className="me-2"
              />
              {isEnabled ? 'Enabled' : 'Disabled'}
            </CButton>
          </div>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default ReviewsStatus;
