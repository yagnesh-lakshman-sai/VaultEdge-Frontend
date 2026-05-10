import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

export const getAllTransactions = (accountNumber) => {
  return axiosInstance.get(ENDPOINTS.TRANSACTIONS.GET_ALL(accountNumber));
};

export const getRecentTransactions = (accountNumber) => {
  return axiosInstance.get(ENDPOINTS.TRANSACTIONS.GET_RECENT(accountNumber));
};

export const getTransactionsByRange = (accountId, startDate, endDate) => {
  return axiosInstance.get(ENDPOINTS.TRANSACTIONS.GET_RANGE(accountId), {
    params: { startDate, endDate },
  });
};
