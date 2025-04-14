import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Frontend/components/LOGIN&REGISTRATION/Login/Login";
import Signup from "./Frontend/components/LOGIN&REGISTRATION/Signup/Signup";
import Home from "./Frontend/components/Home/home";
import NavBar from "./Frontend/components/Home/Navbar";
import Footer from "./Frontend/components/Home/Footer";
import MiniNavbar from "./Frontend/components/Home/Mininavbar";
import Chatbot from "./Frontend/components/chatbot/chatbot";
import Questionnaire from "./Frontend/components/Dashboard/Questionnaire";
import Dashboard from "./Frontend/components/Dashboard/Dashboard";
import Sidebar from "./Frontend/components/Dashboard/sidebar";
import AnalyticsReport from "./Frontend/components/Dashboard/analytics";
import Settings from "./Frontend/components/Dashboard/settings";
import Profile from "./Frontend/components/Dashboard/profile";
import AIChat from "./Frontend/components/chatbot/AIChat";
import LifeManagement from "./Frontend/components/Dashboard/lifemanagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Home />
              <Chatbot />
              <Footer />
            </>
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <>
              <MiniNavbar />
              <Login />
            </>
          }
        />

        {/* Signup Page */}
        <Route
          path="/Signup"
          element={
            <>
              <MiniNavbar />
              <Signup />
            </>
          }
        />

        {/* Settings */}
        <Route
          path="/Settings"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <Settings />
              <Footer />
            </>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <Profile />
              <Footer />
            </>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <AnalyticsReport />
              <Footer />
            </>
          }
        />

        {/* AI Chat */}
        <Route
          path="/AIChat"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <AIChat />
              <Footer />
            </>
          }
        />

        {/* Questionnaire */}
        <Route
          path="/Questionnaire"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <Questionnaire />
              <Footer />
            </>
          }
        />

        {/* Dashboard */}
        <Route
          path="/Dashboard"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <Dashboard />
              <Footer />
            </>
          }
        />

        {/* ✅ Life Management (Newly Added) */}
        <Route
          path="/LifeManagement"
          element={
            <>
              <MiniNavbar />
              <Sidebar />
              <LifeManagement />
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
