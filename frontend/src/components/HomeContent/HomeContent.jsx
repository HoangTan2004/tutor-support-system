import "./HomeContent.css";

export default function HomeContent() {
  return (
    <div className="home-wrapper">
      <div className="home-overlay"></div>

      <div className="home-container">

        {/* Banner xanh đậm */}
        <div className="home-title-bar">
          Trường Đại học Bách khoa - ĐHQG TP.HCM
        </div>

        <h2 className="home-welcome">CHÀO MỪNG ĐẾN VỚI</h2>

        <h1 className="home-main-title">
          HỆ THỐNG HỖ TRỢ TUTOR
        </h1>

        <p className="home-description">
          Hệ thống hỗ trợ Tutor của Trường Đại học Bách khoa – ĐHQG TP.HCM giúp kết nối giảng viên,
          nghiên cứu sinh và sinh viên năm trên với sinh viên cần hỗ trợ, nhằm nâng cao hiệu quả học tập
          và phát triển kỹ năng.
        </p>

      </div>
    </div>
  );
}
