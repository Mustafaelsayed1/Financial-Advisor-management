import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Frontend/components/LOGIN&REGISTRATION/Login/Login";
import Signup from "./Frontend/components/LOGIN&REGISTRATION/Signup/Signup";
import Home from "./Frontend/components/Home/home";
import NavBar from "./Frontend/components/Home/Navbar";
// import PaymentHistory from "./Frontend/components/Dashboard/PaymentHistory";
import Footer from "./Frontend/components/Home/Footer";
import MiniNavBar from "./Frontend/components/Home/Mininavbar";
import Chatbot from "./Frontend/components/chatbot/chatbot";
import About from "./Frontend/components/Pages/About";
import Services from "./Frontend/components/Pages/Services";
import Contact from "./Frontend/components/Pages/Contact";
import Dashboard from "./Frontend/components/Dashboard/Dashboard";
import NotFound from "./Frontend/components/Pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Frontend/components/common/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com"></link>
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin
          ></link>
          <link
            href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          ></link>
        </head>
        <div className="app-container">
          <NavBar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
