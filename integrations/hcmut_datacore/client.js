import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Lấy đường dẫn hiện tại của file client.js này
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tính toán đường dẫn tới file .env của hcmut_sso
// Logic: Từ hcmut_datacore đi ra ngoài (..) -> vào hcmut_sso -> file .env
const envPath = path.join(__dirname, "../hcmut_sso/.env");

// Kiểm tra xem file có tồn tại không trước khi load
if (fs.existsSync(envPath)) {
  console.log(`Loading .env from: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  // Fallback: Thử tìm .env ở thư mục hiện tại (nếu đang chạy dev)
  console.warn(`Warning: Không thấy file .env tại ${envPath}`);
  console.warn("Đang thử load .env từ thư mục hiện tại...");
  dotenv.config(); // Load default
}

const { Pool } = pkg;

// KIỂM TRA QUAN TRỌNG: Nếu không có DATABASE_URL thì báo lỗi ngay lập tức
if (!process.env.DATABASE_URL) {
  console.error(
    "❌ LỖI NGHIÊM TRỌNG: Không tìm thấy biến môi trường DATABASE_URL."
  );
  console.error(
    "Vui lòng kiểm tra file .env ở thư mục integrations/hcmut_sso/.env"
  );
  console.error("Nội dung .env cần có dòng: DATABASE_URL=postgres://...");
  process.exit(1); // Dừng chương trình ngay
}

// Tạo kết nối
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err, client) => {
  console.error("Lỗi không mong muốn từ PostgreSQL client:", err);
  process.exit(-1);
});

/**
 * Hàm xác thực user từ Database
 */
export async function verifyUserCredentials(username, password) {
  const client = await pool.connect();
  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const res = await client.query(query, [username]);

    if (res.rows.length === 0) return null;

    const user = res.rows[0];

    // Lưu ý: So sánh password plain text (chỉ dùng cho dev/test)
    if (user.password !== password) return null;

    return {
      username: user.username,
      fullName: user.full_name,
      role: user.role,
    };
  } catch (err) {
    console.error("Lỗi query database:", err);
    throw err;
  } finally {
    client.release();
  }
}
