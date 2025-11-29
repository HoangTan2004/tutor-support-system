import { pool } from "../../integrations/hcmut_datacore/client.js";

/**
 * Hàm query wrapper dùng chung cho toàn bộ backend
 * Giúp thống nhất cách gọi và dễ dàng log/debug query
 */
export const query = async (text, params) => {
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Uncomment dòng dưới nếu muốn log query để debug
    // console.log("Executed query", { text, duration, rows: res.rowCount });

    return res;
  } catch (error) {
    console.error("Database Query Error:", {
      text,
      error: error.message,
    });
    throw error;
  }
};

export default { query };
