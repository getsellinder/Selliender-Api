import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CCloseButton,
  CSpinner
} from "@coreui/react";
import CIcon from "@coreui/icons-react";

import { AppSidebarNav } from "./AppSidebarNav";

import { logoNegative } from "src/assets/brand/logo-negative";
import { sygnet } from "src/assets/brand/sygnet";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

// sidebar nav config
import navigation from "../_nav";
import { isAutheticated } from "src/auth";
import axios from "axios";
import { Link } from "react-router-dom";
import { toggleChange, toggleUnfold } from "src/redux/reducers/toggler";

const AppSidebar = () => {
  const dispatch = useDispatch();

  const unfoldable = useSelector((state) => state.header.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.header.sidebarShow);

  const [navigationItem, setNavigationItem] = useState([]);
  const [isNavigationLoading, setIsNavigationLoading] = useState(true);

  const [userdata, setUserData] = useState(null);
  const token = isAutheticated();

  useEffect(() => {
    const getUser = async () => {
      let existanceData = localStorage.getItem("authToken");
      if (!existanceData) {
        setUserData(false);
        setIsNavigationLoading(false);
      } else {
        try {
          let response = await axios.get(`/api/v1/user/details`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response.data;
          if (
            (data.success && data.user.role === "admin") ||
            data.user.role === "Employee"
          ) {
            setUserData(data.user);
          } else {
            setUserData(false);
          }
        } catch (err) {
          setUserData(false);
          console.log(err);
        } finally {
          setIsNavigationLoading(false);
        }
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!isNavigationLoading) {
      if (userdata && userdata.role === "Employee") {
        // For employees, include Dashboard and Product Management with all its sub-items
        const allowedItems = ["Dashboard", "Product Management","Settings","Customer Service","Customers","Orders"];
        const filteredNavigation = navigation.filter((item) =>
          allowedItems.includes(item.name)
        );
        setNavigationItem(filteredNavigation);
      } else if (userdata && userdata.role === "admin" && userdata.accessTo) {
        // For admins, filter based on accessTo permissions
        const filteredNavigation = navigation
          .filter((item) => {
            if (item.component === "CNavGroup") {
              // For groups like Product Management, check if any sub-item is accessible
              return item.items.some((subItem) => userdata.accessTo[subItem.name]);
            }
            return userdata.accessTo[item.name];
          })
          .map((item) => {
            if (item.component === "CNavGroup") {
              // Filter sub-items in groups
              return {
                ...item,
                items: item.items.filter((subItem) => userdata.accessTo[subItem.name])
              };
            }
            return item;
          });
        setNavigationItem(filteredNavigation);
      } else {
        // Default case: show all navigation items if no specific restrictions
        setNavigationItem(navigation);
      }
    }
  }, [userdata, isNavigationLoading]);

  const [loading, setLoading] = useState(false);

  // urlcreated images
  const [AppName, setAppName] = useState("");
  const [HeaderlogoUrl, setHeaderlogoUrl] = useState("");
  const [FooterlogoUrl, setFooterlogoUrl] = useState("");
  const [AdminlogoUrl, setAdminlogoUrl] = useState("");

  useEffect(() => {
    async function getConfiguration() {
      const configDetails = await axios.get(`/api/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppName(configDetails.data.result[0]?.appName);
      configDetails.data.result.map((item) => {
        setHeaderlogoUrl(item?.logo[0]?.Headerlogo);
        setFooterlogoUrl(item?.logo[0]?.Footerlogo);
        setAdminlogoUrl(item?.logo[0]?.Adminlogo);
      });
    }
    getConfiguration();
  }, []);

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch(toggleChange(visible))
      }}
    >
      <CSidebarBrand
        to="/"
      >
        {AdminlogoUrl ? (
          <>
            <Link to="/dashboard" className="bg-warning">
              <img src={AdminlogoUrl} alt="" width="100%" />
            </Link>
            <CCloseButton className="d-lg-none mx-2" white onClick={() => dispatch(toggleChange(false))} />
          </>
        ) : { AppName } ? (
          <div>
             <h5 className="sidebar-brand" style={{fontSize:"1.5rem"}}>Sellinder</h5>
          </div>
         
        ) : (
          ""
        )}
        <CIcon className="sidebar-brand-narrow" icon={sygnet} height={35} />
      </CSidebarBrand>

      <CSidebarNav>
        <SimpleBar>
          {isNavigationLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <CSpinner color="primary" />
            </div>
          ) : (
            <AppSidebarNav items={navigationItem} />
          )}
        </SimpleBar>
      </CSidebarNav>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);