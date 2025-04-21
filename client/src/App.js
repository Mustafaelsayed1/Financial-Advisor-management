import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import FinancialReportPage from "./Frontend/components/Dashboard/FinancialReportPage";



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
import Contact from "./Frontend/components/Contact/contact";
import LifeManagement from "./Frontend/components/Dashboard/lifemanagement";
import StatisticsPage from "./Frontend/components/Dashboard/statistics";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Home */}
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

          {/* Login */}
          <Route
            path="/login"
            element={
              <>
                <MiniNavbar />
                <Login />
              </>
            }
          />

          {/* Signup */}
          <Route
            path="/Signup"
            element={
              <>
                <MiniNavbar />
                <Signup />
              </>
            }
          />

          {/* Dashboard Pages */}
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
          <Route
            path="/statistics"
            element={
              <>
                <MiniNavbar />
                <Sidebar />
                <StatisticsPage />
                <Footer />
              </>
            }
          />

          {/* ✅ Clean Full Page for AI Report */}
          <Route path="/financial-report" element={<FinancialReportPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

