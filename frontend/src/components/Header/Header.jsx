import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
const BACKEND_URL = "http://localhost:4000";
const BACKEND_URL = "http://localhost:4000";

export default function Header() {
  const [openLang, setOpenLang] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Chuyển hướng hoàn toàn sang server backend để bắt đầu luồng SSO
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left side */}
        <div className="header-left">
          <img src="/public/LogoBK.png" className="header-logo" alt="Logo" />
          <a href="/" className="header-home">
            Trang chủ
          </a>
          <a href="/home" className="header-home">
            Trang chủ
          </a>
        </div>

        {/* Right side */}
        <div className="header-right">
          <div className="lang-select" onClick={() => setOpenLang(!openLang)}>
            🌐 🌐
            <span>Tiếng Việt (vi)</span>
            <span className="arrow">▼</span>
          </div>

          {openLang && (
            <div className="lang-dropdown">
              <button>Tiếng Việt (Vi)</button>
              <button>English (Eng)</button>
            </div>
          )}

          <button
            className="header-login-btn"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </header>
  );
}
