// ✅ Existing imports...
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import connectMongoDBSession from "connect-mongodb-session";
import session from "express-session";
import path from "path";

import { fileURLToPath } from "url";
import axios from "axios";

// ✅ New: Import LifeManagement routes
import lifeManagementRoutes from "./routes/lifemanagement.js";

// ✅ Other route imports
import userRoutes from "./routes/userroutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import questionnaireRoutes from "./routes/questionnaireRoutes.js";
import analyticsRoutes from "./routes/analyticRoutes.js";

// ✅ Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: "uploads/" });
const MongoDBStore = connectMongoDBSession(session);

const PORT = process.env.PORT || 4000;
const MONGO_URL =
  "mongodb+srv://mohamedhammad3142:boghdaddy1234@cluster0.keg5o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const FLASK_API_BASE_URL = "http://127.0.0.1:5000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const JWT_SECRET = "6dsb&c~HYAx3K787,5.K2lK*EA*h|9C-6Y,$.jiKS1s9lTE5^bPN$>+~";

if (!MONGO_URL) {
  console.error("❌ MongoDB connection string (MONGO_URL) is missing.");
  process.exit(1);
}

// ✅ Connect MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

const store = new MongoDBStore({
  uri: MONGO_URL,
  collection: "sessions",
});

store.on("error", (error) =>
  console.error("❌ MongoDB session store error:", error)
);

// ✅ Middleware
app.use(
  cors({
    origin: [CLIENT_URL, FLASK_API_BASE_URL],
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/lifemanagement", lifeManagementRoutes);

// Import individual chat controller functions
import {
  handleChatRequest,
  getChatByID,
  getChatsByUser,
  getChatContextByUser,
} from "./controller/chatbotController.js";
import { auth } from "./Middleware/authMiddleware.js";

// Register individual chat routes
app.post("/api/chat/messages", handleChatRequest);
app.get("/api/chat/history", auth, getChatByID);
app.get("/api/chat/user/:userId", getChatsByUser);
app.get("/api/chat/context/:userId", auth, getChatContextByUser);

// ✅ Proxy Routes for Flask
app.post("/api/chat", async (req, res) => {
  try {
    // Add a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // Log incoming chat request
    console.log(
      `💬 Chat request received: ${req.body.message.substring(0, 30)}...`
    );

    // Check if Flask API is running
    let flaskAvailable = false;
    try {
      await axios.get(`${FLASK_API_BASE_URL}/api/chat`, {
        timeout: 1000,
        signal: controller.signal,
      });
      flaskAvailable = true;
    } catch (e) {
      console.warn(
        "⚠️ Flask service not available, falling back to local chat handling"
      );
    }

    // Use Flask if available, otherwise fall back to local chatbot
    if (flaskAvailable) {
      // Forward request to Flask service
      const response = await axios.post(
        `${FLASK_API_BASE_URL}/api/chat`,
        req.body,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId); // Clear timeout on successful response
      res.json(response.data);
    } else {
      // Fall back to local chatbot handler
      clearTimeout(timeoutId);

      // Pass to the local handler
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({
          response:
            "I need a message to respond to. Could you try asking me something?",
        });
      }

      // Import the chat controller directly
      const { handleChatRequest } = await import(
        "./controller/chatbotController.js"
      );

      // Create mock request/response objects that match what the handler expects
      const mockReq = {
        body: req.body,
        user: req.user || null,
      };

      // Mock response object that captures what the handler sends
      const mockRes = {
        status: (code) => {
          return {
            json: (data) => {
              if (code !== 200) {
                res.status(code).json(data);
              } else {
                res.json(data);
              }
            },
          };
        },
        json: (data) => {
          res.json(data);
        },
      };

      // Call the local handler
      await handleChatRequest(mockReq, mockRes);
    }
  } catch (error) {
    // Handle different error types with human-friendly messages
    console.error("❌ Error processing chat request:", error.message);

    let errorMessage =
      "I'm having trouble connecting to my services right now. Could you please try again in a moment?";
    let statusCode = 500;

    if (error.name === "AbortError") {
      errorMessage =
        "I'm taking longer than expected to process your request. Let's try a simpler question.";
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`❌ API responded with status ${error.response.status}`);
      statusCode = error.response.status;

      if (error.response.status === 400) {
        errorMessage =
          "I couldn't understand your request. Could you try rephrasing your question?";
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage =
        "I'm unable to reach my backend services. They might be temporarily offline.";
    }

    res.status(statusCode).json({
      response: errorMessage,
    });
  }
});

app.post("/api/analyze_survey", async (req, res) => {
  try {
    const response = await axios.post(
      `${FLASK_API_BASE_URL}/api/user`,
      req.body,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error analyzing survey:", error.message);
    res
      .status(500)
      .json({ error: "Failed to analyze survey data. Please try again." });
  }
});

app.post("/api/generate_plan", async (req, res) => {
  try {
    const response = await axios.post(
      `${FLASK_API_BASE_URL}/api/generate_plan`,
      req.body,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error generating plan:", error.message);
    res
      .status(500)
      .json({ error: "Failed to generate financial plan. Please try again." });
  }
});

// ✅ Serve Frontend
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/build/index.html"))
);

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
