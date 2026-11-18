import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/DestinationDetails.css";
import "../styles/reviews.css";

function DestinationDetails() {
  const { id } = useParams();
  const { token, user } = useSelector(
    (state) => state.auth
  );


  /* DESTINATION STATE */

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

   /* DESTINATION IMAGE GALLERY*/
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

   /* ITEM IMAGE GALLERY*/
  const [itemGalleryImages, setItemGalleryImages] = useState([]);
  const [itemGalleryIndex, setItemGalleryIndex] = useState(0);
  const [itemGalleryTitle, setItemGalleryTitle] = useState("");
  const [showItemGallery, setShowItemGallery] = useState(false);

  /* FAVORITE STATE */

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

   /* REVIEW STATE */

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [reviewsError, setReviewsError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");


  /* EDIT REVIEW STATE */


  const [editingReviewId, setEditingReviewId] = useState(null);

  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editLoading, setEditLoading] = useState(false);


   /* FETCH DESTINATION */

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/destinations/${id}`);

        setDestination(response.data.destination);

        /* Reset gallery when destination changes */
        setActiveImageIndex(0);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load destination."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDestination();
    }
  }, [id]);


   /* DESTINATION IMAGE HELPERS */


  const destinationImages =
    Array.isArray(destination?.images) ? destination.images.filter(Boolean) : [];

  const imageCount = destinationImages.length;
  const currentImage = destinationImages[activeImageIndex] || destinationImages[0] || "";
  const visibleDestinationImages = destinationImages.slice(0, 6);
  const remainingImageCount = imageCount > 6 ? imageCount - 6 : 0;


   /* DESTINATION GALLERY */

  const showNextImage = () => {
    if (imageCount <= 1) {
      return;
    }

    setActiveImageIndex(
      (previousIndex) =>
        (previousIndex + 1) % imageCount
    );
  };

  const showPreviousImage = () => {
    if (imageCount <= 1) {
      return;
    }

    setActiveImageIndex((previousIndex) => (previousIndex - 1 + imageCount) % imageCount);
  };

  const handleThumbnailClick = (index) => {
    setActiveImageIndex(index);
  };

  const openDestinationViewer = (index = 0) => {
    setActiveImageIndex(index);
    setShowImageViewer(true);
  };

  const closeDestinationViewer = () => {
    setShowImageViewer(false);
  };



  const normalizeItem = (item) => {
    // Old database format:
    // "Hadimba Temple"
    if (typeof item === "string") {
      return {
        name: item,
        images: [],
      };
    }

    // New database format:
    // {
    //   name: "Hadimba Temple",
    //   images: [...]
    // }

    return {
      name: item?.name || "Untitled",
      images: Array.isArray(item?.images) ? item.images.filter(Boolean) : [],
    };
  };


   /* GET FIRST 3 PREVIEW IMAGES */

  const getPreviewImages = (images) => {
    if (!Array.isArray(images)) {
      return [];
    }

    return images
      .filter(Boolean)
      .slice(0, 3);
  };

   /* ITEM IMAGE GALLERY */

  const openItemGallery = (
    images,
    title,
    startIndex = 0
  ) => {
    if (!Array.isArray(images) || images.length === 0) {
      return;
    }

    setItemGalleryImages(images);
    setItemGalleryTitle(title);
    setItemGalleryIndex(
      Math.min(
        Math.max(startIndex, 0),
        images.length - 1
      )
    );
    setShowItemGallery(true);
  };

  const closeItemGallery = () => {
    setShowItemGallery(false);
    setItemGalleryImages([]);
    setItemGalleryIndex(0);
    setItemGalleryTitle("");
  };

  const showNextItemImage = () => {
    if (itemGalleryImages.length <= 1) {
      return;
    }

    setItemGalleryIndex(
      (previousIndex) =>
        (previousIndex + 1) %
        itemGalleryImages.length
    );
  };

  const showPreviousItemImage = () => {
    if (itemGalleryImages.length <= 1) {
      return;
    }

    setItemGalleryIndex(
      (previousIndex) => (previousIndex - 1 + itemGalleryImages.length) % itemGalleryImages.length);
  };




  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showImageViewer) {
        if (event.key === "Escape") {
          closeDestinationViewer();
        }

        if (event.key === "ArrowRight") {
          showNextImage();
        }

        if (event.key === "ArrowLeft") {
          showPreviousImage();
        }
      }

      if (showItemGallery) {
        if (event.key === "Escape") {
          closeItemGallery();
        }

        if (event.key === "ArrowRight") {
          showNextItemImage();
        }

        if (event.key === "ArrowLeft") {
          showPreviousItemImage();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    showImageViewer,
    showItemGallery,
    imageCount,
    itemGalleryImages.length,
  ]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError("");

      const response = await api.get(`/reviews/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      setReviewsError(error.response?.data?.message || "Failed to load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!token || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await api.get("/favorites");
        const favorites = response.data.favorites || [];
        const alreadyFavorite = favorites.some((favorite) => favorite.destination?._id === id || favorite.destination === id);
        setIsFavorite(alreadyFavorite);
      } catch (error) {
        (
          "Failed to check favorite status:", error
        );
      }
    };
    checkFavoriteStatus();
  }, [token, id]);


  const handleFavorite = async () => {
    if (!token) {
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post("/favorites", {
          destinationId: id,
        });
        setIsFavorite(true);
      }
    } catch (error) {
    } finally {
      setFavoriteLoading(false);
    }
  };
  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewSuccess("");
    setReviewsError("");

    if (!token) {
      setReviewsError(
        "Please login to submit a review."
      );
      return;
    }
    if (!comment.trim()) {
      setReviewsError(
        "Please write a comment."
      );
      return;
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      setReviewsError(
        "Rating must be between 1 and 5."
      );
      return;
    }

    setReviewLoading(true);

    try {
      const response = await api.post("/reviews", {
        destinationId: id,
        rating: Number(rating),
        comment: comment.trim(),
      });

      setReviewSuccess(
        response.data.message ||
        "Review submitted successfully."
      );

      setRating(5);
      setComment("");

      await fetchReviews();

      const destinationResponse =
        await api.get(
          `/destinations/${id}`
        );

      setDestination(
        destinationResponse.data.destination
      );
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setReviewsError(
          validationErrors[0].message ||
          validationErrors[0]
        );
      } else {
        setReviewsError(
          error.response?.data?.message ||
          "Failed to submit review."
        );
      }
    } finally {
      setReviewLoading(false);
    }
  };


  const handleEditStart = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);

    setReviewsError("");
    setReviewSuccess("");
  };


  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  };

  const handleReviewUpdate = async (
    reviewId
  ) => {
    if (!editComment.trim()) {
      setReviewsError(
        "Please write a comment."
      );
      return;
    }

    if (
      Number(editRating) < 1 ||
      Number(editRating) > 5
    ) {
      setReviewsError(
        "Rating must be between 1 and 5."
      );
      return;
    }

    setEditLoading(true);
    setReviewsError("");
    setReviewSuccess("");

    try {
      const response = await api.put(
        `/reviews/${reviewId}`,
        {
          rating: Number(editRating),
          comment: editComment.trim(),
        }
      );

      setReviewSuccess(
        response.data.message ||
        "Review updated successfully."
      );

      setEditingReviewId(null);
      setEditRating(5);
      setEditComment("");

      await fetchReviews();

      const destinationResponse =
        await api.get(
          `/destinations/${id}`
        );

      setDestination(
        destinationResponse.data.destination
      );
    } catch (error) {
      const validationErrors =
        error.response?.data?.errors;

      if (validationErrors?.length > 0) {
        setReviewsError(
          validationErrors[0].message ||
          validationErrors[0]
        );
      } else {
        setReviewsError(
          error.response?.data?.message ||
          "Failed to update review."
        );
      }
    } finally {
      setEditLoading(false);
    }
  };


  const handleReviewDelete = async (
    reviewId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    setReviewsError("");
    setReviewSuccess("");

    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      setReviewSuccess(
        response.data.message ||
        "Review deleted successfully."
      );

      await fetchReviews();

      const destinationResponse =
        await api.get(
          `/destinations/${id}`
        );

      setDestination(
        destinationResponse.data.destination
      );
    } catch (error) {
      setReviewsError(
        error.response?.data?.message ||
        "Failed to delete review."
      );
    }
  };



  const renderStars = (value) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={
            i <= value
              ? "star filled"
              : "star"
          }
        >
          ★
        </span>
      );
    }

    return stars;
  };



  if (loading) {
    return (
      <main className="destination-details-page">
        <p className="status-message">
          Loading destination...
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main className="destination-details-page">
        <p className="error-message">
          {error}
        </p>

        <Link to="/explore">
          Back to Explore
        </Link>
      </main>
    );
  }



  if (!destination) {
    return (
      <main className="destination-details-page">
        <p className="error-message">
          Destination not found.
        </p>

        <Link to="/explore">
          Back to Explore
        </Link>
      </main>
    );
  }


  return (
    <main className="destination-details-page">
      <section className="destination-gallery-section">

        <div className="destination-gallery">

          <button type="button" className="destination-gallery-main" onClick={() => openDestinationViewer(activeImageIndex)}
            aria-label={`View ${destination.name} photos`}>
            {currentImage ? (
              <img src={currentImage} alt={destination.name} />) : (
              <div className="destination-gallery-empty">
                No image available
              </div>
            )}

            {imageCount > 1 && (
              <>
                <button type="button" className="destination-gallery-arrow destination-gallery-left" onClick={(event) => {
                  event.stopPropagation();
                  showPreviousImage();
                }}
                  aria-label="Previous destination image">
                  ‹
                </button>

                <button type="button" className="destination-gallery-arrow destination-gallery-right" onClick={(event) => {
                  event.stopPropagation();
                  showNextImage();
                }}
                  aria-label="Next destination image">
                  ›
                </button>
              </>
            )}

            {imageCount > 0 && (
              <span className="destination-gallery-counter">
                {activeImageIndex + 1} /{" "}
                {imageCount}
              </span>
            )}
          </button>

          {imageCount > 0 && (
            <div className="destination-gallery-thumbnails">

              {visibleDestinationImages.map(
                (image, index) => {
                  const isLastVisible = index === 5 && remainingImageCount > 0;

                  return (
                    <button key={`${image}-${index}`} type="button" className={activeImageIndex === index ? "destination-thumbnail active" : "destination-thumbnail"}
                      onClick={() => handleThumbnailClick(index)}
                      aria-label={`View destination image ${index + 1}`} >
                      <img src={image} alt={`${destination.name} ${index + 1}`}
                        loading="lazy" />

                      {isLastVisible && (
                        <span className="thumbnail-more">+{remainingImageCount} </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          )}

          {imageCount > 1 && (
            <button type="button" className="view-all-images-button" onClick={() => openDestinationViewer(activeImageIndex)}>
              View All Photos
            </button>
          )}
        </div>
      </section>

      {/*  DESTINATION INFORMATION */}

      <section className="destination-details">
        <div className="destination-details-content">
          <p className="destination-details-category">{destination.category}</p>

          <h1>{destination.name}</h1>
          <p className="destination-details-location">  📍 {destination.location} </p>

          <p className="destination-details-description">  {destination.description}</p>

          <div className="destination-info-grid">

            <div>
              <span>Budget</span>

              <strong>
                ₹
                {Number(
                  destination.budget
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Rating</span>

              <strong>
                ⭐{" "}
                {Number(
                  destination.rating || 0
                ).toFixed(1)}
              </strong>
            </div>

            <div>
              <span>Best Time</span>

              <strong>
                {destination.bestTimeToVisit ||
                  "Not specified"}
              </strong>
            </div>
          </div>

          {/* FAVORITE */}

          {token && (
            <button type="button" onClick={handleFavorite} disabled={favoriteLoading} className="favorite-button">
              {favoriteLoading ? "Updating..." : isFavorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
            </button>
          )}

        </div>
      </section>

      {/* ATTRACTIONS */}

      <section className="destination-details-section">

        <div className="section-heading">
          <p className="section-label"> PLACES TO VISIT </p>
          <h2>Top Attractions</h2>
        </div>

        {destination.attractions?.length > 0 ? (
          <div className="attractions-grid">

            {destination.attractions.map((item, index) => {
              const attraction = normalizeItem(item);

              const previewImages = getPreviewImages(attraction.images);

              return (
                <article className="attraction-card" key={`${attraction.name}-${index}`} >

                  {previewImages.length > 0 ? (
                    <div className="item-gallery-preview" style={{
                      gridTemplateColumns: `repeat(${Math.min(previewImages.length, 3)}, 1fr)`,
                    }}>
                      {previewImages.map((image, imageIndex) => {
                        const showMore = imageIndex === 2 && attraction.images.length > 3;

                        return (
                          <button key={`${image}-${imageIndex}`} type="button" className="item-gallery-image-button"
                            onClick={() => openItemGallery(attraction.images, attraction.name, imageIndex)
                            }
                            aria-label={`View photo ${imageIndex + 1} of ${attraction.name}`}>
                            <img src={image} alt={`${attraction.name} ${imageIndex + 1}`} loading="lazy" />

                            {showMore && (<span className="item-gallery-more"> + {attraction.images.length - 3}{" "} Photos  </span>)}
                          </button>
                        );
                      }
                      )}
                    </div>
                  ) : (
                    <div className="attraction-icon">
                      📍
                    </div>
                  )}

                  <div className="attraction-content">
                    <h3>{attraction.name} </h3>

                    {attraction.images.length > 0 && (
                      <button type="button" className="attraction-view-button"
                        onClick={() => openItemGallery(attraction.images, attraction.name)}>
                        View Photos →
                      </button>
                    )}
                  </div>
                </article>
              );
            }
            )}
          </div>
        ) : (
          <div className="empty-section-state">
            <p>
              No attractions available.
            </p>
          </div>
        )}

      </section>

      {/* ACTIVITIES */}

      <section className="destination-details-section">

        <div className="section-heading">
          <p className="section-label"> EXPERIENCES </p>

          <h2>Things to Do</h2>
        </div>

        {destination.activities?.length > 0 ? (
          <div className="activities-list">

            {destination.activities.map(
              (item, index) => {
                const activity = normalizeItem(item);

                const previewImages = getPreviewImages(activity.images);

                return (
                  <article className="activity-card" key={`${activity.name}-${index}`} >

                    {previewImages.length > 0 ? (
                      <div className="item-gallery-preview activity-item-gallery-preview"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(previewImages.length, 3)}, 1fr)`,
                        }} >
                        {previewImages.map((image, imageIndex) => {
                          const showMore = imageIndex === 2 && activity.images.length > 3;

                          return (
                            <button key={`${image}-${imageIndex}`} type="button" className="item-gallery-image-button"
                              onClick={() => openItemGallery(activity.images, activity.name, imageIndex)}
                              aria-label={`View photo ${imageIndex + 1} of ${activity.name}`} >
                              <img src={image} alt={`${activity.name} ${imageIndex + 1}`} loading="lazy" />

                              {showMore && (
                                <span className="item-gallery-more">+ {activity.images.length - 3}{" "} Photos</span>)}
                            </button>
                          );
                        }
                        )}
                      </div>
                    ) : (
                      <span className="activity-icon">
                        ✨
                      </span>
                    )}

                    <div className="activity-content">

                      <h3> {activity.name} </h3>

                      {activity.images.length > 0 && (
                        <button type="button" className="activity-view-button" onClick={() => openItemGallery(activity.images, activity.name)}>
                          View Photos →
                        </button>
                      )}
                    </div>
                  </article>
                );
              }
            )}

          </div>
        ) : (
          <div className="empty-section-state">
            <p>  No activities available </p>
          </div>
        )}
      </section>

      {/* REVIEWS */}

      <section className="reviews-section">
        <div className="reviews-header">
          <div>
            <p className="reviews-label"> TRAVELER FEEDBACK </p>
            <h2> Reviews & Ratings </h2>
          </div>

          <div className="reviews-rating-summary">
            <strong>
              ⭐{" "}
              {Number(destination.rating || 0).toFixed(1)}
            </strong>

            <span>
              {reviews.length}{" "}
              {reviews.length === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        </div>

        {/* REVIEW MESSAGES */}

        {reviewsError && (
          <div className="review-message error">
            {reviewsError}
          </div>
        )}

        {reviewSuccess && (
          <div className="review-message success">
            {reviewSuccess}
          </div>
        )}

        {/* ADD REVIEW FORM */}

        {token ? (
          <div className="review-form-card">

            <h3>  Share Your Experience </h3>

            <form onSubmit={handleReviewSubmit}>
              <div className="rating-input">

                <label> Your Rating </label>

                <div className="rating-buttons">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button type="button" key={star}
                        className={star <= rating ? "rating-star active" : "rating-star"}
                        onClick={() => setRating(star)} aria-label={`${star} star rating`}>
                        ★
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="review-comment-group">

                <label htmlFor="review-comment"> Your Review </label>

                <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your experience about this destination..." rows="5" maxLength={1000} />

                <small>
                  {comment.length}/1000
                </small>

              </div>

              <button type="submit" className="submit-review-button" disabled={reviewLoading} >
                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-review-message">
            <p>
              Please login to share your
              experience.
            </p>

            <Link to="/login">  Login to Review </Link>

          </div>
        )}

        {/*
            REVIEWS LIST
         */}

        <div className="reviews-list">

          {reviewsLoading ? (
            <p className="status-message">
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">

              <h3> No Reviews Yet </h3>

              <p>
                Be the first person to
                review this destination.
              </p>

            </div>
          ) : (
            reviews.map((review) => {

              const reviewUser = review.user || {};

              const isOwner = user?._id === reviewUser._id ||
                user?.id === reviewUser._id ||
                user?._id === reviewUser.id ||
                user?.id === reviewUser.id;

              const isEditing = editingReviewId === review._id;

              return (
                <article className="review-card" key={review._id}>

                  {/* REVIEW HEADER */}

                  <div className="review-card-header">
                    <div className="review-user">
                      <div className="review-avatar"> {reviewUser.name?.charAt(0).toUpperCase() || "U"} </div>
                      <div>
                        <h4>
                          {reviewUser.name ||
                            "Anonymous User"}
                        </h4>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <div className="review-stars">
                      {renderStars(
                        review.rating
                      )}
                    </div>
                  </div>

                  {/* EDIT MODE */}

                  {isEditing ? (
                    <div className="review-edit-form">
                      <div className="rating-input">
                        <label> Rating</label>
                        <div className="rating-buttons">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <button type="button" key={star} className={star <= editRating ? "rating-star active" : "rating-star"}
                                onClick={() => setEditRating(star)}>
                                ★
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows="4" maxLength={1000} />
                      <div className="review-edit-actions">
                        <button type="button" className="save-review-button" onClick={() => handleReviewUpdate(review._id)} disabled={editLoading}>
                          {editLoading ? "Saving..." : "Save Changes"}
                        </button>

                        <button type="button" className="cancel-review-button" onClick={handleEditCancel} disabled={editLoading}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* REVIEW COMMENT */}

                      <p className="review-comment">  {review.comment} </p>

                      {/* REVIEW ACTIONS */}

                      {isOwner && (
                        <div className="review-actions">

                          <button type="button" onClick={() => handleEditStart(review)}>  Edit </button>
                          <button type="button" onClick={() => handleReviewDelete(review._id)}> Delete </button>

                        </div>
                      )}
                    </>
                  )}
                </article>
              );
            })
          )}

        </div>
      </section>

      {/*   BACK BUTTON */}

      <div className="destination-details-actions">

        <Link to="/explore">
          ← Back to Explore
        </Link>

      </div>

      {/*   DESTINATION IMAGE VIEWER */}

      {
        showImageViewer &&
        destinationImages.length > 0 && (
          <div className="image-viewer" role="dialog" aria-modal="true" aria-label={`${destination.name} image viewer`}  onClick={closeDestinationViewer}>

            <button type="button" className="image-viewer-close" onClick={closeDestinationViewer}  aria-label="Close image viewer" >
              ×

            </button>

            {imageCount > 1 && (
              <>
                <button type="button" className="image-viewer-arrow image-viewer-left"
                  onClick={(event) => {
                    event.stopPropagation();
                    showPreviousImage();
                  }} aria-label="Previous image">
                  ‹
                </button>

                <button
                  type="button" className="image-viewer-arrow image-viewer-right"
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();  }}
                    aria-label="Next image">
                  ›
                </button>
              </>
            )}

            <img src={destinationImages[activeImageIndex]} alt={`${destination.name} ${activeImageIndex + 1}`} className="image-viewer-image"
              onClick={(event) =>
                event.stopPropagation()
              }/>

            <div className="image-viewer-counter" onClick={(event) => event.stopPropagation()}>
              {activeImageIndex + 1} /{" "}
              {imageCount}
            </div>
          </div>
        )
      }

      {/*
          ATTRACTION / ACTIVITY
          IMAGE VIEWER
       */}

      {
        showItemGallery &&
        itemGalleryImages.length > 0 && (
          <div className="item-image-viewer" role="dialog" aria-modal="true" aria-label={`${itemGalleryTitle} image viewer`}
           onClick={closeItemGallery}>

            <button type="button" className="item-image-viewer-close"onClick={closeItemGallery} aria-label="Close image viewer" >
              ×
            </button>

            {itemGalleryImages.length >
              1 && (
                <>
                  <button type="button" className="item-image-viewer-arrow item-image-viewer-left" onClick={(event) => {event.stopPropagation();
                      showPreviousItemImage();
                    }}
                    aria-label="Previous image">
                    ‹
                  </button>

                  <button type="button" className="item-image-viewer-arrow item-image-viewer-right"
                    onClick={(event) => {
                      event.stopPropagation();
                      showNextItemImage();
                    }} aria-label="Next image" >
                    ›
                  </button>
                </>
              )}

            <img src={itemGalleryImages[itemGalleryIndex]}
              alt={`${itemGalleryTitle} ${itemGalleryIndex + 1}`}className="item-image-viewer-image" onClick={(event) =>event.stopPropagation()} />

            <div className="item-image-viewer-counter" onClick={(event) => event.stopPropagation()}>
              {itemGalleryIndex + 1} /{" "}
              {itemGalleryImages.length}
            </div>

            <div className="item-image-viewer-title" onClick={(event) => event.stopPropagation()}>
              {itemGalleryTitle}
            </div>
          </div>
        )
      }

    </main >
  );
}
export default DestinationDetails;