import axios from "axios";

const BASE_URL = "http://localhost:3000"; // Your backend URL

export const api = axios.create({
  baseURL: BASE_URL,
});

// Add token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
