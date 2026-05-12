export const API_BASE_URL = "http://localhost:8080";

export const TOKEN_KEY = "smartbank_token";
export const USER_KEY = "smartbank_user";

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
};

export const ACCOUNT_TYPES = {
  SAVINGS: "SAVINGS",
  CURRENT: "CURRENT",
  FIXED_DEPOSIT: "FIXED_DEPOSIT",
};

export const ACCOUNT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  FROZEN: "FROZEN",
  CLOSED: "CLOSED",
};

export const LOAN_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  DISBURSED: "DISBURSED",
  ACTIVE: "ACTIVE",
  PAID: "PAID",
  REJECTED: "REJECTED",
  DEFAULTED: "DEFAULTED",
};

export const TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  TRANSFER_DEBIT: "TRANSFER_DEBIT",
  TRANSFER_CREDIT: "TRANSFER_CREDIT",
  LOAN_DISBURSEMENT: "LOAN_DISBURSEMENT",
  LOAN_REPAYMENT: "LOAN_REPAYMENT",
  INTEREST_CREDIT: "INTEREST_CREDIT",
  FEE_DEBIT: "FEE_DEBIT",
};

export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    VERIFY_OTP: "/api/auth/verify-otp",
    LOGIN: "/api/auth/login",
    RESEND_OTP: "/api/auth/resend-otp",
  },

  ACCOUNTS: {
    CREATE: "/api/accounts",
    GET_ALL: "/api/accounts",
    GET_BY_NUMBER: (accountNumber) => `/api/accounts/${accountNumber}`,
  },

  LOANS: {
    APPLY: "/api/loans",
    GET_ALL: "/api/loans",
    GET_BY_ID: (loanId) => `/api/loans/${loanId}`,
    GET_BY_NUMBER: (loanNumber) => `/api/loans/number/${loanNumber}`,
  },

  ADMIN: {
    PENDING_LOANS: "/api/admin/loans/pending",
    GET_BY_STATUS: (status) => `/api/admin/loans?status=${status}`,
    GET_ALL: "/api/admin/loans/all",
    APPROVE: (loanId) => `/api/admin/loans/${loanId}/approve`,
    REVIEW: (loanId) => `/api/admin/loans/${loanId}/review`,
    GET_BY_ID: (loanId) => `/api/admin/loans/${loanId}`,
  },

  TRANSACTIONS: {
    GET_ALL: (accountNumber) => `/api/transactions/${accountNumber}`,
    GET_RECENT: (accountNumber) => `/api/transactions/${accountNumber}/recent`,
    GET_RANGE: (accountId) => `/api/transactions/${accountId}/range`,
  },

  TRANSFER: {
    SEND: "/api/transfer",
  },
};
