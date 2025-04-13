import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { Table } from "react-bootstrap";
import './lifemanagement.css';

const LifeManagement = () => {
  const { state } = useAuthContext();
  const { user } = state || {};

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
    dietPlan: "", // 🆕 added
  });
  
  const [lifeData, setLifeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goalsOptions = [
    "Save more",
    "Reduce spending",
    "Invest smart",
    "Buy a house/car",
    "Emergency fund"
  ];

  useEffect(() => {
    if (!user || !user._id) return;
    // You can optionally fetch previous answers here
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
    try {
      const response = await axios.post("http://localhost:4000/api/lifemanagement", {
        userId: user._id,
        ...formData
      });
      setLifeData(response.data.lifeGoals || []);
    } catch (error) {
      console.error(error);
      setError("Error submitting data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="life-management-page">
      <h2>Life Management Questionnaire</h2>
      <form onSubmit={handleSubmit}>

        {/* 1. Monthly Income */}
        <label>Total Monthly Income</label>
        <input type="number" name="income" value={formData.income} onChange={handleChange} />

      

        {/* 2. Fixed Bills */}
        <h4>Fixed Monthly Bills</h4>
        <label>Rent / Mortgage</label>
        <input type="number" name="rent" value={formData.rent} onChange={handleChange} />

        <label>Utilities (Electricity, Water, Internet)</label>
        <input type="number" name="utilities" value={formData.utilities} onChange={handleChange} />

      

     
       {/* 3.5 Diet Plan */}
<h4>Diet Plan</h4>
<label>Select your current diet plan</label>
<select name="dietPlan" value={formData.dietPlan} onChange={handleChange}>
  <option value="">-- Select --</option>
  <option value="Balanced">Balanced</option>
  <option value="Vegetarian">Vegetarian</option>
  <option value="Vegan">Vegan</option>
  <option value="Keto">Keto</option>
  <option value="High-Protein">High-Protein</option>
  <option value="Other">Other</option>
</select>



     {/* 4. Transportation */}
<h4>Transportation</h4>
<label>How much do you pay for transportation monthly?</label>
<input
  type="number"
  name="transportCost"
  value={formData.transportCost}
  onChange={handleChange}
  placeholder="Enter transport cost"
/>

        {/* 5. Other Recurring */}
        <h4>Other Recurring Expenses</h4>
        <textarea name="otherRecurring" value={formData.otherRecurring} onChange={handleChange} placeholder="e.g., Gym, Hobbies, Subscriptions" />

        <h4>Savings</h4>
<label>How much money do you save monthly?</label>
<input
  type="number"
  name="savingAmount"
  value={formData.savingAmount}
  onChange={handleChange}
  placeholder="Enter saving amount"
/>
        {/* 9. Custom Expenses */}
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

      {/* Display Results */}
      {lifeData.length > 0 && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Details</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {lifeData.map((item, index) => (
              <tr key={index}>
                <td>{item.goal}</td>
                <td>{item.details}</td>
                <td>{item.priority}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default LifeManagement;
