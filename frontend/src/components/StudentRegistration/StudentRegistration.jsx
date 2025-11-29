import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./StudentRegistration.css";

export default function StudentRegistration() {
  const [registrationList, setRegistrationList] = useState([]);
  const [popupStatus, setPopupStatus] = useState(null);
  const [detailPopup, setDetailPopup] = useState(null);
  const [username, setUsername] = useState("");
  const [openLang, setOpenLang] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (!session || session.expires < Date.now()) navigate("/login");
    else setUsername(session.username);

    const history = JSON.parse(localStorage.getItem("registrationHistory")) || [];
    setRegistrationList(history);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    navigate("/login");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Chờ xác nhận": return "status-pending";
      case "Đang học": return "status-ongoing"; // màu xanh lá
      case "Đã kết thúc": return "status-completed"; // màu xám
      default: return "";
    }
  };

  const handleStatusChange = (newStatus, item) => {
    const updatedList = registrationList.map(r =>
      r.id === item.id ? { ...r, status: newStatus } : r
    );
    setRegistrationList(updatedList);
    localStorage.setItem("registrationHistory", JSON.stringify(updatedList));
    if (item === popupStatus) setPopupStatus({ ...popupStatus, status: newStatus });
    if (item === detailPopup) setDetailPopup({ ...detailPopup, status: newStatus });
  };

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (date) => setSelectedDate(date);

  return (
    <div>
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <img src="/LogoBK.png" alt="Logo" className="header-logo" />
            <Link to="/home-tutor" className="header-home">Trang chủ</Link>
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
              👤 <span>{username}</span> ▼
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="tutor-container">
        <div className="tutor-box">
          <h2 className="tutor-title">Danh sách đăng ký sinh viên</h2>
          <div className="tutor-table-wrapper">
            <table className="tutor-table">
              <thead>
                <tr>
                  <th>Ngày đăng ký</th>
                  <th>Sinh viên</th>
                  <th>ID</th>
                  <th>Môn học</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {registrationList.map(item => (
                  <tr key={item.id}>
                    <td>{item.registeredDate}</td>
                    <td>{item.studentName}</td>
                    <td>{item.studentId}</td>
                    <td>{item.subjectName}</td>
                    <td>
                      <span
                        className={getStatusClass(item.status)}
                        style={{ cursor: "pointer" }}
                        onClick={() => setPopupStatus(item)}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="detail-btn"
                        onClick={() => setDetailPopup(item)}
                      >⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== POPUP XÁC NHẬN TRẠNG THÁI ===== */}
      {popupStatus && (
        <div className="popup-overlay" onClick={() => setPopupStatus(null)}>
          <div className="popup-box" onClick={e => e.stopPropagation()}>
            <h2>Xác nhận trạng thái</h2>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              {popupStatus.status === "Chờ xác nhận" && (
                <>
                  <p>Xác nhận sinh viên đăng ký?</p>
                  <button
                    className="popup-confirm-btn"
                    onClick={() => { handleStatusChange("Đang học", popupStatus); setPopupStatus(null); }}
                  >Đồng ý</button>
                  <button className="popup-close-btn" onClick={() => setPopupStatus(null)}>Đóng</button>
                </>
              )}
              {popupStatus.status === "Đang học" && (
                <>
                  <p>Muốn kết thúc buổi học?</p>
                  <button
                    className="popup-confirm-btn"
                    onClick={() => { handleStatusChange("Đã kết thúc", popupStatus); setPopupStatus(null); }}
                  >Đồng ý</button>
                  <button className="popup-close-btn" onClick={() => setPopupStatus(null)}>Đóng</button>
                </>
              )}
              {popupStatus.status === "Đã kết thúc" && (
                <>
                  <p>Chương trình đã kết thúc.</p>
                  <button className="popup-close-btn" onClick={() => setPopupStatus(null)}>Đóng</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP CHI TIẾT ===== */}
      {detailPopup && (
        <div className="popup-overlay" onClick={() => setDetailPopup(null)}>
          <div className="popup-box" onClick={e => e.stopPropagation()}>
            <h2>Chi tiết & Quản lý</h2>

            <div className="popup-section">
              <h3>Thông tin cơ bản</h3>
              <table>
                <tbody>
                  <tr><td><b>Sinh viên:</b></td><td>{detailPopup.studentName}</td></tr>
                  <tr><td><b>ID:</b></td><td>{detailPopup.studentId}</td></tr>
                  <tr><td><b>Môn học:</b></td><td>{detailPopup.subjectName}</td></tr>
                  <tr><td><b>Ngày đăng ký:</b></td><td>{detailPopup.registeredDate}</td></tr>
                  <tr><td><b>Trạng thái:</b></td><td className={getStatusClass(detailPopup.status)}>{detailPopup.status}</td></tr>
                </tbody>
              </table>
            </div>

            <div className="popup-section calendar-section">
              <h3>Lịch học</h3>
              <Calendar
                className="center-calendar"
                value={selectedDate}
                onClickDay={handleDateClick}
              />
              <div className="session-inputs">
                <input type="date" value={detailPopup.newSessionDate || ""} onChange={e => setDetailPopup({...detailPopup, newSessionDate: e.target.value})}/>
                <input type="time" value={detailPopup.newSessionTime || ""} onChange={e => setDetailPopup({...detailPopup, newSessionTime: e.target.value})}/>
                <input type="text" placeholder="Nội dung buổi học" value={detailPopup.newSessionTopic || ""} onChange={e => setDetailPopup({...detailPopup, newSessionTopic: e.target.value})}/>
                <button onClick={() => {
                  const newSession = { date: detailPopup.newSessionDate, time: detailPopup.newSessionTime, topic: detailPopup.newSessionTopic };
                  const updatedList = registrationList.map(item =>
                    item.id === detailPopup.id
                      ? { ...item, scheduleSessions: [...(item.scheduleSessions||[]), newSession] }
                      : item
                  );
                  setRegistrationList(updatedList);
                  localStorage.setItem("registrationHistory", JSON.stringify(updatedList));
                  setDetailPopup({...detailPopup, scheduleSessions:[...(detailPopup.scheduleSessions||[]), newSession], newSessionDate:"", newSessionTime:"", newSessionTopic:""});
                }}>Thêm buổi học</button>
              </div>
            </div>

            <div className="popup-section">
              <h3>Tài liệu học tập</h3>
              <table>
                <thead><tr><th>Tên tài liệu</th><th>Link</th></tr></thead>
                <tbody>
                  {(detailPopup.documents || []).map((d,i)=>(
                    <tr key={i}><td>{d.name}</td><td><a href={d.link} target="_blank">Xem</a></td></tr>
                  ))}
                </tbody>
              </table>
              <div className="session-inputs">
                <input type="text" placeholder="Tên tài liệu" value={detailPopup.newDocName || ""} onChange={e=>setDetailPopup({...detailPopup,newDocName:e.target.value})}/>
                <input type="text" placeholder="Link" value={detailPopup.newDocLink || ""} onChange={e=>setDetailPopup({...detailPopup,newDocLink:e.target.value})}/>
                <button onClick={()=>{
                  const newDoc = {name: detailPopup.newDocName, link: detailPopup.newDocLink};
                  const updatedList = registrationList.map(item =>
                    item.id === detailPopup.id
                      ? { ...item, documents:[...(item.documents||[]), newDoc] }
                      : item
                  );
                  setRegistrationList(updatedList);
                  localStorage.setItem("registrationHistory", JSON.stringify(updatedList));
                  setDetailPopup({...detailPopup, documents:[...(detailPopup.documents||[]), newDoc], newDocName:"", newDocLink:""});
                }}>Upload</button>
              </div>
            </div>

            <div className="popup-section">
              <h3>Đánh giá</h3>
              <table>
                <thead><tr><th>Người đánh giá</th><th>Điểm</th><th>Nhận xét</th></tr></thead>
                <tbody>
                  {(detailPopup.feedbacks || []).map((f,i)=>(
                    <tr key={i}><td>{username}</td><td>{f.score}</td><td>{f.comment}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="session-inputs">
                <input type="text" placeholder="Điểm" value={detailPopup.newScore || ""} onChange={e=>setDetailPopup({...detailPopup,newScore:e.target.value})}/>
                <input type="text" placeholder="Nhận xét" value={detailPopup.newComment || ""} onChange={e=>setDetailPopup({...detailPopup,newComment:e.target.value})}/>
                <button onClick={()=>{
                  const newFeedback = {score: detailPopup.newScore, comment: detailPopup.newComment};
                  const updatedList = registrationList.map(item =>
                    item.id === detailPopup.id
                      ? { ...item, feedbacks:[...(item.feedbacks||[]), newFeedback] }
                      : item
                  );
                  setRegistrationList(updatedList);
                  localStorage.setItem("registrationHistory", JSON.stringify(updatedList));
                  setDetailPopup({...detailPopup, feedbacks:[...(detailPopup.feedbacks||[]), newFeedback], newScore:"", newComment:""});
                }}>Gửi đánh giá</button>
              </div>
            </div>

            <div style={{ textAlign:"center", marginTop:"15px" }}>
              <button className="popup-close-btn" onClick={()=>setDetailPopup(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}