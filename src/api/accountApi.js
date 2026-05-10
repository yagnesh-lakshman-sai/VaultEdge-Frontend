import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "../utils/constants";

export const createAccount = (data) => {
  return axiosInstance.post(ENDPOINTS.ACCOUNTS.CREATE, data);
};

const handleCreateAccount = async () => {
  await createAccount({ type: selectedType });
  loadDashboardData();
};

export const getAllAccounts = () => {
  return axiosInstance.get(ENDPOINTS.ACCOUNTS.GET_ALL);
};

export const getAccountByNumber = (accountNumber) => {
  return axiosInstance.get(ENDPOINTS.ACCOUNTS.GET_BY_NUMBER(accountNumber));
};
