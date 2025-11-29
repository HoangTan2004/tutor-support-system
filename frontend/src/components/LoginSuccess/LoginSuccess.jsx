import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "http://localhost:4000";

export default function LoginSuccess({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Gọi API /me để lấy thông tin user từ HttpOnly Cookie
        const res = await axios.get(`${BACKEND_URL}/auth/me`, {
          withCredentials: true,
        });

        if (res.data.user) {
          const userData = res.data.user;
          setUser(userData.username);

          // Lưu session vào localStorage để giữ trạng thái (giống logic cũ của bạn)
          const expires = Date.now() + 2 * 60 * 60 * 1000; // 2 tiếng theo backend
          localStorage.setItem(
            "userSession",
            JSON.stringify({ username: userData.username, expires })
          );

          // Chuyển hướng về trang chủ
          navigate("/home");
        }
      } catch (err) {
        console.error("Lỗi xác thực:", err);
        // Nếu lỗi, quay về trang login
        navigate("/login");
      }
    };

    fetchUser();
  }, [setUser, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Đang đăng nhập...</h2>
    </div>
  );
}
