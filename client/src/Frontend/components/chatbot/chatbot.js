import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faPaperPlane,
  faTimes,
  faRobot,
  faCircle,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/chat.css";
import logo from "../../../assets/img/latest_logo.svg";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  // Scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Focus input field when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isChatOpen]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Make API request to backend
      const response = await axios.post("/api/chat", {
        message: userMessage.text,
      });

      const botMessage = {
        text:
          response.data.message ||
          "I'm sorry, I couldn't process your request at this time.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      // Add bot response after a small delay to simulate typing
      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I'm having trouble connecting to my services. Please try again later.",
            sender: "bot",
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      }, 800);
    }
  };

  // Handle keyboard events (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Chat toggle button */}
      <button
        className={`chat-toggle-btn ${isChatOpen ? "active" : ""}`}
        onClick={toggleChat}
        aria-label={isChatOpen ? "Close chat" : "Open chat assistant"}
      >
        <FontAwesomeIcon icon={faCommentDots} />
        <span className="chat-toggle-text">Chat with Us</span>
      </button>

      {/* Chat container */}
      <div className={`chatbot-container ${isChatOpen ? "open" : "closed"}`}>
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-title">
            <div className="chat-avatar">
              <img src={logo} alt="AI Assistant" />
            </div>
            <div>
              <h5>Financial Assistant</h5>
              <p className="chat-status">
                <FontAwesomeIcon icon={faCircle} className="status-icon" />{" "}
                Online
              </p>
            </div>
          </div>
          <button
            className="chat-close-btn"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Chat messages */}
        <div className="chat-messages-container" ref={chatMessagesRef}>
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <img src={logo} alt="AI Assistant" className="welcome-image" />
              <h4>Welcome to Financial AI Advisor!</h4>
              <p>
                Ask me anything about financial planning, investments, market
                trends, or getting personalized financial advice.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${
                  msg.sender === "user" ? "user-row" : "bot-row"
                }`}
              >
                <div className="message-avatar">
                  <FontAwesomeIcon
                    icon={msg.sender === "user" ? faUser : faRobot}
                    size="sm"
                  />
                </div>
                <div
                  className={`message ${
                    msg.sender === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="message-row bot-row">
              <div className="message-avatar">
                <FontAwesomeIcon icon={faRobot} size="sm" />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form className="chat-form" onSubmit={handleSubmit}>
          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              rows="1"
              aria-label="Message input"
            ></textarea>
            <button
              className="chat-send-btn"
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
            >
              <FontAwesomeIcon icon={faPaperPlane} size="sm" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
