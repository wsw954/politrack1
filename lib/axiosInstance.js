// /lib/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "", // Optional but clean
  withCredentials: true, // Send session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
