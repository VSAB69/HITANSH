import axios from "axios";

// This is the Axios configuration you provided.
const baseURL = "http://127.0.0.1:8000/";

const AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true, // Important for auth
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

export default AxiosInstance;
