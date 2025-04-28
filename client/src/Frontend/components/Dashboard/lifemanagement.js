
// import React, { useState, useEffect } from "react";
// import { useAuthContext } from "../../../context/AuthContext";
// import axios from "axios";
// import './lifemanagement.css';
// import { useNavigate } from "react-router-dom";

// const LifeManagement = () => {
//   const { state } = useAuthContext();
//   const { user } = state || {};
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     income: "",
//     rent: "",
//     utilities: "",
//     dietPlan: "",
//     transportCost: "",
//     otherRecurring: "",
//     savingAmount: "",
//     customExpenses: [{ name: "", amount: "" }],
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!user || !user._id) return;
//   }, [user]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleCustomExpenseChange = (index, field, value) => {
//     const updated = [...formData.customExpenses];
//     updated[index][field] = value;
//     setFormData((prev) => ({ ...prev, customExpenses: updated }));
//   };

//   const addCustomExpense = () => {
//     setFormData((prev) => ({
//       ...prev,
//       customExpenses: [...prev.customExpenses, { name: "", amount: "" }],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       console.log("Sending data:", formData);  // Debugging line to check the data

//       const response = await axios.post("http://localhost:5001/generate", {
//         income: formData.income,
//         rent: formData.rent,
//         utilities: formData.utilities,
//         dietPlan: formData.dietPlan,
//         transportCost: formData.transportCost,
//         otherRecurring: formData.otherRecurring,
//         savingAmount: formData.savingAmount,
//         customExpenses: formData.customExpenses,
//       });

//       const output = response.data.output || response.data;
//       console.log("✅ Backend response:", output);  // Debugging the output from backend

//       navigate("/financial-report", { state: { output } });
//     } catch (error) {
//       console.error("❌ Submission error:", error);
//       setError("Error submitting data. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="life-management-page">
//       <h2>Life Management Questionnaire</h2>
//       <form onSubmit={handleSubmit}>
//         <label>Total Monthly Income</label>
//         <input
//           type="number"
//           name="income"
//           value={formData.income}
//           onChange={handleChange}
//         />

//         <h4>Fixed Monthly Bills</h4>
//         <label>Rent / Mortgage</label>
//         <input
//           type="number"
//           name="rent"
//           value={formData.rent}
//           onChange={handleChange}
//         />

//         <label>Utilities (Electricity, Water, Internet)</label>
//         <input
//           type="number"
//           name="utilities"
//           value={formData.utilities}
//           onChange={handleChange}
//         />

//         <h4>Diet Plan</h4>
//         <select name="dietPlan" value={formData.dietPlan} onChange={handleChange}>
//           <option value="">-- Select --</option>
//           <option value="Balanced">Balanced</option>
//           <option value="Vegetarian">Vegetarian</option>
//           <option value="Vegan">Vegan</option>
//           <option value="Keto">Keto</option>
//           <option value="High-Protein">High-Protein</option>
//           <option value="Other">Other</option>
//         </select>

//         <h4>Transportation</h4>
//         <input
//           type="number"
//           name="transportCost"
//           value={formData.transportCost}
//           onChange={handleChange}
//           placeholder="Monthly transport cost"
//         />

//         <h4>Other Recurring Expenses</h4>
//         <textarea
//           name="otherRecurring"
//           value={formData.otherRecurring}
//           onChange={handleChange}
//           placeholder="e.g., Gym, Phone, Netflix"
//         />

//         <h4>Savings</h4>
//         <input
//           type="number"
//           name="savingAmount"
//           value={formData.savingAmount}
//           onChange={handleChange}
//           placeholder="Monthly saving amount"
//         />

//         <h4>Other Custom Expenses</h4>
//         {formData.customExpenses.map((expense, index) => (
//           <div key={index} className="custom-expense">
//             <input
//               type="text"
//               placeholder="Expense Name"
//               value={expense.name}
//               onChange={(e) =>
//                 handleCustomExpenseChange(index, "name", e.target.value)
//               }
//             />
//             <input
//               type="number"
//               placeholder="Amount"
//               value={expense.amount}
//               onChange={(e) =>
//                 handleCustomExpenseChange(index, "amount", e.target.value)
//               }
//             />
//           </div>
//         ))}
//         <button type="button" onClick={addCustomExpense}>
//           + Add Expense
//         </button>
//         <br />
//         <button type="submit" disabled={loading}>
//           {loading ? "Submitting..." : "Submit"}
//         </button>
//       </form>

//       {error && <p className="error">{error}</p>}
//     </div>
//   );
// };

// export default LifeManagement;
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import axios from "axios";
import './lifemanagement.css';
import { useNavigate } from "react-router-dom";

const LifeManagement = () => {
  const { state } = useAuthContext();
  const { user, loading: authLoading } = state || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    income: "",
    rent: "",
    utilities: "",
    dietPlan: "",
    transportCost: "",
    otherRecurring: "",
    savingAmount: "",
    customExpenses: [{ name: "", amount: "" }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user || !user._id) {
      setError("User ID is not available.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/generate", {
        userId: user._id,
        ...formData,
      });

      const output = res.data.output || res.data;
      console.log("✅ Backend response:", output);

      navigate("/financial-report", { state: { output } });
    } catch (error) {
      console.error("❌ Submission error:", error);
      setError("Error submitting data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastAdvice = async () => {
    if (!user || !user._id) return;
    try {
      setLoadingAdvice(true);
      const res = await axios.get(`http://localhost:5001/advice/last/${user._id}`);
      const adviceData = res.data;
      
      // ✅ Navigate to new page and pass the advice data
      navigate("/last-advice", { state: { adviceData } });
    } catch (error) {
      console.error("❌ Error fetching last advice:", error);
      setFetchError("No previous advice found.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const showUserIdError = !authLoading && (!user || !user._id);

  return (
    <div className="life-management-page">
      <h2>Life Management Questionnaire</h2>

      {/* ✅ Survey form starts here */}
      <form onSubmit={handleSubmit}>
        <label>Total Monthly Income</label>
        <input
          type="number"
          name="income"
          value={formData.income}
          onChange={handleChange}
        />

        <h4>Fixed Monthly Bills</h4>
        <label>Rent / Mortgage</label>
        <input
          type="number"
          name="rent"
          value={formData.rent}
          onChange={handleChange}
        />

        <label>Utilities (Electricity, Water, Internet)</label>
        <input
          type="number"
          name="utilities"
          value={formData.utilities}
          onChange={handleChange}
        />

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
          placeholder="e.g., Gym, Phone, Netflix"
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
              onChange={(e) =>
                handleCustomExpenseChange(index, "name", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={(e) =>
                handleCustomExpenseChange(index, "amount", e.target.value)
              }
            />
          </div>
        ))}
        <button type="button" onClick={addCustomExpense}>
          + Add Expense
        </button>
        <br />
        <button type="submit" disabled={loading || showUserIdError}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {/* ✅ Show Last Advice Button */}
      <div style={{ marginTop: "20px" }}>
        <button
          type="button"
          onClick={fetchLastAdvice}
          disabled={showUserIdError || loadingAdvice}
        >
          {loadingAdvice ? "Fetching Advice..." : "Show Last Advice"}
        </button>
        {fetchError && <p className="error">{fetchError}</p>}
      </div>
    </div>
  );
};

export default LifeManagement;
