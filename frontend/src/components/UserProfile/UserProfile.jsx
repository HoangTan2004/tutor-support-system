import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserProfile.css";

export default function UserProfile() {
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // trạng thái chỉnh sửa
  const [usernameState, setUsernameState] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  
  const navigate = useNavigate();

  // KIỂM TRA SESSION
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session || session.expires < Date.now()) {
      navigate("/login");
    } else {
      setUsernameState(session.username);
      setPhone(session.phone || "");
      setStatus(session.status || "Chưa hoàn thiện");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
    window.location.reload();
  };

  const handleBackHome = () => {
    navigate("/home");
  };

  const handleEditClick = () => {
    if (isEditing) {
      // Cập nhật session hoặc call API lưu thông tin mới
      const session = JSON.parse(localStorage.getItem("userSession")) || {};
      session.phone = phone;
      session.status = status;
      localStorage.setItem("userSession", JSON.stringify(session));
    }
    setIsEditing(!isEditing);
  };

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <img src="/public/LogoBK.png" className="header-logo" alt="Logo" />
            <Link to="/home" className="header-home">Trang chủ</Link>
            <Link to="/tutors" className="header-home">Danh sách Tutor</Link>
            <Link to="/history" className="header-home">Lịch sử đăng ký</Link>
          </div>

          <div className="header-right">
            <div className="lang-select" onClick={() => setOpenLang(!openLang)}>
              🌐 <span>Tiếng Việt (vi)</span> <span className="arrow">▼</span>
            </div>
            {openLang && (
              <div className="lang-dropdown">
                <button>Tiếng Việt (Vi)</button>
                <button>English (Eng)</button>
              </div>
            )}
            <div className="user-select" onClick={() => setOpenUserMenu(!openUserMenu)}>
              👤 <span>{usernameState}</span> <span className="arrow">▼</span>
            </div>
            {openUserMenu && (
              <div className="user-dropdown">
                <button onClick={() => navigate("/userprofile")}>Hồ sơ cá nhân</button>
                <button onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* PROFILE CARD */}
      <div className="profile-wrapper">
        <div className="profile-card">

          {/* BACK LINK */}
          <a href="/home" className="profile-back-link" onClick={(e) => { 
            e.preventDefault(); 
            navigate("/home"); 
          }}> 
            ← Quay lại
          </a>

          {/* HEADER: Avatar + username + email */}
          <div className="profile-header">
            <img src="/public/avatar.jpg" alt="Avatar" className="profile-avatar" />
            <div className="profile-user-info">
              <h2 className="profile-username">{usernameState}</h2>
              <p className="profile-email">&lt;{usernameState}@hcmut.edu.vn&gt;</p>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="profile-main">

            {/* LEFT FIXED INFO */}
            <div className="profile-left">
              <div className="profile-field full-width">
                <label>Họ và tên</label>
                <input placeholder="Nguyen Van A" disabled />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div className="profile-field half-width">
                  <label>Giới tính</label>
                  <input placeholder="Nam" disabled />
                </div>
                <div className="profile-field half-width">
                  <label>Mã số sinh viên</label>
                  <input placeholder="2212345" disabled />
                </div>
              </div>
              <div className="profile-field full-width">
                <label>Ngành đào tạo</label>
                <input placeholder="Khoa học Máy tính" disabled />
              </div>
            </div>

            {/* RIGHT EDITABLE INFO */}
            <div className="profile-right">
              <div className="profile-field full-width">
                <label>Chương trình đào tạo</label>
                <input placeholder="CQ/CLC/KSTN/VP" disabled />
              </div>
              <div className="profile-field full-width">
                <label>Số điện thoại</label>
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="profile-field full-width">
                <label>Trạng thái hiện tại</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={!isEditing}
                >
                  <option>Chưa hoàn thiện</option>
                  <option>Sẵn sàng tham gia</option>
                  <option>Đang tham gia</option>
                  <option>Tạm ngừng</option>
                </select>
              </div>

              <button className="profile-edit-btn" onClick={handleEditClick}>
                {isEditing ? "Cập nhật" : "Chỉnh sửa"}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
