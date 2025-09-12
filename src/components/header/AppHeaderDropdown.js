import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilPencil,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import swal from 'sweetalert';

import userImage from './../../assets/images/avatars/1.jpg'
import { Link } from 'react-router-dom'
// import { signout } from 'src/auth'
import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import socket from 'src/socket.client';
import { getUser as AuthUserId } from "src/loginUserdetails";
const AppHeaderDropdown = () => {



  // Custom CSS styles for the avatar
  const avatarStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff', // Background color
    color: '#fff',              // Text color (white)
    fontSize: '1.5rem',         // Font size for initial
    fontWeight: 'bold',         // Bold text
    borderRadius: '50%',        // Circular shape
    width: '40px',              // Custom size (width)
    height: '40px',             // Custom size (height)
  };





  const [userData, setUserData] = useState()
    const user = AuthUserId();
    const userId = user?.id;
    console.log("userId log out",userId)
  let history = useNavigate();
  const signout = async () => {
    socket.emit("logout",userId)
    localStorage.removeItem('authToken')
    swal("success!", "Logged Out", "success");
    history("/");
  }

  //for user image 

  const getUser = async () => {
    let token = localStorage.getItem("authToken");
    try {
      let response = await axios.get(`/api/v1/user/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success === true) {
        // console.log(response.data.user)
        setUserData(response.data.user)

      }
    }
    catch (err) {

      console.log(err);
    };
  }


  useEffect(() => {
    getUser()
  }, [])

  const getInitial = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };







  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        {/* {userData && userData?.avatar ? <CAvatar src={userData?.avatar?.url} size="md" /> : userData?.name ? <p>{userData?.name}</p> :
          <CAvatar src={userImage} size="md" />} */}

        {userData && userData?.avatar ? (
          <CAvatar src={userData?.avatar?.url} size="md" />
        ) : userData && userData?.name ? (
          <CAvatar size="md" style={avatarStyle}>
            {getInitial(userData?.name)}
          </CAvatar>
        ) : (
          <CAvatar src={userImage} size="md" />
        )}
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Account</CDropdownHeader>
        <CDropdownItem href="#">
       
        </CDropdownItem>
        {/* <CDropdownDivider /> */}
        <Link to='/profile/edit'>
          <CDropdownItem>
            <CIcon icon={cilUser} className="me-2" />
            Edit Profile
          </CDropdownItem>
        </Link>
        <Link to='/change_password'>
          <CDropdownItem>
            <CIcon icon={cilPencil} className="me-2" />
            Change Password
          </CDropdownItem>
        </Link>
        <CDropdownItem href="#">
          <CIcon icon={cilLockLocked} className="me-2" />
          <span onClick={signout}>Log Out</span>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
