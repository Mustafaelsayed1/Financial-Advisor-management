import express from "express";
import LifeManagement from "../models/lifemanagementModel.js";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, ...formData } = req.body;

    // ✅ Call the Flask API to get predictions
    const response = await axios.post("http://127.0.0.1:5000/api/generate_plan", formData, {
      headers: { "Content-Type": "application/json" }
    });

    const modelOutput = response.data;

    const newEntry = new LifeManagement({
      userId,
      formData,
      modelOutput,
    });

    await newEntry.save();

    res.status(200).json({ message: "Success", lifeGoals: modelOutput });
  } catch (error) {
    console.error("❌ LifeManagement Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
