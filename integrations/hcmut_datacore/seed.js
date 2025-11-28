import { pool } from "./client.js";

const sampleUsers = [
  {
    username: "student",
    password: "123", // Lưu ý: Password này đang để plain text để test nhanh
    full_name: "Nguyễn Văn Sinh Viên",
    role: "student",
  },
  {
    username: "teacher",
    password: "123",
    full_name: "Trần Thị Giảng Viên",
    role: "teacher",
  },
  {
    username: "admin",
    password: "123",
    full_name: "Lê Quản Trị",
    role: "admin",
  },
  {
    username: "s2310001",
    password: "123456",
    fullName: "Nguyen Van A",
    role: "student",
  },
  {
    username: "s2310002",
    password: "123456",
    fullName: "Tran Thi B",
    role: "student",
  },
  {
    username: "s2310003",
    password: "123456",
    fullName: "Le Minh C",
    role: "student",
  },
  {
    username: "s2310004",
    password: "123456",
    fullName: "Pham Thanh D",
    role: "student",
  },
  {
    username: "s2310005",
    password: "123456",
    fullName: "Vo Quang E",
    role: "student",
  },
  {
    username: "s2310006",
    password: "123456",
    fullName: "Dang Gia B",
    role: "student",
  },
  {
    username: "s2310007",
    password: "123456",
    fullName: "Hoang Thi G",
    role: "student",
  },
  {
    username: "s2310008",
    password: "123456",
    fullName: "Pham Van H",
    role: "student",
  },
  {
    username: "s2310009",
    password: "123456",
    fullName: "Bui Quynh I",
    role: "student",
  },
  {
    username: "s2310010",
    password: "123456",
    fullName: "Nguyen Hoang J",
    role: "student",
  },

  {
    username: "tutor001",
    password: "abcd1234",
    fullName: "Tutor Nguyen",
    role: "tutor",
  },
  {
    username: "tutor002",
    password: "abcd1234",
    fullName: "Tutor Tran",
    role: "tutor",
  },
  {
    username: "tutor003",
    password: "abcd1234",
    fullName: "Tutor Le",
    role: "tutor",
  },
  {
    username: "tutor004",
    password: "abcd1234",
    fullName: "Tutor Pham",
    role: "tutor",
  },
  {
    username: "tutor005",
    password: "abcd1234",
    fullName: "Tutor Vo",
    role: "tutor",
  },
  {
    username: "tutor006",
    password: "abcd1234",
    fullName: "Tutor Dang",
    role: "tutor",
  },
  {
    username: "tutor007",
    password: "abcd1234",
    fullName: "Tutor Hoang",
    role: "tutor",
  },
  {
    username: "tutor008",
    password: "abcd1234",
    fullName: "Tutor Bui",
    role: "tutor",
  },
  {
    username: "tutor009",
    password: "abcd1234",
    fullName: "Tutor Do",
    role: "tutor",
  },
  {
    username: "tutor010",
    password: "abcd1234",
    fullName: "Tutor Truong",
    role: "tutor",
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🚀 Bắt đầu khởi tạo dữ liệu...");

    // 1. Tạo bảng users nếu chưa có
    console.log("kiem tra bang users...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'student'
      );
    `);

    // 2. Thêm dữ liệu mẫu
    for (const user of sampleUsers) {
      // Câu lệnh này chỉ insert nếu username chưa tồn tại (ON CONFLICT DO NOTHING)
      const res = await client.query(
        `INSERT INTO users (username, password, full_name, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (username) DO NOTHING 
         RETURNING *`,
        [user.username, user.password, user.full_name, user.role]
      );

      if (res.rows.length > 0) {
        console.log(`✅ Đã thêm user: ${user.username}`);
      } else {
        console.log(`ℹ️ User ${user.username} đã tồn tại, bỏ qua.`);
      }
    }

    console.log("🎉 Seed dữ liệu hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi khi seed dữ liệu:", err);
  } finally {
    client.release();
    await pool.end(); // Đóng kết nối để kết thúc script
  }
}

seed();
