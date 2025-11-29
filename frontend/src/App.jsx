import "./App.css";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import HomeContent from "./components/HomeContent/HomeContent";
import Login from "./components/Login/Login";
import HomeAuthenticated from "./components/HomeAuthenticated/HomeAuthenticated";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import UserProfile from "./components/UserProfile/UserProfile";
import LoginSuccess from "./components/LoginSuccess/LoginSuccess";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (session && session.expires > Date.now()) {
      setUser(session.username);
    } else {
      localStorage.removeItem("userSession");
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session) return;

    const timeout = session.expires - Date.now();
    const timer = setTimeout(() => {
      setUser(null);
      localStorage.removeItem("userSession");
      alert("Phiên đăng nhập hết hạn!");
      window.location.href = "/login";
    }, timeout);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <Router>
      <div className="app">
        <Header user={user} />

        <div style={{ paddingTop: "90px" }}>
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route
              path="/login"
              element={<Login user={user} setUser={setUser} />}
            />
            {/* Added new login success path to callback to frontend from backend */}
            <Route
              path="/login-success"
              element={<LoginSuccess setUser={setUser} />}
            />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route
              path="/home"
              element={
                user ? (
                  <HomeAuthenticated username={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route
              path="*"
              element={<Navigate to={user ? "/home" : "/login"} />}
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
