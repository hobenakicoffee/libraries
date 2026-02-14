const BANGLADESHI_MOBILE_NUMBER_PATTERN = /^(?:\+?88)?01[3-9]\d{8}$/;

export function validatePhoneNumber(phoneNumber: string) {
  const normalizedMobileNumber = phoneNumber.replace(/[\s-]/g, "");
  return BANGLADESHI_MOBILE_NUMBER_PATTERN.test(normalizedMobileNumber);
}
