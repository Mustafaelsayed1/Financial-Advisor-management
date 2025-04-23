import express from "express";
import {
  handleChatRequest,
  getChatByID,
  getChatsByUser,
  getChatContextByUser,
} from "../controller/chatbotController.js";
import { auth } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Route for handling chatbot requests
router.post("/chat", handleChatRequest);

// Get chat conversation by ID
router.get("/chat/history", auth, getChatByID);

// Get all chats for a specific user
router.get("/user/:userId", getChatsByUser);

// Get conversation context for a user
router.get("/context/:userId", auth, getChatContextByUser);

export default router;
