import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

export const registerUser = (data) => {
  return axiosInstance.post(ENDPOINTS.AUTH.REGISTER, data);
};

export const verifyOtp = (data) => {
  return axiosInstance.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
};

export const loginUser = (data) => {
  return axiosInstance.post(ENDPOINTS.AUTH.LOGIN, data);
};

export const resendOtp = (data) => {
  return axiosInstance.post(ENDPOINTS.AUTH.RESEND_OTP, data);
};
