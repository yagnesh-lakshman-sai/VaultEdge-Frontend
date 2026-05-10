import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

export const applyLoan = (data) => {
  return axiosInstance.post(ENDPOINTS.LOANS.APPLY, data);
};

export const getAllLoans = () => {
  return axiosInstance.get(ENDPOINTS.LOANS.GET_ALL);
};

export const getLoanById = (loanId) => {
  return axiosInstance.get(ENDPOINTS.LOANS.GET_BY_ID(loanId));
};

export const getLoanByNumber = (loanNumber) => {
  return axiosInstance.get(ENDPOINTS.LOANS.GET_BY_NUMBER(loanNumber));
};
