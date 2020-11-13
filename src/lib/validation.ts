// Validation helper file
// exports any helper related things with regards to custom validation in the models

export enum VALIDATION_MESSAGES {
  EVENT_REQUIRED_VALIDATION_ERROR = 'At least one event is required',
  DATE_VALIDATION_ERROR = 'Date is not valid',
  RESULT_RANK_VALIDATION_ERROR = 'Rank must be greater >= 0',
  URL_VALIDATION_ERROR_NO_KEY = 'URL not valid',
}

export const generateValidationMessage = (
  field: string,
  msg: VALIDATION_MESSAGES,
): string => `Field: ${field} | ${msg}`;
