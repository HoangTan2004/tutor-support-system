import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./History.css";

export default function History() {
  const [historyList, setHistoryList] = useState([]);
  const [popupDetail, setPopupDetail] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [usernameState, setUsernameState] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session || session.expires < Date.now()) navigate("/login");
    else setUsernameState(session.username);

    const history = JSON.parse(localStorage.getItem("registrationHistory")) || [];
    setHistoryList(history);

    // Live update nếu tab khác thay đổi
    const onStorageChange = () => {
      setHistoryList(JSON.parse(localStorage.getItem("registrationHistory")) || []);
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [navigate]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Chờ xác nhận": return "status-pending";
      case "Đang học": return "status-ongoing";
      case "Đã kết thúc": return "status-completed";
      default: return "";
    }
  };

  const openPopup = (item) => {
    setPopupDetail(item);
    setSelectedDate(new Date());
  };

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = (d.getMonth()+1).toString().padStart(2,"0");
    const day = d.getDate().toString().padStart(2,"0");
    return `${year}-${month}-${day}`;
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
                <button onClick={() => navigate("/userprofile")}>Hồ sơ cá nhân</button>
                <button onClick={() => { localStorage.removeItem("userSession"); navigate("/login"); }}>Đăng xuất</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== TABLE ===== */}
      <div className="tutor-container">
        <div className="tutor-box">
          <h2 className="tutor-title">Lịch sử đăng ký</h2>
          <div className="tutor-table-wrapper">
            <table className="tutor-table">
              <thead>
                <tr>
                  <th>Ngày đăng ký</th>
                  <th>Tutor</th>
                  <th>Môn học</th>
                  <th>Hình thức</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map(item => (
                  <tr key={item.id}>
                    <td>{item.registeredDate}</td>
                    <td>{item.tutorName}</td>
                    <td>{item.subjectName}</td>
                    <td>{item.method}</td>
                    <td className={getStatusClass(item.status)}>{item.status}</td>
                    <td><button className="detail-btn" onClick={()=>openPopup(item)}>⋮</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== POPUP DETAIL ===== */}
      {popupDetail && (
        <div className="popup-overlay" onClick={()=>setPopupDetail(null)}>
          <div className="popup-box" onClick={e=>e.stopPropagation()}>
            <h2>Chi tiết đăng ký</h2>
            <table>
              <tbody>
                <tr><td><b>Ngày đăng ký:</b></td><td>{popupDetail.registeredDate}</td></tr>
                <tr><td><b>Tutor:</b></td><td>{popupDetail.tutorName}</td></tr>
                <tr><td><b>Môn học:</b></td><td>{popupDetail.subjectName}</td></tr>
                <tr><td><b>Hình thức:</b></td><td>{popupDetail.method}</td></tr>
                <tr><td><b>Trạng thái:</b></td><td className={getStatusClass(popupDetail.status)}>{popupDetail.status}</td></tr>
              </tbody>
            </table>

            <div className="popup-section">
              <h3>Lịch học</h3>
              <Calendar value={selectedDate} />
              <div>
                {(popupDetail.scheduleSessions || []).map((s,i)=>(
                  <div key={i}>
                    <p><b>{s.date}</b> - {s.time} - {s.topic}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="popup-section">
              <h3>Tài liệu học tập</h3>
              <table>
                <thead><tr><th>Tên tài liệu</th><th>Link</th></tr></thead>
                <tbody>
                  {(popupDetail.documents || []).map((d,i)=>(
                    <tr key={i}><td>{d.name}</td><td><a href={d.link} target="_blank">Xem</a></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="popup-section">
              <h3>Đánh giá</h3>
              <table>
                <thead><tr><th>Người đánh giá</th><th>Điểm</th><th>Nhận xét</th></tr></thead>
                <tbody>
                  {(popupDetail.feedbacks || []).map((f,i)=>(
                    <tr key={i}><td>{f.reviewer || "Tutor"}</td><td>{f.score}</td><td>{f.comment}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{textAlign:"center", marginTop:"15px"}}>
              <button className="popup-close-btn" onClick={()=>setPopupDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}