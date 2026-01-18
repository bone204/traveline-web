"use client";

export default function DashboardHome() {
  return (
    <div className="dashboard-home">
      <h1 className="dashboard-title">Chào mừng bạn trở lại!</h1>
      <p className="dashboard-subtitle">Đây là những gì đang diễn ra với hệ thống Traveline hôm nay.</p>
      
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
            <h3>Tổng số địa điểm</h3>
            <p className="dashboard-stat-value">12</p>
            <span className="dashboard-stat-change positive">+2 tuần này</span>
        </div>
        <div className="dashboard-stat-card">
            <h3>Người dùng mới</h3>
            <p className="dashboard-stat-value">24</p>
            <span className="dashboard-stat-change neutral">Tương tự hôm qua</span>
        </div>
        <div className="dashboard-stat-card">
            <h3>Đối tác</h3>
            <p className="dashboard-stat-value">8</p>
            <span className="dashboard-stat-change positive">+1 thành viên mới</span>
        </div>
        <div className="dashboard-stat-card">
            <h3>Lượt đặt xe</h3>
            <p className="dashboard-stat-value">142</p>
            <span className="dashboard-stat-change negative">-5% so với tuần trước</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Hoạt động gần đây</h2>
        <div className="dashboard-activity-list">
            <div className="dashboard-activity-item">
                <div className="dashboard-activity-icon blue"></div>
                <div className="dashboard-activity-content">
                    <p><strong>Địa điểm mới được thêm</strong> vào <span className="highlight">Vịnh Hạ Long</span></p>
                    <span className="dashboard-activity-time">2 giờ trước</span>
                </div>
            </div>
             <div className="dashboard-activity-item">
                <div className="dashboard-activity-icon green"></div>
                <div className="dashboard-activity-content">
                    <p><strong>Hợp đồng hoàn thành</strong>: <span className="highlight">Thuê xe VinFast VF8</span></p>
                    <span className="dashboard-activity-time">5 giờ trước</span>
                </div>
            </div>
             <div className="dashboard-activity-item">
                <div className="dashboard-activity-icon orange"></div>
                <div className="dashboard-activity-content">
                    <p><strong>Cuộc họp được lên lịch</strong> với <span className="highlight">Đội ngũ kỹ thuật</span></p>
                    <span className="dashboard-activity-time">Hôm qua</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
