import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/favorites.css";

function Favorites() {
  const { token } = useSelector((state) => state.auth);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/favorites");

        setFavorites(response.data.favorites || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load your favorites."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleRemoveFavorite = async (destinationId) => {
    try {
      setRemovingId(destinationId);
      setError("");
      setSuccess("");

      await api.delete(`/favorites/${destinationId}`);

      setFavorites((currentFavorites) =>
        currentFavorites.filter(
          (favorite) =>
            favorite.destination?._id !== destinationId
        )
      );

      setSuccess("Destination removed from favorites.");

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to remove destination from favorites."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <main className="favorites-page">
        <div className="favorites-status">
          <div className="favorites-spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </main>
    );
  }

  if (error && favorites.length === 0) {
    return (
      <main className="favorites-page">
        <div className="favorites-message favorites-error">
          <span>⚠️</span>
          <p>{error}</p>
          <Link to="/explore">
            Explore Destinations
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="favorites-page">
      {/* Header */}
      <section className="favorites-header">
        <div className="favorites-header-content">
          <p className="favorites-label">
            YOUR SAVED DESTINATIONS
          </p>

          <h1>My Favorites ❤️</h1>

          <p className="favorites-subtitle">
            Keep your favorite destinations in one place
            and easily plan your next adventure.
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="favorites-count">
            <span>{favorites.length}</span>
            <small>
              {favorites.length === 1 ?"Saved Destination": "Saved Destinations"}
            </small>
          </div>
        )}
      </section>

      {/* Success message */}
      {success && (
        <div className="favorites-alert favorites-success">
          <span>✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && favorites.length > 0 && (
        <div className="favorites-alert favorites-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 ? (
        <section className="favorites-empty">
          <div className="favorites-empty-icon">
            ❤️
          </div>

          <h2>No Favorites Yet</h2>

          <p>
            You haven't saved any destinations yet.
            Explore beautiful places and add your
            favorites here.
          </p>

          <Link to="/explore" className="favorites-explore-button">
            Explore Destinations
            <span>→</span>
          </Link>
        </section>
      ) : (
        /* Favorites Grid */
        <section className="favorites-grid">
          {favorites.map((favorite) => {
            const destination = favorite.destination;

            if (!destination) {
              return null;
            }

            const destinationId = destination._id;

            return (
              <article className="favorite-card" key={favorite._id} >
                {/* Image */}
                <div className="favorite-card-image-wrapper">
                  {destination.images?.[0] ? (
                    <img src={destination.images[0]} alt={destination.name} className="favorite-card-image"/>
                  ) : (
                    <div className="favorite-card-image-placeholder">
                      <span>🏔️</span>
                      <p>No image available</p>
                    </div>
                  )}

                  {/* Category */}
                  {destination.category && (
                    <span className="favorite-card-category">
                      {destination.category}
                    </span>
                  )}

                  {/* Remove button */}
                  <button  type="button" className="favorite-remove-button"
                    onClick={() =>
                      handleRemoveFavorite(destinationId)
                    }
                    disabled={removingId === destinationId }
                    aria-label={`Remove ${destination.name} from favorites`}
                    title="Remove from favorites">
                    {removingId === destinationId
                      ? "..."
                      : "♥"}
                  </button>
                </div>

                {/* Content */}
                <div className="favorite-card-content">
                  <h2>{destination.name}</h2>

                  <p className="favorite-card-location">
                    <span>📍</span>
                    {destination.location}
                  </p>

                  <p className="favorite-card-description">
                    {destination.description}
                  </p>

                  {/* Info */}
                  <div className="favorite-card-info">
                    <div className="favorite-info-item">
                      <span className="favorite-info-icon">
                        💰
                      </span>

                      <div>
                        <small>Budget</small>
                        <strong>
                          ₹
                          {Number(
                            destination.budget || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div className="favorite-info-item">
                      <span className="favorite-info-icon">
                        ⭐
                      </span>

                      <div>
                        <small>Rating</small>
                        <strong>
                          {Number(
                            destination.rating || 0
                          ).toFixed(1)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* View Details */}
                  <Link
                    to={`/destination/${destinationId}`}
                    className="favorite-card-link"
                  >
                    <span>View Details</span>
                    <span>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Favorites;