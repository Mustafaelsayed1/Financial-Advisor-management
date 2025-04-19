import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { Table } from "react-bootstrap";
import './lifemanagement.css';
import { useNavigate } from "react-router-dom";

const LifeManagement = () => {
  const { state } = useAuthContext();
  const { user } = state || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    income: "",
    otherIncome: "",
    rent: "",
    utilities: "",
    loans: "",
    groceries: "",
    dining: "",
    usesTransport: false,
    transportCost: "",
    otherRecurring: "",
    savesMoney: "",
    savingAmount: "",
    biggestSpending: "",
    financialGoals: [],
    customExpenses: [{ name: "", amount: "" }],
    dietPlan: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user._id) return;
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGoalToggle = (goal) => {
    setFormData((prev) => {
      const alreadySelected = prev.financialGoals.includes(goal);
      const newGoals = alreadySelected
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal];
      return { ...prev, financialGoals: newGoals };
    });
  };

  const handleCustomExpenseChange = (index, field, value) => {
    const updated = [...formData.customExpenses];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, customExpenses: updated }));
  };

  const addCustomExpense = () => {
    setFormData((prev) => ({
      ...prev,
      customExpenses: [...prev.customExpenses, { name: "", amount: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:4000/api/lifemanagement", {
        userId: user._id,
        ...formData,
      });

      const output = response.data.lifeGoals;
      console.log("✅ AI Output:", output);

      navigate("/financial-report", {
        state: { output },
      });
    } catch (error) {
      console.error("Submission error:", error);
      setError("Error submitting data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="life-management-page">
      <h2>Life Management Questionnaire</h2>
      <form onSubmit={handleSubmit}>
        <label>Total Monthly Income</label>
        <input type="number" name="income" value={formData.income} onChange={handleChange} />

        <h4>Fixed Monthly Bills</h4>
        <label>Rent / Mortgage</label>
        <input type="number" name="rent" value={formData.rent} onChange={handleChange} />

        <label>Utilities (Electricity, Water, Internet)</label>
        <input type="number" name="utilities" value={formData.utilities} onChange={handleChange} />

        <h4>Diet Plan</h4>
        <select name="dietPlan" value={formData.dietPlan} onChange={handleChange}>
          <option value="">-- Select --</option>
          <option value="Balanced">Balanced</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Keto">Keto</option>
          <option value="High-Protein">High-Protein</option>
          <option value="Other">Other</option>
        </select>

        <h4>Transportation</h4>
        <input
          type="number"
          name="transportCost"
          value={formData.transportCost}
          onChange={handleChange}
          placeholder="Monthly transport cost"
        />

        <h4>Other Recurring Expenses</h4>
        <textarea
          name="otherRecurring"
          value={formData.otherRecurring}
          onChange={handleChange}
          placeholder="e.g., Gym, Subscriptions"
        />

        <h4>Savings</h4>
        <input
          type="number"
          name="savingAmount"
          value={formData.savingAmount}
          onChange={handleChange}
          placeholder="Monthly saving amount"
        />

        <h4>Other Custom Expenses</h4>
        {formData.customExpenses.map((expense, index) => (
          <div key={index} className="custom-expense">
            <input
              type="text"
              placeholder="Expense Name"
              value={expense.name}
              onChange={(e) => handleCustomExpenseChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={(e) => handleCustomExpenseChange(index, "amount", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addCustomExpense}>+ Add Expense</button>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default LifeManagement;
