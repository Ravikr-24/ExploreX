
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    users: 0,
    destinations: 0,
    reviews: 0,
    travelPlans: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data.stats);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <main className="admin-dashboard-loading">
        <div className="admin-dashboard-spinner"></div>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-dashboard-error">
        <h1>Admin Dashboard</h1>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <p className="admin-dashboard-label">
          EXPLOREX ADMIN PANEL
        </p>

        <h1>Admin Dashboard</h1>

        <p>
          Manage ExploreX users, destinations, reviews
          and travel plans from one place.
        </p>
      </header>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <h2>{stats.users}</h2>
          <p>Total Users</p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">📍</div>
          <h2>{stats.destinations}</h2>
          <p>Total Destinations</p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">⭐</div>
          <h2>{stats.reviews}</h2>
          <p>Total Reviews</p>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-icon">🗺️</div>
          <h2>{stats.travelPlans}</h2>
          <p>Total Travel Plans</p>
        </article>
      </section>

      <section className="admin-management">
        <div className="admin-management-header">
          <h2>Management</h2>

          <p>
            Choose an area to manage your ExploreX application.
          </p>
        </div>

        <div className="admin-management-grid">
          <Link
            to="/admin/destinations"
            className="admin-management-link"
          >
            <span>Manage Destinations</span>
            <span>→</span>
          </Link>

          <Link
            to="/admin/destinations/add"
            className="admin-management-link"
          >
            <span>Add Destination</span>
            <span>+</span>
          </Link>

          <Link
            to="/admin/images"
            className="admin-management-link"
          >
            <span>Manage Images</span>
            <span>🖼️</span>
          </Link>

          <Link
            to="/admin/users"
            className="admin-management-link"
          >
            <span>Manage Users</span>
            <span>→</span>
          </Link>

          <Link
            to="/admin/reviews"
            className="admin-management-link"
          >
            <span>Manage Reviews</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
