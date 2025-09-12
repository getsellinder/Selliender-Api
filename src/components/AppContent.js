// // import React, { Suspense, useEffect, useState } from "react";
// // import { Navigate, Route, Routes } from "react-router-dom";
// // import { CContainer, CSpinner } from "@coreui/react";

// // // routes config
// // import routes from "../routes";
// // import { isAutheticated } from "src/auth";
// // import axios from "axios";
// // import toast from "react-hot-toast";
// // const AppContent = () => {
// //   const [userper, setuserper] = useState(null);
// //   const token = isAutheticated();

// //   useEffect(() => {
// //     const getUser = async () => {
// //       let existanceData = localStorage.getItem("authToken");
// //       if (!existanceData) {
// //         setuserper(null);
// //       } else {
// //         try {
// //           let response = await axios.get(`/api/v1/user/details`, {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //             },
// //           });
// //           const data = response?.data;
// //           if (
// //             data?.success &&
// //             (data?.user?.role === "admin" )
// //           ) {
// //             setuserper(data?.user);
// //           } else {
// //             setuserper(null);
// //           }
// //         } catch (err) {
// //           setuserper(null);
// //           console.log(err);
// //         }
// //       }
// //     };
// //     getUser();
// //   }, []);
// //   const [appRoutes, setAppRoutes] = useState(routes);
// //   return (
// //     <CContainer lg>
// //       <Suspense fallback={<CSpinner color="primary" />}>
// //         <Routes>
// //           {appRoutes.map((route, idx) => {
// //             if (
// //               userper?.role === "admin" || 
// //               route.navName?.trim() === "" ||
// //               (userper?.accessTo && userper?.accessTo[route?.navName] === true)
// //             ) {
// //               return (
// //                 route.element && (
// //                   <Route
// //                     key={idx}
// //                     path={route.path}
// //                     exact={route.exact}
// //                     name={route.name}
// //                     element={<route.element />}
// //                   />
// //                 )
// //               );
// //             }
// //           })}
// //           <Route path="/" element={<Navigate to="dashboard" replace />} />
// //         </Routes>
// //       </Suspense>
// //     </CContainer>
// //   );
// // };

// // export default React.memo(AppContent);
// import React, { Suspense, useEffect, useState } from "react";
// import { Navigate, Route, Routes } from "react-router-dom";
// import { CContainer, CSpinner } from "@coreui/react";

// // routes config
// import routes from "../routes";
// import { isAutheticated } from "src/auth";
// import axios from "axios";
// import toast from "react-hot-toast";

// const AppContent = () => {
//   const [userper, setuserper] = useState(null);
//   const token = isAutheticated();

//   useEffect(() => {
//     const getUser = async () => {
//       let existanceData = localStorage.getItem("authToken");
//       if (!existanceData) {
//         setuserper(null);
//       } else {
//         try {
//           let response = await axios.get(`/api/v1/user/details`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
//           const data = response?.data;
//           if (
//             data?.success &&
//             (data?.user?.role === "admin" || data?.user?.role === "Employee")
//           ) {
//             setuserper(data?.user);
//           } else {
//             setuserper(null);
//           }
//         } catch (err) {
//           setuserper(null);
//           console.log(err);
//         }
//       }
//     };
//     getUser();
//   }, []);

//   const [appRoutes, setAppRoutes] = useState(routes);

//   // Define allowed routes for Employee users under Product Management
//   const allowedEmployeeRoutes = ["Product Management"];

//   return (
//     <CContainer lg>
//       <Suspense fallback={<CSpinner color="primary" />}>
//         <Routes>
//           {appRoutes.map((route, idx) => {
//             // Allow access for:
//             // 1. Admin users with accessTo permission for the route
//             // 2. Employee users for specific Product Management routes
//             // 3. Routes with empty navName
//             if (
//               (userper?.role === "admin" &&
//                 userper?.accessTo &&
//                 userper?.accessTo[route?.navName] === true) ||
//               (userper?.role === "Employee" &&
//                 allowedEmployeeRoutes.includes(route?.navName)) ||
//               route.navName?.trim() === ""
//             ) {
//               return (
//                 route.element && (
//                   <Route
//                     key={idx}
//                     path={route.path}
//                     exact={route.exact}
//                     name={route.name}
//                     element={<route.element />}
//                   />
//                 )
//               );
//             }
//             return null;
//           })}
//           <Route path="/" element={<Navigate to="dashboard" replace />} />
//         </Routes>
//       </Suspense>
//     </CContainer>
//   );
// };

// export default React.memo(AppContent);

import React, { Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CContainer, CSpinner } from "@coreui/react";

// routes config
import routes from "../routes";
import { isAutheticated } from "src/auth";
import axios from "axios";
import toast from "react-hot-toast";

const AppContent = () => {
  const [userper, setuserper] = useState(null);
  const token = isAutheticated();

  useEffect(() => {
    const getUser = async () => {
      let existanceData = localStorage.getItem("authToken");
      if (!existanceData) {
        setuserper(null);
      } else {
        try {
          let response = await axios.get(`/api/v1/user/details`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = response?.data;
          if (
            data?.success &&
            (data?.user?.role === "admin" || data?.user?.role === "Employee")
          ) {
            setuserper(data?.user);
          } else {
            setuserper(null);
          }
        } catch (err) {
          setuserper(null);
          console.log(err);
        }
      }
    };
    getUser();
  }, []);

  const [appRoutes, setAppRoutes] = useState(routes);

  // Define allowed routes for Employee users under Product Management
  const allowedEmployeeRoutes = ["Product Management","Settings","Customer Service","Customers","Orders"];

  return (
    <CContainer lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {appRoutes.map((route, idx) => {
            // Allow access for:
            // 1. Admin users (unrestricted access to all routes)
            // 2. Employee users for specific Product Management routes
            // 3. Routes with empty navName
            if (
              userper?.role === "admin" || // Admin has access to all routes
              (userper?.role === "Employee" &&
                allowedEmployeeRoutes.includes(route?.navName)) ||
              route.navName?.trim() === ""
            ) {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              );
            }
            return null;
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);