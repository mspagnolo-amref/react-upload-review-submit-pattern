import {
  Payment,
  SubmitResponse,
  UploadResponse,
  ValidationResponse,
} from "./res-type";

// Mock API functions
export const createResponse = <T>(status: number, body: T): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export const mockPayments: Payment[] = [
  {
    checkNumber: 1001,
    checkAmount: 111.0,
    clearDate: Date.now(),
    issueDate: Date.now() - 86400000,
    checkStatus: "O",
    vendorId: 900,
  },
  {
    checkNumber: 1002,
    checkAmount: 555.0,
    clearDate: Date.now(),
    issueDate: Date.now() - 86400000,
    checkStatus: "O",
    vendorId: 800,
  },
  {
    checkNumber: 1003,
    checkAmount: 423.0,
    clearDate: Date.now(),
    issueDate: Date.now() - 86400000,
    checkStatus: "O",
    vendorId: 700,
  },
];

export const mockUploadSuccess = async (): Promise<Response> => {
  const response: UploadResponse = {
    results: {
      data: mockPayments,
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
    },
  };
  return createResponse(200, response);
};

export const mockUploadFailure = async (): Promise<Response> => {
  const response = {
    error: { message: "No CSV File Exists", code: "ERROR_ACCESSING_FILE" },
  };
  return createResponse(400, response);
};

export const mockValidateSuccess = async (): Promise<Response> => {
  const response: ValidationResponse = {
    results: {
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
      validation: [
        { key: "1001", isValid: true },
        { key: "1002", isValid: true },
        { key: "1003", isValid: true },
      ],
    },
    request: { data: mockPayments },
  };
  return createResponse(200, response);
};

export const mockValidateFailure = async (): Promise<Response> => {
  const response: ValidationResponse = {
    results: {
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
      validation: [
        { key: "1001", isValid: false },
        { key: "1002", isValid: true },
        { key: "1003", isValid: false },
      ],
      errors: [
        {
          key: "1001",
          path: "checkNumber",
          message: "Invalid check number format",
          code: "INVALID_CHECK_NUMBER",
        },
        {
          key: "1001",
          path: "checkStatus",
          message: "Check status must be O",
          code: "INVALID_STATUS",
        },
      ],
    },
    request: { data: mockPayments },
  };
  return createResponse(400, response);
};

export const mockSubmitSuccess = async (): Promise<Response> => {
  const response: SubmitResponse = {
    results: {
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
      validation: [
        { key: "1001", isValid: true },
        { key: "1002", isValid: true },
        { key: "1003", isValid: true },
      ],
    },
    request: { data: mockPayments },
  };
  return createResponse(201, response);
};

export const mockSubmitFailure = async (): Promise<Response> => {
  const response: SubmitResponse = {
    results: {
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
      validation: [
        { key: "1001", isValid: true },
        { key: "1002", isValid: true },
        { key: "1003", isValid: false },
      ],
      errors: [
        {
          key: "1003",
          path: "checkStatus",
          message: "Check status must be O",
          code: "INVALID_STATUS",
        },
      ],
    },
    request: { data: mockPayments },
  };
  return createResponse(400, response);
};
