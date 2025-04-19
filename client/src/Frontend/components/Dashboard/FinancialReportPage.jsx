import React from "react";
import { useLocation } from "react-router-dom";
import FinancialReport from "./FinancialReport";

const FinancialReportPage = () => {
  const location = useLocation();
  const aiOutput = location.state?.output;

  if (!aiOutput) {
    return (
      <div className="p-6 text-red-600 text-lg font-semibold">
        ❌ No report data found. Please fill the Life Management form again.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* 🔥 Removed duplicate heading */}
      {/* <h1 className="text-3xl font-bold text-blue-700 mb-4">📊 AI Financial Report</h1> */}

      <FinancialReport data={{ output: aiOutput }} />
    </div>
  );
};

export default FinancialReportPage;
