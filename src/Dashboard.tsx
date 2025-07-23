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

  const handleApiCall = async (
    apiCall: () => Promise<Response>,
    action: string
  ) => {
    try {
      const response = await apiCall();
      const data = await response.json();

      if (response.ok) {
        if (action === "upload") {
          setPayments((data as UploadResponse).results.data); // fallback to 'as' syntax for this line
          setBatchId((data as UploadResponse).results.batchId);
          setTimestamp((data as UploadResponse).results.completedTimestamp);
          setErrors([]);
        } else {
          setPayments((data as ValidationResponse | SubmitResponse).request.data);
          setBatchId((data as ValidationResponse | SubmitResponse).results.batchId);
          setTimestamp((data as ValidationResponse | SubmitResponse).results.completedTimestamp);
          setErrors((data as ValidationResponse | SubmitResponse).results.errors || []);
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
        } else {
          setPayments([]);
          setBatchId("");
          setTimestamp("");
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
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment API Dashboard</h1>

      {/* Buttons Section */}
      <div className="flex gap-4 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleApiCall(mockUploadSuccess, "upload")}
        >
          Upload Success
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleApiCall(mockUploadFailure, "upload")}
        >
          Upload Failure
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleApiCall(mockValidateSuccess, "validate")}
        >
          Validate Success
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleApiCall(mockValidateFailure, "validate")}
        >
          Validate Failure
        </button>
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleApiCall(mockSubmitSuccess, "submit")}
        >
          Submit Success
        </button>
      </div>

      {/* Batch Info */}
      {batchId && (
        <div className="mb-4">
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
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-semibold">Errors</h2>
          <ul className="list-disc pl-5">
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Check Number</th>
                <th className="py-2 px-4 border">Amount</th>
                <th className="py-2 px-4 border">Clear Date</th>
                <th className="py-2 px-4 border">Issue Date</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Vendor ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.checkNumber}>
                  <td className="py-2 px-4 border">{payment.checkNumber}</td>
                  <td className="py-2 px-4 border">
                    ${payment.checkAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border">
                    {new Date(payment.clearDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">
                    {new Date(payment.issueDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">{payment.checkStatus}</td>
                  <td className="py-2 px-4 border">{payment.vendorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
