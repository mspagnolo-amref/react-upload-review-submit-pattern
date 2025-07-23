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


export const mockUploadFailure = async (): Promise<Response> => {
  const response = {
    error: { message: "No CSV File Exists", code: "ERROR_ACCESSING_FILE" },
  };
  return createResponse(400, response);
};


export const mockUploadSuccess = async (): Promise<Response> => {
  // Fetch the CSV file from public folder
  const csvUrl = "/mockPayments.csv";
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error("CSV file not found");
    const text = await res.text();
    // Simple CSV parser (assumes no commas in fields)
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const data: Payment[] = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => {
        let v: any = values[i];
        if (["checkNumber", "vendorId"].includes(h)) v = Number(v);
        if (["checkAmount"].includes(h)) v = parseFloat(v);
        if (["clearDate", "issueDate"].includes(h)) v = Number(v);
        obj[h] = v;
      });
      return obj as Payment;
    });
    const response: UploadResponse = {
      results: {
        data,
        batchId: "BATCH-123456",
        completedTimestamp: new Date().toISOString(),
      },
    };
    return createResponse(200, response);
  } catch (e) {
    return createResponse(400, { error: { message: "No CSV File Exists", code: "ERROR_ACCESSING_FILE" } });
  }
};


// --- Realistic Validation Mock ---
export const validationMock = async (data: Payment[]): Promise<Response> => {
  const validation: ValidationResult[] = [];
  const errors: ValidationError[] = [];
  data.forEach((payment) => {
    const result = validatePayment(payment);
    validation.push({ key: payment.checkNumber.toString(), isValid: result.isValid });
    errors.push(...result.errors);
  });
  const allValid = validation.every((v) => v.isValid);
  const response: ValidationResponse = {
    results: {
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
      validation,
      ...(errors.length > 0 ? { errors } : {}),
    },
    request: { data },
  };
  return createResponse(200 , response);
};


// --- Realistic Validation Mock ---
export const submitMock = async (data: Payment[]): Promise<Response> => {
  const validation: ValidationResult[] = [];
  const errors: ValidationError[] = [];
  data.forEach((payment) => {
    const result = validatePayment(payment);
    validation.push({ key: payment.checkNumber.toString(), isValid: result.isValid });
    errors.push(...result.errors);
  });
  const allValid = validation.every((v) => v.isValid);
  const response: ValidationResponse = {
    results: {
      batchId: "BATCH-123456",
      completedTimestamp: new Date().toISOString(),
      validation,
      ...(errors.length > 0 ? { errors } : {}),
    },
    request: { data },
  };
  return createResponse(allValid ? 200 : 400, response);
};


// --- Validation Utilities ---
type ValidationResult = { key: string; isValid: boolean };
type ValidationError = { key: string; path: string; message: string; code: string };

function validateCheckNumber(payment: Payment): ValidationError | null {
  // Example: checkNumber must be a 4-digit number
  if (!/^\d{4}$/.test(payment.checkNumber.toString())) {
    return {
      key: payment.checkNumber.toString(),
      path: "checkNumber",
      message: "Check number must be a 4-digit number",
      code: "INVALID_CHECK_NUMBER",
    };
  }
  return null;
}

function validateCheckAmount(payment: Payment): ValidationError | null {
  if (typeof payment.checkAmount !== "number" || payment.checkAmount <= 0) {
    return {
      key: payment.checkNumber.toString(),
      path: "checkAmount",
      message: "Check amount must be greater than 0",
      code: "INVALID_AMOUNT",
    };
  }
  return null;
}

function validateCheckStatus(payment: Payment): ValidationError | null {
  if (payment.checkStatus !== "O") {
    return {
      key: payment.checkNumber.toString(),
      path: "checkStatus",
      message: "Check status must be O",
      code: "INVALID_STATUS",
    };
  }
  return null;
}

function validateVendorId(payment: Payment): ValidationError | null {
  if ( payment.vendorId < 100) {
    return {
      key: payment.checkNumber.toString(),
      path: "vendorId",
      message: "Vendor ID must be at least 100",
      code: "INVALID_VENDOR_ID",
    };
  }
  return null;
}

function validatePayment(payment: Payment): { isValid: boolean; errors: ValidationError[] } {
  const validators = [
    validateCheckNumber,
    validateCheckAmount,
    validateCheckStatus,
    validateVendorId,
  ];
  const errors = validators
    .map((fn) => fn(payment))
    .filter((e): e is ValidationError => !!e);
  return { isValid: errors.length === 0, errors };
}




// export const mockPayments: Payment[] = [
//   {
//     checkNumber: 1001,
//     checkAmount: 111.0,
//     clearDate: Date.now(),
//     issueDate: Date.now() - 86400000,
//     checkStatus: "O",
//     vendorId: 900,
//   },
//   {
//     checkNumber: 1002,
//     checkAmount: 555.0,
//     clearDate: Date.now(),
//     issueDate: Date.now() - 86400000,
//     checkStatus: "O",
//     vendorId: 800,
//   },
//   {
//     checkNumber: 1003,
//     checkAmount: 423.0,
//     clearDate: Date.now(),
//     issueDate: Date.now() - 86400000,
//     checkStatus: "O",
//     vendorId: 700,
//   },
// ];

// export const mockValidateFailure = async (): Promise<Response> => {
//   const response: ValidationResponse = {
//     results: {
//       batchId: "BATCH-123456",
//       completedTimestamp: new Date().toISOString(),
//       validation: [
//         { key: "1001", isValid: false },
//         { key: "1002", isValid: true },
//         { key: "1003", isValid: false },
//       ],
//       errors: [
//         {
//           key: "1001",
//           path: "checkNumber",
//           message: "Invalid check number format",
//           code: "INVALID_CHECK_NUMBER",
//         },
//         {
//           key: "1001",
//           path: "checkStatus",
//           message: "Check status must be O",
//           code: "INVALID_STATUS",
//         },
//       ],
//     },
//     request: { data: mockPayments },
//   };
//   return createResponse(400, response);

// export const mockSubmitSuccess = async (): Promise<Response> => {
//   const response: SubmitResponse = {
//     results: {
//       batchId: "BATCH-123456",
//       completedTimestamp: new Date().toISOString(),
//       validation: [
//         { key: "1001", isValid: true },
//         { key: "1002", isValid: true },
//         { key: "1003", isValid: true },
//       ],
//     },
//     request: { data: mockPayments },
//   };
//   return createResponse(201, response);
// };

// export const mockSubmitFailure = async (): Promise<Response> => {
//   const response: SubmitResponse = {
//     results: {
//       batchId: "BATCH-123456",
//       completedTimestamp: new Date().toISOString(),
//       validation: [
//         { key: "1001", isValid: true },
//         { key: "1002", isValid: true },
//         { key: "1003", isValid: false },
//       ],
//       errors: [
//         {
//           key: "1003",
//           path: "checkStatus",
//           message: "Check status must be O",
//           code: "INVALID_STATUS",
//         },
//       ],
//     },
//     request: { data: mockPayments },
//   };
//   return createResponse(400, response);
// };

// export const mockValidateSuccess = async (): Promise<Response> => {
//   const response: ValidationResponse = {
//     results: {
//       batchId: "BATCH-123456",
//       completedTimestamp: new Date().toISOString(),
//       validation: [
//         { key: "1001", isValid: true },
//         { key: "1002", isValid: true },
//         { key: "1003", isValid: true },
//       ],
//     },
//     request: { data: mockPayments },
//   };
//   return createResponse(200, response);
// };