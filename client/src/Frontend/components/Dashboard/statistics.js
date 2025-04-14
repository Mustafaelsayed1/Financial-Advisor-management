import React, { useEffect, useState } from "react";
import "../styles/statistics.css";

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/analytics/statistics")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error loading statistics", err));
  }, []);

  if (!stats) return <p className="loading-text">Loading statistics...</p>;

  return (
    <div className="statistics-container">
      <h2 className="statistics-title">📊 Application Statistics</h2>
      <div className="statistics-card">
        <p>Total Users: <strong>{stats.totalUsers}</strong></p>
        <p>Admins: <strong>{stats.totalAdmins}</strong></p>
        <p>Regular Users: <strong>{stats.totalRegularUsers}</strong></p>
      </div>
    </div>
  );
};

export default StatisticsPage;
