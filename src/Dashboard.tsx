import React, { useState } from "react";
import { Payment, ErrorDetail, UploadResponse, ValidationResponse, SubmitResponse } from "./res-type";
import {
  mockUploadSuccess,
  mockUploadFailure,
  mockValidateSuccess,
  mockValidateFailure,
  mockSubmitSuccess,
} from "./mocks";

// React Component
const Dashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [errors, setErrors] = useState<ErrorDetail[]>([]);
  const [batchId, setBatchId] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean }>({});

  const handleApiCall = async (
    apiCall: () => Promise<Response>,
    action: string
  ) => {
    try {
      const response = await apiCall();
      const data = await response.json();

      if (response.ok) {
        if (action === "upload") {
          setPayments((data as UploadResponse).results.data);
          setBatchId((data as UploadResponse).results.batchId);
          setTimestamp((data as UploadResponse).results.completedTimestamp);
          setErrors([]);
          setValidationResults({});
        } else {
          setPayments((data as ValidationResponse | SubmitResponse).request.data);
          setBatchId((data as ValidationResponse | SubmitResponse).results.batchId);
          setTimestamp((data as ValidationResponse | SubmitResponse).results.completedTimestamp);
          setErrors((data as ValidationResponse | SubmitResponse).results.errors || []);
          // Extract validation results
          const validationArr = (data as ValidationResponse | SubmitResponse).results.validation || [];
          const validationMap: { [key: string]: boolean } = {};
          validationArr.forEach((v: { key: string; isValid: boolean }) => {
            validationMap[v.key] = v.isValid;
          });
          setValidationResults(validationMap);
        }
      } else {
        setErrors(
          data.error
            ? [
                {
                  key: "",
                  path: "",
                  message: data.error.message,
                  code: data.error.code,
                },
              ]
            : data.results.errors || []
        );
        if (action !== "upload") {
          setPayments((data as ValidationResponse | SubmitResponse).request.data);
          setBatchId((data as ValidationResponse | SubmitResponse).results.batchId);
          setTimestamp((data as ValidationResponse | SubmitResponse).results.completedTimestamp);
          // Extract validation results (even on error)
          const validationArr = (data as ValidationResponse | SubmitResponse).results.validation || [];
          const validationMap: { [key: string]: boolean } = {};
          validationArr.forEach((v: { key: string; isValid: boolean }) => {
            validationMap[v.key] = v.isValid;
          });
          setValidationResults(validationMap);
        } else {
          setPayments([]);
          setBatchId("");
          setTimestamp("");
          setValidationResults({});
        }
      }
    } catch (error) {
      setErrors([
        {
          key: "",
          path: "",
          message: "Network error occurred",
          code: "NETWORK_ERROR",
        },
      ]);
      setValidationResults({});
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment API Dashboard</h1>

      {/* Buttons Section */}
      <div className="button-group">
        <button className="btn" onClick={() => handleApiCall(mockUploadSuccess, "upload")}>Upload Success</button>
        <button className="btn" onClick={() => handleApiCall(mockUploadFailure, "upload")}>Upload Failure</button>
        <button className="btn btn-success" onClick={() => handleApiCall(mockValidateSuccess, "validate")}>Validate Success</button>
        <button className="btn btn-error" onClick={() => handleApiCall(mockValidateFailure, "validate")}>Validate Failure</button>
        <button className="btn btn-submit" onClick={() => handleApiCall(mockSubmitSuccess, "submit")}>Submit Success</button>
      </div>

      {/* Batch Info */}
      {batchId && (
        <div className="batch-info">
          <p>
            <strong>Batch ID:</strong> {batchId}
          </p>
          <p>
            <strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="error-box">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Errors</h2>
          <ul style={{ paddingLeft: '1.2em', margin: 0 }}>
            {errors.map((error, index) => (
              <li key={index}>
                {error.key ? `Check ${error.key}: ` : ""}
                {error.message} (Code: {error.code})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Payments Grid */}
      {payments.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Check Number</th>
                <th>Amount</th>
                <th>Clear Date</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Vendor ID</th>
                <th>Validation Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const validation = validationResults[payment.checkNumber.toString()];
                return (
                  <tr key={payment.checkNumber}>
                    <td>{payment.checkNumber}</td>
                    <td>${payment.checkAmount.toFixed(2)}</td>
                    <td>{new Date(payment.clearDate).toLocaleDateString()}</td>
                    <td>{new Date(payment.issueDate).toLocaleDateString()}</td>
                    <td>{payment.checkStatus}</td>
                    <td>{payment.vendorId}</td>
                    <td>
                      {validation === undefined ? (
                        <span className="badge badge-na">N/A</span>
                      ) : validation ? (
                        <span className="badge badge-success">Success</span>
                      ) : (
                        <span className="badge badge-error">Error</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
