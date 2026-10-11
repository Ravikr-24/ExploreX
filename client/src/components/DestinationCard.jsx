import { Link } from "react-router-dom";
import "./DestinationCard.css";


function DestinationCard({ destination }) {
  return (
    <article className="destination-card">
      {/* Destination Image */}
      <div className="destination-card-image-wrapper">
        <img
          className="destination-card-image"
          src={destination.images?.[0]}
          alt={destination.name}
        />

        {/* Category Badge */}
        <span className="destination-category-badge">
          {destination.category}
        </span>
      </div>

      {/* Destination Details */}
      <div className="destination-card-content">
        <h3>{destination.name}</h3>

        {/* Location */}
        <p className="destination-location">
          <span>📍</span>
          {destination.location}
        </p>

        {/* Destination Information */}
        <div className="destination-info">
          <div className="destination-info-item">
            <span className="destination-info-icon">💰</span>

            <div>
              <span className="destination-info-label">
                Budget
              </span>

              <strong>
                ₹{destination.budget}
              </strong>
            </div>
          </div>

          <div className="destination-info-item">
            <span className="destination-info-icon">⭐</span>

            <div>
              <span className="destination-info-label">
                Rating
              </span>

              <strong>
                {Number(destination.rating || 0).toFixed(1)}
              </strong>
            </div>
          </div>
        </div>

        {/* View Details */}
        <Link
          className="destination-card-link"
          to={`/destination/${destination._id}`}
        >
          <span>View Details</span>
          <span className="destination-card-arrow">→</span>
        </Link>
      </div>
    </article>
  );
}

export default DestinationCard;