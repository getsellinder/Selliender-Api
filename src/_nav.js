import React from "react";
import CIcon from "@coreui/icons-react";
import { TbDeviceIpadMinus } from "react-icons/tb";
import { FiLinkedin } from "react-icons/fi";
import { cibLinkedin } from "@coreui/icons";
import { cilBriefcase } from "@coreui/icons";


import {
  cibMaterialDesign,
  cilAddressBook,
  cilAppsSettings,
  cilBrush,
  cilCart,
  cilHeadphones,
  cilCat,
  cilClipboard,
  cilCommand,
  cilCompress,
  cilContact,
  cilImage,
  cilLanguage,
  cilLoopCircular,
  cilMedicalCross,
  cilNotes,
  cilSpeedometer,
  cilTv,

  cilTablet,
  cilText,
  cilUser,
  cilAlarm,
  cilFeaturedPlaylist,
  cilLocationPin,
  cilSettings,
  cilMoney,
  cilColorBorder,
  cilColorPalette,
  cilGroup,
  cilUserPlus,
  cilPaperclip,
  cilCommentBubble,
  cilImagePlus,
  cilBadge,
  cibCplusplus,
  cibAboutMe,
  cibAddthis,
  cibAdguard,
  cibAlgolia,
  cibExpertsExchange,
  cibProtonmail,
  cibProtoIo,
  cilPlaylistAdd,
  cilChatBubble,
  cilPeople,
  cibCodeship,
  cibC,
  cibCoffeescript,
  cilCopy,
  cilCircle,
  cil3d,
  cilApps,
  cilGraph,
  cilActionUndo,
  cilObjectUngroup,
  cibLibreoffice,
   

} from "@coreui/icons";
import {
  CListGroup,

  CNavGroup,
  CNavItem,
  CNavTitle,
  CTabContent,
} from "@coreui/react";

const _nav = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    group: "",
  },
 
  {
    component: CNavItem,
    name: "Customers",
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    to: "/customers-details",
    group: "Customers",
  },

  {
    component: CNavItem,
    name: "Pricing Plans",
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    to: "/Pricing-Plans",
    group: "Plans",
  },

  
 
      
     
      
      
     
     
  {

    component: CNavGroup,
    name: "Customer Service",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    group: "",

    items: [
      {
        component: CNavItem,
        name: "Customer Support",
        icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
        to: "/support/request",
        group: "Customer Service",
      },
       
     
    ],
  },

    {
        component: CNavItem,
        name: "Usage",
        icon: <CIcon icon={cibLinkedin} customClassName="nav-icon"  />,
        to: "/Usage",
        group: "Customer Service",
      },

       {
        component: CNavItem, 
        name: "Leeds",
        icon: <CIcon icon={cilBriefcase} customClassName="nav-icon"  />,
        to: "/leeds",
        group: "Customer Service",
      },
 
    
  {
    component: CNavItem,
    name: "Employees & Access",
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
    to: "/employee",
    group: "Employees & Access",
  },
 
  {
    component: CNavGroup,
    name: "Settings",
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    group: "",

    items: [
      {
        component: CNavItem,
        name: "Banner",
        icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
        to: "/banner",
        group: "Settings",
      },
     
      {
        component: CNavItem,
        name: "Content ",
        icon: <CIcon icon={cilText} customClassName="nav-icon" />,
        to: "/content",
        group: "Settings",
      },
            {
        component: CNavItem,
        name: "GST",
        icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
        to: "/gst",
        group: "Product Management",
      },
      {
        component: CNavItem,
        name: "Social Media",
        icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
        to: "/socialmedia",
        group: "Settings",
      },
    
      {
        component: CNavItem,
        name: "Application Name",
        icon: <CIcon icon={cilText} customClassName="nav-icon" />,
        to: "/application/name",
        group: "Settings",
      },

      {
        component: CNavItem,
        name: "Address",
        icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
        to: "/address",
        group: "Settings",
      },
      {
        component: CNavItem,
        name: "Logos",
        icon: <CIcon icon={cilCommand} customClassName="nav-icon" />,
        to: "/logo",
        group: "Settings",
      },
      {
        component: CNavItem,
        name: "Copyright Message",
        icon: <CIcon icon={cilLanguage} customClassName="nav-icon" />,
        to: "/copyright/message",
        group: "Settings",
      },
    
    ],
  },
];

export default _nav;
