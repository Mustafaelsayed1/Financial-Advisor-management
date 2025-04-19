import React from "react";

const FinancialReport = ({ data }) => {
  if (!data?.output) return null;

  const raw = data.output;

  // Smartly extract parts
  const adviceStart = raw.indexOf("Answer:");
  const summary = raw.substring(0, adviceStart).trim();
  const advice = raw.substring(adviceStart + 7).trim().split(/[#*-]/g).filter(Boolean);

  return (
    <div className="bg-white shadow-2xl p-8 mt-8 rounded-2xl border border-gray-200 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 flex items-center justify-center gap-2">
          📊 AI Financial Report
        </h1>
        <p className="text-gray-500 text-md">Personalized insights powered by AI</p>
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2 mb-2">
          💡 Summary
        </h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{summary}</p>
      </div>

      {/* Advice List */}
      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2 mb-4">
          ✅ Recommendations
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800">
          {advice.map((tip, idx) => (
            <li key={idx} className="leading-relaxed">{tip.trim()}</li>
          ))}
        </ul>
      </div>

      {/* Footer / Note */}
      <div className="text-sm text-gray-400 italic text-center pt-4 border-t">
        Last updated by FinWise Assistant ✨
      </div>
    </div>
  );
};

export default FinancialReport;
