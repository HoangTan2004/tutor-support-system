import { pool } from "./client.js";

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🔄 Bắt đầu seed dữ liệu HCMUT Tutor (PostgreSQL)...");

    await client.query("BEGIN");

    // 1. Xóa các bảng và hàm cũ nếu tồn tại (để reset sạch sẽ)
    // Thứ tự drop rất quan trọng để tránh lỗi khóa ngoại
    await client.query(`
      DROP TRIGGER IF EXISTS trg_generate_dangky_id ON "Đăng ký buổi tư vấn";
      DROP SEQUENCE IF EXISTS seq_dangky;
      DROP TABLE IF EXISTS users, "Đánh giá buổi học", "Tài liệu", "Đánh giá tiến bộ sinh viên", "Đăng ký buổi tư vấn", "Buổi tư vấn", "Student", "Tutor", "Admin" CASCADE;
      DROP FUNCTION IF EXISTS gio_bat_dau, gio_ket_thuc, generate_dangky_id CASCADE;
    `);
    console.log("✅ Đã dọn dẹp dữ liệu cũ.");

    // 2. Tạo hàm hỗ trợ tính giờ
    await client.query(`
      CREATE OR REPLACE FUNCTION gio_bat_dau(tiet SMALLINT)
      RETURNS TIME AS $$
      BEGIN
          RETURN CASE tiet
              WHEN 1  THEN '06:00'::time
              WHEN 2  THEN '07:00'::time
              WHEN 3  THEN '08:00'::time
              WHEN 4  THEN '09:00'::time
              WHEN 5  THEN '10:00'::time
              WHEN 6  THEN '11:00'::time
              WHEN 7  THEN '12:00'::time
              WHEN 8  THEN '13:00'::time
              WHEN 9  THEN '14:00'::time
              WHEN 10 THEN '15:00'::time
              WHEN 11 THEN '16:00'::time
              WHEN 12 THEN '17:00'::time
              WHEN 13 THEN '18:00'::time
              WHEN 14 THEN '18:50'::time
              WHEN 15 THEN '19:40'::time
              WHEN 16 THEN '20:30'::time
              WHEN 17 THEN '21:20'::time
              ELSE NULL
          END;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION gio_ket_thuc(tiet SMALLINT)
      RETURNS TIME AS $$
      BEGIN
          RETURN CASE tiet
              WHEN 1  THEN '06:50'::time
              WHEN 2  THEN '07:50'::time
              WHEN 3  THEN '08:50'::time
              WHEN 4  THEN '09:50'::time
              WHEN 5  THEN '10:50'::time
              WHEN 6  THEN '11:50'::time
              WHEN 7  THEN '12:50'::time
              WHEN 8  THEN '13:50'::time
              WHEN 9  THEN '14:50'::time
              WHEN 10 THEN '15:50'::time
              WHEN 11 THEN '16:50'::time
              WHEN 12 THEN '17:50'::time
              WHEN 13 THEN '18:50'::time
              WHEN 14 THEN '19:40'::time
              WHEN 15 THEN '20:30'::time
              WHEN 16 THEN '21:20'::time
              WHEN 17 THEN '22:10'::time
              ELSE NULL
          END;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);
    console.log("✅ Đã tạo hàm tính giờ.");

    // 3. Tạo bảng Tutor và Student
    // LƯU Ý: Dùng VARCHAR(8) thay vì CHAR(8) để tránh lỗi padding khoảng trắng của Postgres
    // khi kiểm tra LENGTH().
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Tutor" (
          TutorID VARCHAR(8) PRIMARY KEY CHECK (LENGTH(TutorID) = 6 OR LENGTH(TutorID) = 8),
          "Họ tên" VARCHAR(100) NOT NULL,
          "Giới tính" CHAR(1) CHECK ("Giới tính" IN ('M', 'F', 'O')),
          "Ngày sinh" DATE NOT NULL,
          Khoa VARCHAR(50) NOT NULL,
          "Chuyên Ngành" VARCHAR(100),
          Email VARCHAR(100) NOT NULL UNIQUE,
          "Trạng thái" VARCHAR(20) DEFAULT 'Hoạt động',
          Username VARCHAR(50) NOT NULL UNIQUE,
          Password VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Student" (
          StuID VARCHAR(8) PRIMARY KEY CHECK (LENGTH(StuID) = 8),
          "Họ tên" VARCHAR(100) NOT NULL,
          "Giới tính" CHAR(1) CHECK ("Giới tính" IN ('M', 'F', 'O')),
          "Ngày sinh" DATE NOT NULL,
          Khoa VARCHAR(50) NOT NULL,
          "Chuyên Ngành" VARCHAR(100),
          "CT đào tạo" VARCHAR(100),
          Email VARCHAR(100) NOT NULL UNIQUE,
          "Trạng thái học tập" VARCHAR(30) DEFAULT 'Đang học',
          Username VARCHAR(50) NOT NULL UNIQUE,
          Password VARCHAR(100) NOT NULL
      );
      -- THÊM: Bảng Admin
      CREATE TABLE IF NOT EXISTS Admin (
          AdminID VARCHAR(8) PRIMARY KEY,
          "Họ tên" VARCHAR(100) NOT NULL,
          Email VARCHAR(100) NOT NULL UNIQUE,
          Username VARCHAR(50) NOT NULL UNIQUE,
          Password VARCHAR(100) NOT NULL
    );
    `);
    console.log("✅ Đã tạo bảng Users (Tutor & Student).");

    // 4. Tạo bảng Buổi tư vấn
    // Sử dụng GENERATED ALWAYS ... STORED (Postgres 12+)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Buổi tư vấn" (
          ID SERIAL PRIMARY KEY,
          TutorID VARCHAR(8) NOT NULL REFERENCES Tutor(TutorID),
          Ngày DATE NOT NULL,
          "Tiết bắt đầu" SMALLINT NOT NULL CHECK ("Tiết bắt đầu" BETWEEN 1 AND 17),
          "Tiết kết thúc" SMALLINT NOT NULL CHECK ("Tiết kết thúc" BETWEEN 1 AND 17),
          "Giờ bắt đầu" TIME GENERATED ALWAYS AS (gio_bat_dau("Tiết bắt đầu")) STORED,
          "Giờ kết thúc" TIME GENERATED ALWAYS AS (gio_ket_thuc("Tiết kết thúc")) STORED,
          "Chủ đề" VARCHAR(200) NOT NULL,
          "Hình thức" VARCHAR(20) DEFAULT 'Trực tiếp' CHECK ("Hình thức" IN ('Trực tiếp', 'Online')),
          "Trạng thái" VARCHAR(20) DEFAULT 'Sắp diễn ra' CHECK ("Trạng thái" IN ('Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc')),
          CONSTRAINT chk_tiet_hop_le CHECK ("Tiết kết thúc" >= "Tiết bắt đầu")
      );
    `);
    console.log("✅ Đã tạo bảng Buổi tư vấn.");

    // 5. Tạo bảng Đăng ký, Sequence và Trigger
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Đăng ký buổi tư vấn" (
          ID VARCHAR(20) PRIMARY KEY,
          "ID_Buổi tư vấn" INTEGER NOT NULL,
          StuID VARCHAR(8) NOT NULL,
          CONSTRAINT fk_buoi FOREIGN KEY ("ID_Buổi tư vấn") REFERENCES "Buổi tư vấn"(ID) ON DELETE CASCADE,
          CONSTRAINT fk_student FOREIGN KEY (StuID) REFERENCES Student(StuID),
          CONSTRAINT uq_dangky UNIQUE ("ID_Buổi tư vấn", StuID)
      );

      CREATE SEQUENCE seq_dangky MINVALUE 1 START 1;

      CREATE OR REPLACE FUNCTION generate_dangky_id()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Tạo ID dạng REG202500001
          NEW.ID := 'REG' || TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(NEXTVAL('seq_dangky')::TEXT, 5, '0');
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_generate_dangky_id
      BEFORE INSERT ON "Đăng ký buổi tư vấn"
      FOR EACH ROW EXECUTE FUNCTION generate_dangky_id();
    `);
    console.log("✅ Đã tạo bảng Đăng ký & Trigger ID tự động.");

    // 6. Tạo các bảng còn lại (Đánh giá, Tài liệu)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Đánh giá tiến bộ sinh viên" (
          "Mã số" SERIAL PRIMARY KEY,
          "Môn học" VARCHAR(100) NOT NULL,
          "Nhận xét" TEXT,
          "Đánh giá" VARCHAR(20) CHECK ("Đánh giá" IN ('Tốt', 'Khá', 'Trung bình', 'Yếu')),
          TutorID VARCHAR(8) NOT NULL,
          StuID VARCHAR(8) NOT NULL,
          CONSTRAINT fk_tutor_danhgia FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),
          CONSTRAINT fk_student_danhgia FOREIGN KEY (StuID) REFERENCES Student(StuID)
      );

      CREATE TABLE IF NOT EXISTS "Tài liệu" (
          "Mã số" SERIAL PRIMARY KEY,
          "Tiêu đề" VARCHAR(200) NOT NULL,
          "Ngày upload" DATE DEFAULT CURRENT_DATE,
          "Mô tả" TEXT,
          "ID người đăng" VARCHAR(8) NOT NULL,
          CONSTRAINT fk_nguoidang FOREIGN KEY ("ID người đăng") REFERENCES Tutor(TutorID)
      );

      CREATE TABLE IF NOT EXISTS "Đánh giá buổi học" (
          "Mã số" SERIAL PRIMARY KEY,
          "Chấm điểm" SMALLINT NOT NULL CHECK ("Chấm điểm" BETWEEN 1 AND 5),
          "Nhận xét" TEXT,
          "Môn học" VARCHAR(100),
          StuID VARCHAR(8) NOT NULL,
          "ID_buổi tư vấn" INTEGER NOT NULL,
          CONSTRAINT fk_student_danhgiabuoi FOREIGN KEY (StuID) REFERENCES Student(StuID),
          CONSTRAINT fk_buoi_danhgia FOREIGN KEY ("ID_buổi tư vấn") REFERENCES "Buổi tư vấn"(ID) ON DELETE CASCADE,
          CONSTRAINT uq_danhgia_buoi UNIQUE (StuID, "ID_buổi tư vấn")
      );
    `);
    console.log("✅ Đã tạo xong cấu trúc các bảng.");

    // 7. Insert dữ liệu mẫu
    console.log("⏳ Đang insert dữ liệu mẫu...");

    // Insert Tutor
    await client.query(`
      INSERT INTO "Tutor" (TutorID, "Họ tên", "Giới tính", "Ngày sinh", Khoa, "Chuyên Ngành", Email, "Trạng thái", Username, Password) VALUES
      ('GV0123', 'Nguyễn Văn An', 'M', '1980-05-15', 'Công nghệ Thông tin', 'Hệ thống thông tin', 'an.nv@gv.edu.vn', 'Hoạt động', 'nguyenvanan', 'password123'),
      ('GV0456', 'Trần Thị Bích Ngọc', 'F', '1985-09-20', 'Công nghệ Thông tin', 'Khoa học máy tính', 'ngoc.ttb@gv.edu.vn', 'Hoạt động', 'tranthibichngoc', 'password123'),
      ('GV0789', 'Lê Hoàng Minh', 'M', '1978-03-10', 'Kỹ thuật Điện tử', 'Điện tử viễn thông', 'minh.lh@gv.edu.vn', 'Hoạt động', 'lehoangminh', 'password123'),
      ('20210001','Phạm Thị Mai Anh', 'F', '2003-04-12', 'Công nghệ Thông tin', 'Kỹ thuật phần mềm', '20210001@student.edu.vn','Hoạt động', 'phamthimainh', 'password123'),
      ('20210002','Trần Quốc Bảo', 'M', '2003-07-25', 'Công nghệ Thông tin', 'An toàn thông tin', '20210002@student.edu.vn','Hoạt động', 'tranquocbao', 'password123');
    `);

    // Insert Student
    await client.query(`
      INSERT INTO "Student" (StuID, "Họ tên", "Giới tính", "Ngày sinh", Khoa, "Chuyên Ngành", "CT đào tạo", Email, "Trạng thái học tập", Username, Password) VALUES
      ('20210011', 'Nguyễn Thị Lan', 'F', '2003-02-18', 'Công nghệ Thông tin', 'Kỹ thuật phần mềm', 'Chất lượng cao', '20210011@student.edu.vn', 'Đang học', 'nguyenthilan', 'password123'),
      ('20210012', 'Lê Văn Đức', 'M', '2003-11-30', 'Công nghệ Thông tin', 'Khoa học máy tính', 'Đại trà', '20210012@student.edu.vn', 'Đang học', 'levanduc', 'password123'),
      ('20210013', 'Phạm Minh Tuấn', 'M', '2003-08-05', 'Kỹ thuật Điện tử', 'Điện tử viễn thông','Đại trà', '20210013@student.edu.vn', 'Đang học', 'phamminhtuan', 'password123'),
      ('20210014', 'Hoàng Thị Hồng', 'F', '2003-06-22', 'Công nghệ Thông tin', 'An toàn thông tin', 'Chất lượng cao', '20210014@student.edu.vn', 'Đang học', 'hoangthihong', 'password123'),
      ('20210015', 'Vũ Văn Hùng', 'M', '2003-09-14', 'Công nghệ Thông tin', 'Kỹ thuật phần mềm', 'Đại trà', '20210015@student.edu.vn', 'Đang học', 'vuvanhung', 'password123');
    `);

    // Insert Admin
    await client.query(`
      INSERT INTO Admin (AdminID, "Họ tên", Email, Username, Password) VALUES
      ('AD0001', 'Quản Trị Viên Hệ Thống', 'admin@hcmut.edu.vn', 'admin', 'password123');
    `);

    // Insert Buổi tư vấn
    await client.query(`
      INSERT INTO "Buổi tư vấn" (TutorID, Ngày, "Tiết bắt đầu", "Tiết kết thúc", "Chủ đề", "Hình thức", "Trạng thái") VALUES
      ('GV0123', '2025-12-03', 8, 10, 'Hỗ trợ đồ án môn Lập trình Web', 'Trực tiếp', 'Sắp diễn ra'),
      ('20210001', '2025-12-04', 14, 16, 'Ôn tập thuật toán cho kỳ thi ICPC', 'Online', 'Sắp diễn ra'),
      ('GV0456', '2025-12-05', 5, 7, 'Tư vấn chọn đề tài nghiên cứu khoa học', 'Trực tiếp', 'Sắp diễn ra'),
      ('GV0789', '2025-12-05', 13, 15, 'Hướng dẫn sử dụng phần mềm MATLAB', 'Trực tiếp', 'Sắp diễn ra'),
      ('20210002', '2025-12-06', 9, 11, 'Chia sẻ kinh nghiệm phỏng vấn thực tập', 'Online', 'Sắp diễn ra'),
      ('GV0123', '2025-12-10', 2, 4, 'Giải đáp thắc mắc môn Cấu trúc dữ liệu', 'Trực tiếp', 'Sắp diễn ra');
    `);

    // Insert Đăng ký
    await client.query(`
      INSERT INTO "Đăng ký buổi tư vấn" ("ID_Buổi tư vấn", StuID) VALUES
      (1, '20210011'), (1, '20210012'),
      (2, '20210011'), (2, '20210013'), (2, '20210014'),
      (3, '20210015'),
      (4, '20210013'),
      (5, '20210012'), (5, '20210014'),
      (6, '20210011');
    `);

    // Insert Tài liệu
    await client.query(`
      INSERT INTO "Tài liệu" ("Tiêu đề", "Mô tả", "ID người đăng") VALUES
      ('Slide Lập trình Web nâng cao', 'Slide tuần 8-12 môn LTW', 'GV0123'),
      ('Bộ đề thi ICPC khu vực miền Nam', 'Từ năm 2018-2024', '20210001'),
      ('Hướng dẫn sử dụng MATLAB cơ bản', 'Dành cho sinh viên năm 2', 'GV0789');
    `);

    // Insert Đánh giá tiến bộ
    await client.query(`
      INSERT INTO "Đánh giá tiến bộ sinh viên" ("Môn học", "Nhận xét", "Đánh giá", TutorID, StuID) VALUES
      ('Lập trình Web', 'Nắm chắc HTML/CSS, đang tiến bộ tốt với JavaScript', 'Tốt', 'GV0123', '20210011'),
      ('Cấu trúc dữ liệu & GT', 'Cần luyện thêm bài tập cây nhị phân', 'Khá', '20210001', '20210013'),
      ('Mạng máy tính', 'Hiểu rõ mô hình OSI, làm bài tập rất tốt', 'Tốt', 'GV0456', '20210015');
    `);

    // Cập nhật trạng thái và Insert Đánh giá buổi học
    await client.query(`
      UPDATE "Buổi tư vấn" SET "Trạng thái" = 'Đã kết thúc' WHERE ID IN (1,2);

      INSERT INTO "Đánh giá buổi học" ("Chấm điểm", "Nhận xét", "Môn học", StuID, "ID_buổi tư vấn") VALUES
      (5, 'Giảng viên giải thích rất dễ hiểu, tài liệu đầy đủ', 'Lập trình Web', '20210011', 1),
      (4, 'Buổi học ổn, mong có thêm ví dụ thực tế', 'Lập trình Web', '20210012', 1),
      (5, 'Rất bổ ích, anh/chị chia sẻ kinh nghiệm phỏng vấn cực hay!', 'Kỹ năng mềm', '20210014', 2),
      (5, 'Cảm ơn anh Bảo nhiều, mình tự tin hơn hẳn khi đi phỏng vấn', 'Kỹ năng mềm', '20210012', 2);
    `);

    // 8. Bảng Yêu cầu tìm gia sư (Dành cho chức năng registrations.routes.js)
    await client.query(`
    CREATE TABLE IF NOT EXISTS "Yêu cầu tìm gia sư" (
    ID SERIAL PRIMARY KEY,
    StuID VARCHAR(8) NOT NULL REFERENCES Student(StuID),
    "Môn học" VARCHAR(100) NOT NULL,
    "Mô tả yêu cầu" TEXT,
    "Trạng thái" VARCHAR(20) DEFAULT 'Đang tìm' CHECK ("Trạng thái" IN ('Đang tìm', 'Đã ghép', 'Đã hủy')),
    "Ngày tạo" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    // 9. Bảng Ghép cặp (Dành cho matching.routes.js)
    await client.query(`
    CREATE TABLE IF NOT EXISTS "Ghép cặp" (
    MatchID SERIAL PRIMARY KEY,
    RequestID INTEGER REFERENCES "Yêu cầu tìm gia sư"(ID),
    TutorID VARCHAR(8) NOT NULL REFERENCES Tutor(TutorID),
    StuID VARCHAR(8) NOT NULL REFERENCES Student(StuID),
    "Trạng thái" VARCHAR(20) DEFAULT 'Chờ xác nhận' CHECK ("Trạng thái" IN ('Chờ xác nhận', 'Đã chấp nhận', 'Từ chối')),
    "Ngày ghép" TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    `);

    // 10. View "users" (Cầu nối cho hệ thống Auth/SSO cũ)
    // Giúp hàm verifyUserCredentials hoạt động mà không cần sửa code
    // Map các cột từ Student/Tutor sang chuẩn: username, password, full_name, role
    await client.query(`
CREATE OR REPLACE VIEW users AS
SELECT 
    Username AS username,
    Password AS password,
    "Họ tên" AS full_name,
    'student' AS role,
    StuID AS original_id
FROM "Student"
UNION ALL
SELECT 
    Username AS username,
    Password AS password,
    "Họ tên" AS full_name,
    'tutor' AS role,
    TutorID AS original_id
FROM "Tutor"`);

    // Commit transaction nếu mọi thứ thành công
    await client.query("COMMIT");
    console.log("✅ SEED DỮ LIỆU THÀNH CÔNG! 🎉");

    console.log("🎉 Seed dữ liệu hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi khi seed dữ liệu:", err);
  } finally {
    client.release();
    await pool.end(); // Đóng kết nối để kết thúc script
  }
}

seed();
