import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/adminReviews.css";

function AdminReviews() {
  const { token } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH REVIEWS
  // ========================================

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/reviews/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews(response.data.reviews || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ========================================
  // DELETE REVIEW
  // ========================================

  const handleDelete = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/reviews/admin/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews((previousReviews) =>
        previousReviews.filter(
          (review) => review._id !== reviewId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete review."
      );
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="admin-reviews-loading">
        <div className="admin-reviews-spinner"></div>

        <p>Loading reviews...</p>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && reviews.length === 0) {
    return (
      <main className="admin-reviews">
        <header className="admin-reviews-header">
          <p className="admin-reviews-label">
            EXPLOREX ADMIN PANEL
          </p>

          <h1>Manage Reviews</h1>

          <p>
            View and manage all ExploreX reviews.
          </p>
        </header>

        <div className="admin-reviews-message admin-reviews-error">
          ⚠️ {error}
        </div>
      </main>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <main className="admin-reviews">
      {/* ====================================
          HEADER
      ==================================== */}

      <header className="admin-reviews-header">
        <p className="admin-reviews-label">
          EXPLOREX ADMIN PANEL
        </p>

        <h1>Manage Reviews</h1>

        <p>
          View and manage all ExploreX reviews.
        </p>

        <div className="admin-reviews-count">
          ⭐ {reviews.length}{" "}
          {reviews.length === 1
            ? "Review"
            : "Reviews"}
        </div>
      </header>

      {/* ====================================
          ERROR MESSAGE
      ==================================== */}

      {error && (
        <div className="admin-reviews-message admin-reviews-error">
          ⚠️ {error}
        </div>
      )}

      {/* ====================================
          REVIEWS
      ==================================== */}

      {reviews.length === 0 ? (
        <section className="admin-reviews-empty">
          <div className="admin-reviews-empty-icon">
            ⭐
          </div>

          <h2>No Reviews Found</h2>

          <p>
            There are currently no reviews to
            manage.
          </p>
        </section>
      ) : (
        <section className="admin-reviews-grid">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="admin-review-card"
            >
              {/* Destination */}

              <h2 className="admin-review-destination">
                📍{" "}
                {review.destination?.name ||
                  "Unknown Destination"}
              </h2>

              {/* Reviewer */}

              <div className="admin-reviewer">
                <div className="admin-reviewer-avatar">
                  {review.user?.name
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>

                <div className="admin-reviewer-info">
                  <p className="admin-reviewer-name">
                    {review.user?.name ||
                      "Unknown User"}
                  </p>

                  <p className="admin-reviewer-email">
                    {review.user?.email ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {/* Rating */}

              <div className="admin-review-rating">
                <span
                  className="admin-review-stars"
                  aria-label={`Rating ${review.rating} out of 5`}
                >
                  {"★".repeat(
                    Math.min(
                      5,
                      Math.max(
                        0,
                        Number(review.rating) || 0
                      )
                    )
                  )}
                  {"☆".repeat(
                    5 -
                    Math.min(
                      5,
                      Math.max(
                        0,
                        Number(review.rating) || 0
                      )
                    )
                  )}
                </span>

                <span className="admin-review-rating-value">
                  {review.rating}/5
                </span>
              </div>

              {/* Comment */}

              <div className="admin-review-comment-wrapper">
                <span className="admin-review-comment-label">
                  Comment
                </span>

                <p className="admin-review-comment">
                  {review.comment ||
                    "No comment provided."}
                </p>
              </div>

              {/* Date */}

              <p className="admin-review-date">
                Reviewed on{" "}
                {review.createdAt
                  ? new Date(
                    review.createdAt
                  ).toLocaleDateString("en-IN")
                  : "Not available"}
              </p>

              {/* Delete */}

              <button
                type="button"
                className="admin-review-delete"
                onClick={() =>
                  handleDelete(review._id)
                }
              >
                🗑️ Delete Review
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminReviews;