import express from "express";
import LifeManagement from "../models/lifemanagementModel.js";
import axios from "axios";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Get life goals for a user
router.get("/:userId", auth, async (req, res) => {
  try {
    const lifeGoals = await LifeManagement.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!lifeGoals.length) {
      return res
        .status(404)
        .json({ message: "No life goals found for this user." });
    }

    res.status(200).json(lifeGoals[0]);
  } catch (error) {
    console.error("Error fetching life goals:", error);
    res.status(500).json({ message: "Error fetching life goals." });
  }
});

// Generate new life goals
router.post("/", auth, async (req, res) => {
  try {
    const { userId, ...formData } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Convert form data to string for model input
    const instruction = JSON.stringify(formData, null, 2);

    // Call Flask API
    const response = await axios.post(
      "http://127.0.0.1:5001/api/generate",
      { instruction },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!response.data || !response.data.output) {
      throw new Error("Invalid response from AI model");
    }

    // Save to MongoDB
    const newEntry = new LifeManagement({
      userId,
      formData,
      modelOutput: response.data.output,
    });

    await newEntry.save();

    // Send response to frontend
    res.status(200).json({
      lifeGoals: response.data.output,
      message: "Life goals generated successfully.",
    });
  } catch (error) {
    console.error("Life Management Error:", error.message);

    // Handle specific error cases
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "AI service is currently unavailable. Please try again later.",
      });
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        message: "Error generating life goals",
        error: error.response.data.error || error.message,
      });
    }

    res.status(500).json({
      message: "Error generating life goals",
      error: error.message,
    });
  }
});

export default router;
