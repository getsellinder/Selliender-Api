import React from "react";
import CIcon from "@coreui/icons-react";
import { TbDeviceIpadMinus } from "react-icons/tb";

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
  // cisMicSettings,
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
  // {
  //   component: CNavItem,
  //   name: "Reports",
  //   to: "/reports",
  //   icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
  //   group: "",
  // },
  {
    component: CNavItem,
    name: "Customers",
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    to: "/customers-details",
    group: "Customers",
  },

  {
        component: CNavItem,
        name: "Genres",
        icon: <CIcon icon={cilPlaylistAdd} customClassName="nav-icon" />,
        to: "/genres",
        group: "Product Management",
      },
       {
        component: CNavItem,
        name: "Sub Genre",

        icon: <CIcon icon={cibLibreoffice} customClassName="nav-icon" />,
        to: "/subgenre",
        group: "Product Management",
      },
      //   {
      //   component: CNavItem,
      //   name: "googleLogin",

      //   icon: <CIcon icon={cibLibreoffice} customClassName="nav-icon" />,
      //   to: "/google/login",
      //   group: "Product Management",
      // },
        {
        component: CNavItem,
        name: "Title",
        icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
        to: "/title",
        group: "Product Management",
      },
        {
        component: CNavItem,
        name: "Episode",
        icon: <CIcon  icon={cilHeadphones} customClassName="nav-icon" />,
        to: "/episode/",
        group: "Product Management",
      },
       {
        component: CNavItem,
        name: "Trending",
        icon: <CIcon  icon={cilLoopCircular} customClassName="nav-icon" />,
        to: "/Trending",
        group: "Product Management",
      },
      //   {
      //   component: CNavItem,
      //   name: "Packages",
      //   icon: <CIcon icon={cilColorBorder} customClassName="nav-icon" />,
      //   to: "/chapters",
      //   group: "Product Management",
      // },

       



  // {
  //   Trending
  // component: CNavGroup,
  //   name: "Product Management",
  //   icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  //   group: "",

  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Genres",
  //       icon: <CIcon icon={cilPlaylistAdd} customClassName="nav-icon" />,
  //       to: "/genres",
  //       group: "Product Management",
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Subgenre",

  //       icon: <CIcon icon={cibLibreoffice} customClassName="nav-icon" />,
  //       to: "/subjects",
  //       group: "Product Management",
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Chapters",
  //       icon: <CIcon icon={cilColorBorder} customClassName="nav-icon" />,
  //       to: "/chapters",
  //       group: "Product Management",
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Deleted Chapters",
  //       icon: <CIcon icon={cilActionUndo} customClassName="nav-icon" />,
  //       to: "/deleteChapterData",
  //       group: "Product Management",
  //     },
  //      {
  //       component: CNavItem,
  //       name: "Title",
  //       icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
  //       to: "/series",
  //       group: "Product Management",
  //     },

  //     {
  //       component: CNavItem,
  //       name: "AdminSeriesDashboard",
  //       icon: <CIcon icon={cilFeaturedPlaylist} customClassName="nav-icon" />,
  //       to: "/AdminSeriesDashboard",
  //       group: "Product Management",
  //     },

  //     //  {
  //     //   component: CNavItem,
  //     //   name: "Season",
  //     //   icon: <CIcon icon={cilTv} customClassName="nav-icon" />,
  //     //   to: "/season",
  //     //   group: "Product Management",
  //     // },
  //     {
  //       component: CNavItem,
  //       name: "Episode",
  //       icon: <CIcon  icon={cilHeadphones} customClassName="nav-icon" />,
  //       to: "/episode",
  //       group: "Product Management",
  //     },
      

  //     // Series{
  //     //   component: CNavItem,
  //     //   name: "Collections",
  //     //   icon: <CIcon icon={cilPaperclip} customClassName="nav-icon" />,
  //     //   to: "/collections",
  //     //   group: "Product Management",
  //     // },

  //     // {
  //     //   component: CNavItem,
  //     //   name: "Color",
  //     //   icon: <CIcon icon={cilColorPalette} customClassName="nav-icon" />,
  //     //   to: "/color",
  //     //   group: "Product Management",
  //     // },

  //     {
  //       component: CNavItem,
  //       name: "GST",
  //       icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
  //       to: "/gst",
  //       group: "Product Management",
  //     },
  //   ],
  // },
  
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
      // {
      //   component: CNavItem,
      //   name: "Contact Requests",
      //   icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
      //   to: "/contact/request",
      //   group: "Customer Service",
      // },






      // {
      //   component: CNavItem,
      //   name: "Email CMS",
      //   icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
      //   to: "/email-cms",
      // },
    ],
  },
  // //Blog start
  // {
  //   component: CNavItem,
  //   name: "Blog",
  //   icon: <CIcon icon={cilImagePlus} customClassName="nav-icon" />,
  //   to: "/blogs",
  //   group: "Blog",
  // },
  // Employee
  {
    component: CNavItem,
    name: "Employees & Access",
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
    to: "/employee",
    group: "Employees & Access",
  },
  // //Point of Sale start
  // {
  //   component: CNavItem,
  //   name: "Point of Sale",
  //   icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  //   to: "/pos",
  //   group: "Point of Sale",
  // },
  // {
  //   component: CNavGroup,
  //   name: "Blog",
  //   icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Blog",
  //       icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  //       to: "/blogs",
  //     },
  //   ],
  // },
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
      // {
      //   component: CNavItem,
      //   name: "Currency",
      //   icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      //   to: "/currency",
      //   group: "Settings",
      // },
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
      // {
      //   component: CNavItem,
      //   name: "Home",
      //   icon: <CIcon icon={cilFeaturedPlaylist} customClassName="nav-icon" />,
      //   to: "/home",
      //   group: "Settings",
      // },
      // {
      //   component: CNavItem,
      //   name: "Comments",
      //   icon: <CIcon icon={cilLoopCircular} customClassName="nav-icon" />,
      //   to: "/reviewsStatus",
      //   group: "Settings",
      // },
    ],
  },
];

export default _nav;
