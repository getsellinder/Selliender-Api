import { jwtDecode } from "jwt-decode";
import { isAutheticated } from "./auth";

export const getUser = () => {
  const token = isAutheticated();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token", err);
    return null;
  }
};
