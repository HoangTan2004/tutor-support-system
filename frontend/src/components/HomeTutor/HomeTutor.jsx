// HomeAuthenticated.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Header/Header.css";
import "../HomeContent/HomeContent.css";

export default function HomeTutor() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(""); // student / tutor
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const navigate = useNavigate();

  // Lấy session từ localStorage
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session || session.expires < Date.now()) {
      // chưa login hoặc session hết hạn
      navigate("/login");
      return;
    }

    setUsername(session.username);
    setRole(session.user_role);

    // nếu là tutor thì redirect sang HomeTutor
    if (session.user_role !== "tutor") {
        navigate("/home"); // student không vào HomeTutor
    }
  }, [navigate]);

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (role === "tutor") {
      navigate("/home-tutor");
    } else {
      navigate("/home"); // student vẫn ở HomeAuthenticated
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <img src="/public/LogoBK.png" className="header-logo" alt="Logo" />
            <Link to="/" className="header-home" onClick={handleHomeClick}>Trang chủ</Link>
            <Link to="/student-registration" className="header-home">Sinh viên đăng ký</Link>
          </div>

          <div className="header-right">
            {/* Ngôn ngữ */}
            <div className="lang-select" onClick={() => setOpenLang(!openLang)}>
              🌐 <span>Tiếng Việt (vi)</span> <span className="arrow">▼</span>
            </div>
            {openLang && (
              <div className="lang-dropdown">
                <button>Tiếng Việt (Vi)</button>
                <button>English (Eng)</button>
              </div>
            )}

            {/* User menu */}
            <div className="user-select" onClick={() => setOpenUserMenu(!openUserMenu)}>
              👤 <span>{username}</span> <span className="arrow">▼</span>
            </div>
            {openUserMenu && (
              <div className="user-dropdown">
                <button onClick={() => navigate("/tutorprofile")}>Hồ sơ cá nhân</button>
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="home-wrapper">
        <div className="home-overlay"></div>
        <div className="home-container">
          <div className="home-title-bar">
            Trường Đại học Bách khoa - ĐHQG TP.HCM
          </div>
          <h2 className="home-welcome">CHÀO MỪNG ĐẾN VỚI</h2>
          <h1 className="home-main-title">HỆ THỐNG HỖ TRỢ TUTOR</h1>
          <p className="home-description">
            Hệ thống hỗ trợ Tutor của Trường Đại học Bách khoa – ĐHQG TP.HCM giúp kết nối giảng viên,
            nghiên cứu sinh và sinh viên năm trên với sinh viên cần hỗ trợ, nhằm nâng cao hiệu quả học tập
            và phát triển kỹ năng.
          </p>
        </div>
      </div>
    </div>
  );
}
