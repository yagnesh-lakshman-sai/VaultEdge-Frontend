import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

export const getPendingLoans = () => {
  return axiosInstance.get(ENDPOINTS.ADMIN.PENDING_LOANS);
};

export const getLoansByStatus = (status) => {
  return axiosInstance.get(ENDPOINTS.ADMIN.GET_BY_STATUS(status));
};
export const getAllLoansAdmin = () => {
  return axiosInstance.get(ENDPOINTS.ADMIN.GET_ALL);
};

export const approveLoan = (loanId, data) => {
  return axiosInstance.put(ENDPOINTS.ADMIN.APPROVE(loanId), data);
};

export const markLoanUnderReview = (loanId) => {
  return axiosInstance.put(ENDPOINTS.ADMIN.REVIEW(loanId));
};

export const getLoanByIdAdmin = (loanId) => {
  return axiosInstance.get(ENDPOINTS.ADMIN.GET_BY_ID(loanId));
};
