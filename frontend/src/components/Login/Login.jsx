import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const BACKEND_URL = "http://localhost:4000";

export default function Login({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSsoLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <h2>Đăng nhập hệ thống</h2>
          <p>Sử dụng tài khoản HCMUT (BKNetID) để đăng nhập.</p>

          {/*Nút SSO */}
          <button
            onClick={handleSsoLogin}
            className="login-btn"
            style={{ marginTop: "20px" }}
          >
            Đăng nhập qua HCMUT SSO
          </button>
        </div>
        <div className="login-right">
          <img src="/login.jpeg" alt="login" />
        </div>
      </div>
    </div>
  );
}
