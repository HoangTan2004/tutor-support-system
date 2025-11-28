import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_USERS } from "../../data/mockup_user.js";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setMsg("Vui lòng nhập tài khoản");
      return;
    }

    // Tìm user
    const user = MOCK_USERS.find((u) => u.username === username);

    if (!user) {
      setMsg("Không tìm thấy tài khoản");
      return;
    }

    // Tạo mật khẩu mới
    const newPass = generatePassword();

    // Update vào mock
    user.password = newPass;

    // mock gửi email reset
    setMsg(`Email khôi phục mật khẩu đã được gửi tới tài khoản: ${username}@hcmut.edu.vn`);

    console.log("📩 MOCK EMAIL SENT:");
    console.log({
      to: `${username}@hcmut.edu.vn`,
      newPassword: newPass,
    });
    
    setTimeout(() => {
      navigate("/login");
    }, 2500);
  };

  return (
    <div className="fp-wrapper">
      <div className="fp-card">

        <div className="fp-left">
          <h2>Quên mật khẩu</h2>
          <p>Nhập tài khoản HCMUT để nhận liên kết đặt lại mật khẩu</p>

          {msg && <div className="fp-msg">{msg}</div>}

          <form onSubmit={handleSubmit} className="fp-form">
            <label>Tài khoản</label>
            <input
              type="text"
              placeholder="Nhập tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <button type="submit" className="fp-btn" disabled={!username}>
              Gửi email khôi phục
            </button>

            <a onClick={() => navigate("/login")} className="fp-back">
              ← Quay lại đăng nhập
            </a>
          </form>
        </div>

        <div className="fp-right">
          <img src="/login.jpeg" alt="forgot" />
        </div>

      </div>
    </div>
  );
}
