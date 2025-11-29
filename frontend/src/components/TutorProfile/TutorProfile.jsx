// TutorProfile.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MOCK_TUTORS, SUBJECTS } from "../../data/mockup_tutor"; // import mockup
import "../UserProfile/UserProfile.css";

export default function TutorProfile() {
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [usernameState, setUsernameState] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState(""); // role trong MOCK_TUTORS
  const [subjects, setSubjects] = useState([]);  // môn học giảng dạy

  const navigate = useNavigate();

  // KIỂM TRA SESSION + load tutor info từ MOCK_TUTORS
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session || session.expires < Date.now() || session.user_role !== "tutor") {
      navigate("/login");
      return;
    }

    setUsernameState(session.username);
    setPhone(session.phone || "");
    setStatus(session.status || "Chưa hoàn thiện");

    // tìm tutor trong MOCK_TUTORS
    const tutor = MOCK_TUTORS.find(t => t.name === session.username);
    if (tutor) {
      setPosition(tutor.role || "Giảng viên");
      setSubjects([tutor.subject_name || ""]); // luôn là array
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
    window.location.reload();
  };

  const handleEditClick = () => {
    if (isEditing) {
      // cập nhật session nếu cần
      const session = JSON.parse(localStorage.getItem("userSession")) || {};
      session.phone = phone;
      session.status = status;
      session.subjects = subjects; // lưu các môn đã chọn
      localStorage.setItem("userSession", JSON.stringify(session));
    }
    setIsEditing(!isEditing);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate("/home-tutor");
  };

  return (
    <div>
      {/* HEADER */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <img src="/LogoBK.png" className="header-logo" alt="Logo" />
            <Link to="/" className="header-home" onClick={handleHomeClick}>Trang chủ</Link>
            <Link to="/student-registration" className="header-home">Sinh viên đăng ký</Link>
          </div>

          <div className="header-right">
            <div className="lang-select" onClick={() => setOpenLang(!openLang)}>
              🌐 <span>Tiếng Việt (vi)</span> ▼
            </div>
            {openLang && (
              <div className="lang-dropdown">
                <button>Tiếng Việt (Vi)</button>
                <button>English (Eng)</button>
              </div>
            )}
            <div className="user-select" onClick={() => setOpenUserMenu(!openUserMenu)}>
              👤 <span>{usernameState}</span> ▼
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

      {/* PROFILE CARD */}
      <div className="profile-wrapper">
        <div className="profile-card">
          <a
            href="/home-tutor"
            className="profile-back-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/home-tutor");
            }}
          >
            ← Quay lại
          </a>

          <div className="profile-header">
            <img src="/avatar.jpg" alt="Avatar" className="profile-avatar" />
            <div className="profile-user-info">
              <h2 className="profile-username">{usernameState}</h2>
              <p className="profile-email">&lt;{usernameState}@hcmut.edu.vn&gt;</p>
            </div>
          </div>

          <div className="profile-main">
            {/* LEFT FIXED INFO */}
            <div className="profile-left">
              <div className="profile-field full-width">
                <label>Họ và tên</label>
                <input placeholder={usernameState} disabled />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div className="profile-field half-width">
                  <label>Chức vụ</label>
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="profile-field half-width">
                  <label>Số điện thoại</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
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
            </div>

            {/* RIGHT EDITABLE INFO */}
            <div className="profile-right">
              {/* Ngành đào tạo */}
              <div className="profile-field full-width">
                <label>Ngành đào tạo</label>
                <input placeholder="Khoa học Máy tính" disabled />
              </div>

              {/* Môn học giảng dạy (checkbox list) */}
              <div className="profile-field full-width">
                <label>Môn học giảng dạy</label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    maxHeight: "110px",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    padding: "8px",
                    borderRadius: "6px",
                  }}
                >
                  {SUBJECTS.filter((s) => s.subject_id !== "ALL").map((s) => (
                    <label
                      key={s.subject_id}
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <input
                        type="checkbox"
                        value={s.subject_name}
                        checked={subjects.includes(s.subject_name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSubjects((prev) => [...prev, s.subject_name]);
                          } else {
                            setSubjects((prev) =>
                              prev.filter((sub) => sub !== s.subject_name)
                            );
                          }
                        }}
                        disabled={!isEditing}
                      />
                      {s.subject_name}
                    </label>
                  ))}
                </div>
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