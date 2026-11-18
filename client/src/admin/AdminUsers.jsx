import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/adminUsers.css";

function AdminUsers() {
  const { token, user: currentUser } = useSelector(
    (state) => state.auth
  );

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allUsers = response.data.users || [];

      const otherUsers = allUsers.filter(
        (user) => user._id !== currentUser?.id
      );

      setUsers(otherUsers);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [token]);


  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== userId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete user."
      );
    }
  };


  if (loading) {
    return (
      <main className="admin-users-loading">
        <div className="admin-users-spinner"></div>

        <p>Loading users...</p>
      </main>
    );
  }

  if (error && users.length === 0) {
    return (
      <main className="admin-users">
        <header className="admin-users-header">
          <p className="admin-users-label">
            EXPLOREX ADMIN PANEL
          </p>

          <h1>Manage Users</h1>

          <p>
            View and manage all ExploreX users.
          </p>
        </header>

        <div className="admin-users-message admin-users-error">
          ⚠️ {error}
        </div>
      </main>
    );
  }
  return (
    <main className="admin-users">
      {/* ====================================
          HEADER
      ==================================== */}

      <header className="admin-users-header">
        <p className="admin-users-label">
          EXPLOREX ADMIN PANEL
        </p>

        <h1>Manage Users</h1>

        <p>
          View and manage all ExploreX users.
        </p>

        <div className="admin-users-count">
          👥 {users.length}{" "}
          {users.length === 1
            ? "User"
            : "Users"}
        </div>
      </header>

      {/* ====================================
          ERROR MESSAGE
      ==================================== */}

      {error && (
        <div className="admin-users-message admin-users-error">
          ⚠️ {error}
        </div>
      )}

      {/* ====================================
          USERS
      ==================================== */}

      {users.length === 0 ? (
        <section className="admin-users-empty">
          <div className="admin-users-empty-icon">
            👥
          </div>

          <h2>No Users Found</h2>

          <p>
            There are currently no other users to
            manage.
          </p>
        </section>
      ) : (
        <section className="admin-users-grid">
          {users.map((user) => (
            <article
              key={user._id}
              className="admin-user-card"
            >
              {/* Avatar */}

              <div className="admin-user-avatar">
                {user.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

              {/* Name */}

              <h2>{user.name}</h2>

              {/* Email */}

              <p className="admin-user-email">
                {user.email}
              </p>

              {/* Details */}

              <div className="admin-user-details">
                <div className="admin-user-detail">
                  <span>Role</span>

                  <span
                    className={`admin-user-role ${user.role === "admin"
                        ? "admin"
                        : "user"
                      }`}
                  >
                    {user.role || "user"}
                  </span>
                </div>

                <div className="admin-user-detail">
                  <span>Joined</span>

                  <span>
                    {user.createdAt
                      ? new Date(
                        user.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )
                      : "Not available"}
                  </span>
                </div>
              </div>

              {/* Delete */}

              <button
                type="button"
                className="admin-user-delete"
                onClick={() =>
                  handleDelete(user._id)
                }
              >
                🗑️ Delete User
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminUsers;