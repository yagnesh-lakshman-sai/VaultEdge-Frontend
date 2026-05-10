import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

export const transferFunds = (data) => {
  return axiosInstance.post(ENDPOINTS.TRANSFER.SEND, data);
};
