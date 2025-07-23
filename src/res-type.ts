// Type definitions
export interface Payment {
  checkNumber: number;
  checkAmount: number;
  clearDate: number;
  issueDate: number;
  checkStatus: string;
  vendorId: number;
}

export interface ValidationResult {
  key: string;
  isValid: boolean;
}

export interface ErrorDetail {
  key: string;
  path: string;
  message: string;
  code: string;
}

export interface UploadResponse {
  results: {
    data: Payment[];
    batchId: string;
    completedTimestamp: string;
  };
  error?: { message: string; code: string };
}

export interface ValidationResponse {
  results: {
    batchId: string;
    completedTimestamp: string;
    validation: ValidationResult[];
    errors?: ErrorDetail[];
  };
  request: { data: Payment[] };
}

export interface SubmitResponse {
  results: {
    batchId: string;
    completedTimestamp: string;
    validation: ValidationResult[];
    errors?: ErrorDetail[];
  };
  request: { data: Payment[] };
}
