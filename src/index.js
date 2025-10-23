import "@coreui/coreui/dist/css/coreui.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./index.css";
import "react-app-polyfill/stable";
import "core-js";
import React from "react";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import axios from "axios";
import { store } from "./redux/store";

import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import { CustomerProvider } from "./views/CustomerSupport/CustomerContext";
import { PlanProvider } from "./views/Plans/PlanContext";
import { LinkedinProvider } from "./views/Linkiedin/LinkedenContext";
import { LeedsProvider } from "./views/Leeds/LeedsContext";

const setupAxios = () => {
  // axios.defaults.baseURL = "http://localhost:5000";

  // latest App deploy
  axios.defaults.baseURL = " https://selliender-api.onrender.com";

  // axios.defaults.baseURL = "https://frameji-api.onrender.com";

  axios.defaults.headers = {
    "Cache-Control": "no-cache,no-store",
    Pragma: "no-cache",
    Expires: "0",
  };
};

setupAxios();
const domNode = document.getElementById("root");
const root = createRoot(domNode);

root.render(
  <Provider store={store}>
    <LinkedinProvider>
    <LeedsProvider>
    <PlanProvider>
    <CustomerProvider>
      <App />
      <Toaster />
     
    </CustomerProvider>
     </PlanProvider>
     </LeedsProvider>
     </LinkedinProvider>
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
