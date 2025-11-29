import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:4000";

export default function StudentConnectDemo() {
  const [activeTab, setActiveTab] = useState("matching"); // 'matching', 'booking', 'status'
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [myBookings, setMyBookings] = useState([]);

  // Form state cho Matching
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [matchSubject, setMatchSubject] = useState("");
  const [matchDesc, setMatchDesc] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load dữ liệu tùy theo Tab đang mở để tối ưu
      if (activeTab === "matching") {
        const res = await axios.get(`${BACKEND_URL}/api/tutors/search`, {
          withCredentials: true,
        });
        setTutors(res.data.data);
      } else if (activeTab === "booking") {
        const res = await axios.get(`${BACKEND_URL}/api/sessions/available`, {
          withCredentials: true,
        });
        setSessions(res.data.data);
      } else if (activeTab === "status") {
        const matchRes = await axios.get(
          `${BACKEND_URL}/api/matching/my-matches`,
          { withCredentials: true }
        );
        setMyMatches(matchRes.data.data);
        const bookRes = await axios.get(`${BACKEND_URL}/api/sessions`, {
          withCredentials: true,
        });
        setMyBookings(bookRes.data.data);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      // alert("Lỗi tải dữ liệu (Đảm bảo bạn đã đăng nhập quyền Student)");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: GỬI YÊU CẦU MATCHING ---
  const handleSendMatch = async () => {
    if (!matchSubject) return alert("Vui lòng nhập môn học muốn học!");

    try {
      await axios.post(
        `${BACKEND_URL}/api/matching/request`,
        {
          tutorId: selectedTutor.id,
          subject: matchSubject,
          description: matchDesc,
        },
        { withCredentials: true }
      );
      alert("✅ Đã gửi lời mời thành công! Chờ Tutor duyệt.");
      setSelectedTutor(null); // Đóng modal
      setMatchSubject("");
      setMatchDesc("");
    } catch (err) {
      alert("❌ Gửi thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  // --- HANDLER: ĐĂNG KÝ LỚP HỌC ---
  const handleBooking = async (sessionId) => {
    if (!window.confirm("Bạn có chắc muốn đăng ký lớp này không?")) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/sessions/booking`,
        { sessionId },
        { withCredentials: true }
      );
      alert("✅ Đã đăng ký thành công! Vui lòng chờ duyệt.");
      fetchData(); // Reload lại list
    } catch (err) {
      alert(
        "❌ Đăng ký thất bại: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="demo-container">
      {/* --- CSS INLINE (Để chạy ngay không cần file css riêng) --- */}
      <style>{`
        .demo-container { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; color: #333; }
        .demo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .tabs { display: flex; gap: 10px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .tab-btn { padding: 10px 20px; border: none; background: #f0f0f0; cursor: pointer; border-radius: 6px; font-weight: 600; color: #666; transition: all 0.2s; }
        .tab-btn.active { background: #034ea2; color: white; box-shadow: 0 4px 6px rgba(3,78,162,0.2); }
        
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; }
        .card h3 { margin: 0 0 10px 0; color: #034ea2; font-size: 1.2rem; }
        .card p { margin: 5px 0; font-size: 0.95rem; color: #555; }
        .card-footer { margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; text-align: right; }
        
        .btn-action { background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; }
        .btn-action:hover { background: #218838; }
        .btn-primary { background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }

        /* Modal Simple */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; padding: 25px; border-radius: 8px; width: 400px; max-width: 90%; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
        .form-control { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-success { background: #d4edda; color: #155724; }
        .status-danger { background: #f8d7da; color: #721c24; }
      `}</style>

      <div className="demo-header">
        <h2>🎓 Cổng Kết Nối Sinh Viên (Student Portal)</h2>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "matching" ? "active" : ""}`}
          onClick={() => setActiveTab("matching")}
        >
          🤝 Tìm Gia Sư (Matching)
        </button>
        <button
          className={`tab-btn ${activeTab === "booking" ? "active" : ""}`}
          onClick={() => setActiveTab("booking")}
        >
          📅 Đăng Ký Lớp Học (Booking)
        </button>
        <button
          className={`tab-btn ${activeTab === "status" ? "active" : ""}`}
          onClick={() => setActiveTab("status")}
        >
          📋 Trạng Thái Của Tôi
        </button>
      </div>

      {loading && <p style={{ marginTop: 20 }}>⏳ Đang tải dữ liệu...</p>}

      {/* --- TAB 1: MATCHING FLOW --- */}
      {activeTab === "matching" && (
        <div className="grid-layout">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="card">
              <div>
                <h3>{tutor.name}</h3>
                <p>
                  <strong>Khoa:</strong> {tutor.faculty}
                </p>
                <p>
                  <strong>Chuyên môn:</strong> {tutor.subject}
                </p>
                <p>
                  <strong>Email:</strong> {tutor.email}
                </p>
              </div>
              <div className="card-footer">
                <button
                  className="btn-primary"
                  onClick={() => setSelectedTutor(tutor)}
                >
                  💌 Gửi lời mời dạy
                </button>
              </div>
            </div>
          ))}
          {tutors.length === 0 && !loading && <p>Không tìm thấy Tutor nào.</p>}
        </div>
      )}

      {/* --- TAB 2: BOOKING FLOW --- */}
      {activeTab === "booking" && (
        <div className="grid-layout">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="card"
              style={{ borderLeft: "4px solid #28a745" }}
            >
              <div>
                <h3>{session.TutorName}</h3>
                <p
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {session["Chủ đề"]}
                </p>
                <p>
                  📅 Ngày:{" "}
                  {new Date(session["Ngày"]).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  ⏰ Giờ: {session["Giờ bắt đầu"]} - {session["Giờ kết thúc"]}
                </p>
                <p>📍 Hình thức: {session["Hình thức"]}</p>
              </div>
              <div className="card-footer">
                <button
                  className="btn-action"
                  onClick={() => handleBooking(session.id)}
                >
                  ✍️ Đăng ký ngay
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && !loading && (
            <p>Hiện không có lớp nào sắp mở.</p>
          )}
        </div>
      )}

      {/* --- TAB 3: MY STATUS --- */}
      {activeTab === "status" && (
        <div style={{ marginTop: 20 }}>
          <h3
            style={{
              color: "#034ea2",
              borderBottom: "1px solid #ccc",
              paddingBottom: 10,
            }}
          >
            1. Yêu cầu Matching đã gửi
          </h3>
          <div className="grid-layout" style={{ marginBottom: 40 }}>
            {myMatches.map((match) => (
              <div key={match.matchid} className="card">
                <p>
                  <strong>Gửi tới:</strong> {match.partnername}
                </p>
                <p>
                  <strong>Môn học:</strong> {match.subject}
                </p>
                <p>
                  <strong>Ngày gửi:</strong>{" "}
                  {new Date(match["Ngày ghép"]).toLocaleString()}
                </p>
                <div style={{ marginTop: 10 }}>
                  Trạng thái:
                  <span
                    className={`status-badge ${
                      match["Trạng thái"] === "Đã chấp nhận"
                        ? "status-success"
                        : match["Trạng thái"] === "Từ chối"
                        ? "status-danger"
                        : "status-pending"
                    }`}
                  >
                    {match["Trạng thái"]}
                  </span>
                </div>
              </div>
            ))}
            {myMatches.length === 0 && !loading && (
              <p style={{ color: "#888" }}>Chưa gửi yêu cầu nào.</p>
            )}
          </div>

          <h3
            style={{
              color: "#28a745",
              borderBottom: "1px solid #ccc",
              paddingBottom: 10,
            }}
          >
            2. Lớp đã đăng ký
          </h3>
          <div className="grid-layout">
            {myBookings.map((book) => (
              <div key={book.registrationid} className="card">
                <p>
                  <strong>Tutor:</strong> {book.tutorname}
                </p>
                <p>
                  <strong>Chủ đề:</strong> {book["Chủ đề"]}
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {new Date(book["Ngày"]).toLocaleDateString()} (
                  {book["Giờ bắt đầu"]})
                </p>
                <div style={{ marginTop: 10 }}>
                  Trạng thái:
                  <span
                    className={`status-badge ${
                      book.approvalstatus === "Đã duyệt"
                        ? "status-success"
                        : book.approvalstatus === "Từ chối"
                        ? "status-danger"
                        : "status-pending"
                    }`}
                  >
                    {book.approvalstatus || "Chờ duyệt"}
                  </span>
                </div>
              </div>
            ))}
            {myBookings.length === 0 && !loading && (
              <p style={{ color: "#888" }}>Chưa đăng ký lớp nào.</p>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL MATCHING REQUEST --- */}
      {selectedTutor && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Gửi lời mời tới {selectedTutor.name}</h3>
            <div className="form-group">
              <label>Môn bạn muốn học (*)</label>
              <input
                className="form-control"
                value={matchSubject}
                onChange={(e) => setMatchSubject(e.target.value)}
                placeholder="VD: Toán rời rạc, Lập trình C..."
              />
            </div>
            <div className="form-group">
              <label>Lời nhắn (Tùy chọn)</label>
              <textarea
                className="form-control"
                rows="3"
                value={matchDesc}
                onChange={(e) => setMatchDesc(e.target.value)}
                placeholder="Em rảnh vào tối thứ 3, 5..."
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                style={{ padding: "8px 15px", cursor: "pointer" }}
                onClick={() => setSelectedTutor(null)}
              >
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSendMatch}>
                Gửi Yêu Cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
