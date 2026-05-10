import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { getToken, clearStorage } from "../utils/storage";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        clearStorage();

        window.location.href = "/login";
      }

      if (status === 403) {
        console.error("Access denied - insufficient permissions");
      }

      if (status === 404) {
        console.error("Resource not found");
      }

      if (status === 500) {
        console.error("Server error - Spring Boot crashed");
      }
    } else if (error.request) {
      console.error("Cannot connect to server - is Spring Boot running?");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
