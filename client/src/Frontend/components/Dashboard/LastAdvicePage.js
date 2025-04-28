import React from "react";
import { useLocation } from "react-router-dom";
import "./lastadvice.css";  // Ensure this is linked for styling

const LastAdvicePage = () => {
  const location = useLocation();
  const { adviceData } = location.state || {};

  if (!adviceData) {
    return <div>No advice found. Please submit first.</div>;
  }

  const { input, output } = adviceData;

  return (
    <div className="last-advice-page">
      <h2>📄 Last Life Management Advice</h2>

      {/* Display Previous Survey Submission */}
      <div className="survey-box">
        <h3>Previous Survey Submission</h3>
        <div className="input-container">
          <div className="field">
            <label>Total Monthly Income:</label>
            <input type="text" value={input.income} readOnly />
          </div>
          <div className="field">
            <label>Rent / Mortgage:</label>
            <input type="text" value={input.rent} readOnly />
          </div>
          <div className="field">
            <label>Utilities:</label>
            <input type="text" value={input.utilities} readOnly />
          </div>
          <div className="field">
            <label>Diet Plan:</label>
            <input type="text" value={input.dietPlan} readOnly />
          </div>
          <div className="field">
            <label>Transportation:</label>
            <input type="text" value={input.transportCost} readOnly />
          </div>
          <div className="field">
            <label>Other Recurring Expenses:</label>
            <input type="text" value={input.otherRecurring} readOnly />
          </div>
          <div className="field">
            <label>Savings:</label>
            <input type="text" value={input.savingAmount} readOnly />
          </div>
          <div className="field">
            <label>Custom Expenses:</label>
            <input
              type="text"
              value={input.customExpenses.map((exp) => `${exp.name}: ${exp.amount} EGP`).join(", ")}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Display AI Financial Advice */}
      <div className="advice-box">
        <h3>AI Financial Advice</h3>
        <div className="advice-container">
          {output.advice.map((tip, index) => (
            <div key={index} className="advice-field">
              <textarea
                value={tip}
                readOnly
                className="advice-textfield"
              />
            </div>
          ))}
          <div className="summary-field">
            <label>Summary:</label>
            <textarea
              value={output.summary}
              readOnly
              className="summary-textarea"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastAdvicePage;
