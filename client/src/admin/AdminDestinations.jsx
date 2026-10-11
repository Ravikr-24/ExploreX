import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import "../styles/adminDestinations.css";

function AdminDestinations() {
  const { token } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/destinations");

        setDestinations(response.data.destinations || []);
      } catch (error) {
       setError(
          error.response?.data?.message ||
            "Failed to load destinations."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDestinations();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Delete destination
  const handleDelete = async (destinationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this destination?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/destinations/${destinationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove deleted destination from UI
      setDestinations((previousDestinations) =>
        previousDestinations.filter(
          (destination) =>
            destination._id !== destinationId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete destination."
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="admin-destinations-loading">
        <div className="admin-destinations-spinner"></div>
        <p>Loading destinations...</p>
      </main>
    );
  }

  // Error state
  if (error && destinations.length === 0) {
    return (
      <main className="admin-destinations">
        <div className="admin-destinations-header">
          <p className="admin-destinations-label">
            EXPLOREX ADMIN PANEL
          </p>

          <h1>Manage Destinations</h1>
        </div>

        <div className="admin-destinations-message admin-destinations-error">
          ⚠️ {error}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-destinations">
      {/* Header */}
      <header className="admin-destinations-header">
        <p className="admin-destinations-label">
          EXPLOREX ADMIN PANEL
        </p>

        <h1>Manage Destinations</h1>

        <p>
          View, edit and manage all ExploreX
          destinations.
        </p>
      </header>

      {/* Add Destination */}
      <div className="admin-destinations-actions">
        <Link
          to="/admin/destinations/add"
          className="admin-add-destination-button"
        >
          <span>+</span>
          <span>Add Destination</span>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="admin-destinations-message admin-destinations-error">
          ⚠️ {error}
        </div>
      )}

      {/* Destination List */}
      {destinations.length === 0 ? (
        <section className="admin-destinations-empty">
          <h2>No Destinations Found</h2>

          <p>
            Start by adding your first destination.
          </p>
        </section>
      ) : (
        <section className="admin-destinations-grid">
          {destinations.map((destination) => (
            <article
              key={destination._id}
              className="admin-destination-card"
            >
              {/* Image */}
              <div className="admin-destination-image-wrapper">
                {destination.images?.[0] ? (
                  <img
                    src={destination.images[0]}
                    alt={destination.name}
                    className="admin-destination-image"
                  />
                ) : (
                  <div className="admin-destination-image-placeholder">
                    <span>🏔️</span>
                    <p>No image available</p>
                  </div>
                )}

                {destination.category && (
                  <span className="admin-destination-category">
                    {destination.category}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="admin-destination-content">
                <h2>{destination.name}</h2>

                <p className="admin-destination-location">
                  📍 {destination.location}
                </p>

                <div className="admin-destination-details">
                  <div className="admin-destination-detail">
                    <small>Budget</small>

                    <strong>
                      ₹
                      {Number(
                        destination.budget || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="admin-destination-detail">
                    <small>Rating</small>

                    <strong>
                      ⭐{" "}
                      {Number(
                        destination.rating || 0
                      ).toFixed(1)}
                    </strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="admin-destination-actions">
                  <button
                    type="button"
                    className="admin-destination-edit"
                    onClick={() =>
                      navigate(
                        `/admin/destinations/edit/${destination._id}`
                      )
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    className="admin-destination-delete"
                    onClick={() =>
                      handleDelete(destination._id)
                    }
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminDestinations;