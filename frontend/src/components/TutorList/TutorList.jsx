// TutorList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MOCK_TUTORS, SUBJECTS } from "../../data/mockup_tutor";
import "./TutorList.css";
import "../Header/Header.css";

export default function TutorList({ username }) {
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [popupTutor, setPopupTutor] = useState(null);
  const [confirmationPopup, setConfirmationPopup] = useState(false);
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [usernameState, setUsernameState] = useState("");
  const [registeredTutors, setRegisteredTutors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tutorsPerPage = 6;

  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session || session.expires < Date.now()) navigate("/login");
    else setUsernameState(session.username);
  }, [navigate]);

  const filteredTutors =
    selectedSubject === "ALL"
      ? MOCK_TUTORS
      : MOCK_TUTORS.filter((t) => t.subject_id === selectedSubject);

  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredTutors.slice(indexOfFirstTutor, indexOfLastTutor);
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleRegisterTutor = (tutor) => {
    const newRegistration = {
      id: Date.now(),
      tutorId: tutor.id,
      tutorName: tutor.name,
      subjectName: tutor.subject_name,
      method: "Online",
      status: "Chờ xác nhận",
      registeredDate: new Date().toLocaleDateString(),
      updatedDate: new Date().toLocaleDateString()
    };

    setRegisteredTutors(prev => [...prev, tutor.id]);

    const existingHistory = JSON.parse(localStorage.getItem("registrationHistory")) || [];
    localStorage.setItem("registrationHistory", JSON.stringify([...existingHistory, newRegistration]));

    setPopupTutor(null);
    setConfirmationPopup(true);
  };

  const isRegistered = (tutorId) => registeredTutors.includes(tutorId);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
  };

  return (
    <div>
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <img src="/LogoBK.png" className="header-logo" alt="Logo" />
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="tutor-container">
        <div className="tutor-box">
          <h2 className="tutor-title">Danh sách Tutor</h2>

          <div className="filter-box">
            <label>Lọc theo ngành học:</label>
            <select
              className="subject-dropdown"
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
            >
              {SUBJECTS.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
              ))}
            </select>
          </div>

          <div className="tutor-table-wrapper">
            <table className="tutor-table">
              <thead>
                <tr>
                  <th className="col-name">Họ và tên</th>
                  <th className="col-major">Ngành học</th>
                  <th className="col-role">Chức vụ</th>
                  <th className="col-rating">Đánh giá</th>
                  <th className="col-detail">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {currentTutors.map((tutor) => (
                  <tr key={tutor.id}>
                    <td>{tutor.name}</td>
                    <td>{tutor.subject_name}</td>
                    <td>{tutor.role}</td>
                    <td>{tutor.rating}/5</td>
                    <td>
                      <button className="detail-btn" onClick={() => setPopupTutor(tutor)}>⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? "active-page" : ""}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popup chi tiết tutor */}
      {popupTutor && (
        <div className="popup-overlay" onClick={() => setPopupTutor(null)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>{popupTutor.name}</h3>
            <p><b>Môn:</b> {popupTutor.subject_name}</p>
            <p><b>Rating:</b> {popupTutor.rating}</p>
            <p><b>Mô tả:</b> {popupTutor.bio}</p>
            <p><b>Thời gian rảnh:</b> {popupTutor.availability}</p>
            
            <button
              className="register-btn"
              onClick={() => handleRegisterTutor(popupTutor)}
              disabled={isRegistered(popupTutor.id)}
            >
              {isRegistered(popupTutor.id) ? "Đã đăng ký" : "Đăng ký ghép cặp"}
            </button>

            <button className="close-btn" onClick={() => setPopupTutor(null)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Popup xác nhận đăng ký */}
      {confirmationPopup && (
        <div className="popup-overlay" onClick={() => setConfirmationPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Đã đăng ký ghép cặp!</h3>
            <p>Chờ tutor xác nhận lịch hẹn của bạn.</p>
            <button className="close-btn" onClick={() => setConfirmationPopup(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}