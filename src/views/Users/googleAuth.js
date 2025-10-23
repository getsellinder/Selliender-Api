import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import React from "react";

const GoogleAuth = () => {
  // const googleAuth=()=>
  const responsGoogle = async (authResult) => {
    try {
        console.log("authResult.code",authResult.code)
    //   if (authResult.code) {
    //  const result = await axios.get(`/api/v1/google/callback?code=${authResult.code}`);
    //        const {  email, name, avatar} = result.data.user;
    //       console.log("result.data.user", result.data.user);
    //   console.log("google login successfully");
    //   }
     console.log(authResult);
    } catch (error) {
    console.error("Error while requesting google code", error);
    }
  };
  const goggleLogin = useGoogleLogin({
    onSuccess: responsGoogle,
    onError: responsGoogle,
    flow: "auth-code",
  });
  return (
    <div className="App">
      <button onClick={goggleLogin}>Login with google</button>
    </div>
  );
};

export default GoogleAuth;
