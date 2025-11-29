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
import LoginBox from "./components/Login/Login(Former)";
import HomeAuthenticated from "./components/HomeAuthenticated/HomeAuthenticated";
import HomeTutor from './components/HomeTutor/HomeTutor';
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import UserProfile from "./components/UserProfile/UserProfile";
import LoginSuccess from "./components/LoginSuccess/LoginSuccess";
import TutorProfile from './components/TutorProfile/TutorProfile';
import TutorList from './components/TutorList/TutorList';
import History from "./components/History/History";
import StudentRegistration from "./components/StudentRegistration/StudentRegistration";

const App = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (session && session.expires > Date.now()) {
      setUser(session.username);
      setUserRole(session.user_role);
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
              element={<LoginBox user={user} setUser={setUser} />}
            />
            {/* Added new login success path to callback to frontend from backend */}
            <Route
              path="/login-success"
              element={<LoginSuccess setUser={setUser} />}
            />

            <Route path="/forgot" element={<ForgotPassword />} />

            {/* Home phân quyền */}
            <Route
              path="/home"
              element={
                user ? (
                  userRole === "student" ? (
                    <HomeAuthenticated username={user} />
                  ) : userRole === "tutor" ? (
                    <HomeTutor username={user} />
                  ) : (
                    <Navigate to="/login" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Profile */}
            <Route path="/userprofile" element={user && userRole === "student" ? <UserProfile /> : <Navigate to="/login" />} />
            <Route path="/tutorprofile" element={user && userRole === "tutor" ? <TutorProfile /> : <Navigate to="/login" />} />

            {/* Student-only pages */}
            <Route path="/tutors" element={user && userRole === "student" ? <TutorList /> : <Navigate to="/login" />} />
            <Route path="/history" element={user && userRole === "student" ? <History /> : <Navigate to="/login" />} />

            {/* Tutor-only pages */}
            <Route path="/student-registration" element={user && userRole === "tutor" ? <StudentRegistration /> : <Navigate to="/login" />} />

            {/* fallback route */}
            <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
