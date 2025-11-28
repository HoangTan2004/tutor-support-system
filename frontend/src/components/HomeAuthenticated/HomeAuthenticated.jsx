import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Header/Header.css";
import "../HomeContent/HomeContent.css";

export default function HomeAuthenticated({ username }) {
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const navigate = useNavigate();

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

          {/* LEFT SIDE */}
          <div className="header-left">
            <img src="/public/LogoBK.png" className="header-logo" alt="Logo" />
            <a href="/" className="header-home">Trang chủ</a>
            <a href="/tutors" className="header-home">Danh sách Tutor</a>
            <a href="/history" className="header-home">Lịch sử đăng ký</a>
          </div>

          {/* RIGHT SIDE */}
          <div className="header-right">

            {/* Ngôn ngữ */}
            <div className="lang-select" onClick={() => setOpenLang(!openLang)}>
                🌐  
                <span>Tiếng Việt (vi)</span>
                <span className="arrow">▼</span>
            </div>

            {openLang && (
                <div className="lang-dropdown">
                    <button>Tiếng Việt (Vi)</button>
                    <button>English (Eng)</button>
                </div>
            )}

            {/* USER MENU */}
            <div className="user-select" onClick={() => setOpenUserMenu(!openUserMenu)}>
            👤
            <span>{username}</span>
            <span className="arrow">▼</span>
            </div>

            {openUserMenu && (
            <div className="user-dropdown">
                <button onClick={() => navigate("/userprofile")}>Hồ sơ cá nhân</button>
                <button onClick={() => navigate("/settings")}>Cài đặt</button>
                <button onClick={handleLogout}>Đăng xuất</button>
            </div>
            )}


          </div>
        </div>
      </header>

      {/* MAIN CONTENT giống HomeContent */}
      <div className="home-wrapper">
        <div className="home-overlay"></div>

        <div className="home-container">

          <div className="home-title-bar">
            Trường Đại học Bách khoa - ĐHQG TP.HCM
          </div>

          <h2 className="home-welcome">CHÀO MỪNG ĐẾN VỚI</h2>

          <h1 className="home-main-title">
            HỆ THỐNG HỖ TRỢ TUTOR
          </h1>

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
