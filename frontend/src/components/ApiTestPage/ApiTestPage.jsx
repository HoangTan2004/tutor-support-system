import React, { useState } from "react";
import axios from "axios";
import "./ApiTestPage.css";

// URL Backend (đảm bảo đúng port)
const BACKEND_URL = "http://localhost:4000";

export default function ApiTestPage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [lastUrl, setLastUrl] = useState("");

  // State cho các input test
  const [tutorSubject, setTutorSubject] = useState("Web");
  const [sessionId, setSessionId] = useState("1");
  const [regSubject, setRegSubject] = useState("Lập trình C++");

  // Hàm gọi API chung
  const callApi = async (method, endpoint, body = null) => {
    setLoading(true);
    setResponse(null);
    setLastUrl(`${method.toUpperCase()} ${endpoint}`);
    setStatus("Pending...");

    try {
      const res = await axios({
        method: method,
        url: `${BACKEND_URL}${endpoint}`,
        data: body,
        withCredentials: true, // QUAN TRỌNG: Để gửi kèm cookie token
      });

      setResponse(res.data);
      setStatus(`Success (${res.status})`);
    } catch (err) {
      console.error(err);
      setStatus(`Error (${err.response?.status || 500})`);
      setResponse(err.response?.data || { message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-test-container">
      {/* SIDEBAR: DANH SÁCH API */}
      <div className="api-sidebar">
        {/* GROUP: USERS */}
        <div className="api-group">
          <h3>👤 Users (Chung)</h3>
          <div className="btn-grid">
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/users/profile")}
            >
              <span>Xem Profile cá nhân</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>
            <button
              className="test-btn"
              onClick={() =>
                callApi("put", "/api/users/profile", {
                  email: "updated@hcmut.edu.vn",
                  chuyenNganh: "AI Engineer",
                })
              }
            >
              <span>Update Profile (Test)</span>{" "}
              <span className="method-tag PUT">PUT</span>
            </button>
          </div>
        </div>

        {/* GROUP: TUTOR ACTIONS */}
        <div className="api-group">
          <h3>🎓 Tutor (Dành cho GV/Tutor)</h3>
          <div className="btn-grid">
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/tutors/sessions")}
            >
              <span>Xem lớp tôi đang dạy</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>
            <button
              className="test-btn"
              onClick={() =>
                callApi("post", "/api/tutors/sessions", {
                  ngay: "2025-12-25",
                  tietBatDau: 1,
                  tietKetThuc: 3,
                  chuDe: "Test tạo lớp mới",
                })
              }
            >
              <span>Tạo lớp mới (Mock)</span>{" "}
              <span className="method-tag POST">POST</span>
            </button>
            <div style={{ marginTop: 5 }}>
              <input
                className="param-input"
                placeholder="Môn học (VD: Web)"
                value={tutorSubject}
                onChange={(e) => setTutorSubject(e.target.value)}
              />
              <button
                className="test-btn"
                onClick={() =>
                  callApi("get", `/api/tutors/search?subject=${tutorSubject}`)
                }
              >
                <span>Tìm kiếm Gia sư</span>{" "}
                <span className="method-tag GET">GET</span>
              </button>
            </div>
          </div>
        </div>

        {/* GROUP: STUDENT ACTIONS */}
        <div className="api-group">
          <h3>📚 Student (Dành cho SV)</h3>
          <div className="btn-grid">
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/sessions")}
            >
              <span>Xem lớp đã đăng ký</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>

            <div
              style={{
                borderTop: "1px dashed #ccc",
                marginTop: 5,
                paddingTop: 5,
              }}
            >
              <input
                className="param-input"
                placeholder="ID Buổi tư vấn (VD: 1)"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
              <button
                className="test-btn"
                onClick={() =>
                  callApi("post", "/api/sessions/booking", {
                    sessionId: sessionId,
                  })
                }
              >
                <span>Đăng ký lớp (ID ở trên)</span>{" "}
                <span className="method-tag POST">POST</span>
              </button>
              <button
                className="test-btn"
                onClick={() => callApi("delete", `/api/sessions/${sessionId}`)}
              >
                <span>Hủy đăng ký lớp</span>{" "}
                <span className="method-tag DELETE">DEL</span>
              </button>
            </div>

            <div
              style={{
                borderTop: "1px dashed #ccc",
                marginTop: 5,
                paddingTop: 5,
              }}
            >
              <input
                className="param-input"
                placeholder="Môn cần tìm (VD: C++)"
                value={regSubject}
                onChange={(e) => setRegSubject(e.target.value)}
              />
              <button
                className="test-btn"
                onClick={() =>
                  callApi("post", "/api/registrations", {
                    subject: regSubject,
                    description: "Cần tìm người dạy gấp",
                  })
                }
              >
                <span>Đăng tin tìm Tutor</span>{" "}
                <span className="method-tag POST">POST</span>
              </button>
              <button
                className="test-btn"
                onClick={() => callApi("get", "/api/registrations")}
              >
                <span>Xem tin đã đăng</span>{" "}
                <span className="method-tag GET">GET</span>
              </button>
            </div>
          </div>
        </div>

        {/* GROUP: MATCHING */}
        <div className="api-group">
          <h3>🤝 Matching</h3>
          <div className="btn-grid">
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/matching/my-matches")}
            >
              <span>Xem danh sách tương hợp</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>
          </div>
        </div>

        {/* GROUP: DOCUMENTS */}
        <div className="api-group">
          <h3>📂 Documents</h3>
          <div className="btn-grid">
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/documents")}
            >
              <span>Lấy danh sách tài liệu</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>
          </div>
        </div>

        {/* GROUP: ADMIN */}
        <div className="api-group">
          <h3>🛡️ Admin (Chỉ role Admin)</h3>
          <div className="btn-grid">
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/admin/users")}
            >
              <span>List All Users (View)</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>
            <button
              className="test-btn"
              onClick={() => callApi("get", "/api/admin/statistics")}
            >
              <span>Xem thống kê hệ thống</span>{" "}
              <span className="method-tag GET">GET</span>
            </button>
          </div>
        </div>
      </div>

      {/* RESULT AREA */}
      <div className="api-result-area">
        <div className="status-bar">
          <div>
            <strong>Endpoint:</strong>{" "}
            <span style={{ color: "#034ea2" }}>{lastUrl}</span>
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: status.includes("Success")
                  ? "green"
                  : status.includes("Error")
                  ? "red"
                  : "orange",
                fontWeight: "bold",
              }}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="json-viewer">
          {loading
            ? "Đang tải dữ liệu..."
            : response
            ? JSON.stringify(response, null, 2)
            : "Chọn một API bên trái để kiểm tra kết quả."}
        </div>
      </div>
    </div>
  );
}
