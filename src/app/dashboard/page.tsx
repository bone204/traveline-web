"use client";

export default function DashboardHome() {
  return (
    <div className="dashboard-home">
      <h1 className="dashboard-title">Welcome back, User!</h1>
      <p className="dashboard-subtitle">Here's what's happening with your projects today.</p>
      
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
            <h3>Total Projects</h3>
            <p className="dashboard-stat-value">12</p>
            <span className="dashboard-stat-change positive">+2 this week</span>
        </div>
        <div className="dashboard-stat-card">
            <h3>Active Tasks</h3>
            <p className="dashboard-stat-value">24</p>
            <span className="dashboard-stat-change neutral">Same as yesterday</span>
        </div>
        <div className="dashboard-stat-card">
            <h3>Team Members</h3>
            <p className="dashboard-stat-value">8</p>
            <span className="dashboard-stat-change positive">+1 new member</span>
        </div>
        <div className="dashboard-stat-card">
            <h3>Hours Tracked</h3>
            <p className="dashboard-stat-value">142</p>
            <span className="dashboard-stat-change negative">-5% from last week</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <div className="dashboard-activity-list">
            <div className="dashboard-activity-item">
                <div className="dashboard-activity-icon blue"></div>
                <div className="dashboard-activity-content">
                    <p><strong>New task added</strong> to <span className="highlight">Design System</span></p>
                    <span className="dashboard-activity-time">2 hours ago</span>
                </div>
            </div>
             <div className="dashboard-activity-item">
                <div className="dashboard-activity-icon green"></div>
                <div className="dashboard-activity-content">
                    <p><strong>Project completed</strong>: <span className="highlight">Mobile App Redesign</span></p>
                    <span className="dashboard-activity-time">5 hours ago</span>
                </div>
            </div>
             <div className="dashboard-activity-item">
                <div className="dashboard-activity-icon orange"></div>
                <div className="dashboard-activity-content">
                    <p><strong>Meeting scheduled</strong> with <span className="highlight">Marketing Team</span></p>
                    <span className="dashboard-activity-time">Yesterday</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
