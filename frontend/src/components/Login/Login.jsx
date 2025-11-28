import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_USERS } from "../../data/mockup_user.js";
import "./Login.css";

export default function LoginBox({ user, setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // check fake database
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!user) {
      setError("Đăng nhập không thành công. Vui lòng thử lại");
      return;
    }
    // success
    setUser(user.username);

    // create session
    const expires = Date.now() + 30 * 60 * 1000; // 30m
    localStorage.setItem("userSession", JSON.stringify({ username: user.username, expires }));

    navigate("/home");      // chuyển qua HomeAuthenticated
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* LEFT FORM */}
        <div className="login-left">
          <h2>Đăng nhập</h2>
          <p>Vui lòng sử dụng tài khoản HCMUT để đăng nhập và sử dụng</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label>Tài khoản</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản"
            />

            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />

            <a href="#" className="forgot-link">Quên mật khẩu?</a>

            <button type="submit" className="login-btn" disabled={!username || !password}>Log in</button>
          </form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="login-right">
          <img src="/login.jpeg" alt="login" />
        </div>

      </div>
    </div>
  );
}
