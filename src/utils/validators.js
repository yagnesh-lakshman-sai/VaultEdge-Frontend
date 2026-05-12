export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  return hasSpecialChar;
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidOtp = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

export const isValidAmount = (amount) => {
  return amount && Number(amount) > 0;
};

export const isValidLoanAmount = (amount) => {
  const num = Number(amount);
  return num >= 10000 && num <= 10000000;
};

export const isValidTenure = (tenure) => {
  const num = Number(tenure);
  return num >= 1 && num <= 360;
};

export const isRequired = (value) => {
  return (
    value !== null && value !== undefined && value.toString().trim() !== ""
  );
};

export const isValidPurpose = (purpose) => {
  return purpose && purpose.trim().length >= 10;
};
