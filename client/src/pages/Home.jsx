import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import "../styles/home.css";


function Home() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchDestinations = async () => {
      try {
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

    fetchDestinations();
  }, []);

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-hero-label">
            DISCOVER • EXPLORE • EXPERIENCE
          </p>

          <h1>
            Discover Your
            <span> Next Adventure</span>
          </h1>

          <p className="home-hero-text">
            Explore beautiful destinations, discover amazing
            experiences, and plan your perfect journey with ExploreX.
          </p>

          <div className="home-hero-actions">
            <Link to="/explore" className="home-primary-button">
              Explore Destinations
            </Link>

            <Link to="/travel-plans" className="home-secondary-button">
              Plan Your Trip
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="home-intro">
        <p className="home-section-label">
          YOUR JOURNEY STARTS HERE
        </p>

        <h2>Travel More. Discover More.</h2>

        <p>
          ExploreX helps you discover exciting destinations across India.
          Find places that match your interests, save your favorites,
          read reviews, and create your own travel plans.
        </p>
      </section>
      {/* Popular Destinations */}
      <section className="home-destinations">
        <div className="home-destinations-header">
          <div>
            <p className="home-section-label">
              PLACES WORTH VISITING
            </p>

            <h2>Popular Destinations</h2>
          </div>

          <Link
            to="/explore"
            className="home-view-all-button"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="status-message">
            Finding some awesome places for you...
          </p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : destinations.length === 0 ? (
          <p className="status-message">
            No destinations available right now.
          </p>
        ) : (
          <div className="home-destination-grid">
            {destinations.slice(0, 4).map((destination) => (
              <article
                className="home-destination-card"
                key={destination._id}
              >
                <img
                  src={destination.images?.[0]}
                  alt={destination.name}
                  className="home-destination-image"
                />

                <div className="home-destination-content">
                  <p className="home-destination-category">
                    {destination.category}
                  </p>

                  <h3>{destination.name}</h3>

                  <p className="home-destination-location">
                    📍 {destination.location}
                  </p>

                  <div className="home-destination-info">
                    <span>₹{destination.budget}</span>

                    <span>
                      ⭐ {destination.rating}
                    </span>
                  </div>

                  <Link
                    to={`/destination/${destination._id}`}
                    className="home-destination-link"
                  >
                    Check It Out
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>



      {/* Why ExploreX */}
      <section className="home-why">
        <div className="home-why-header">
          <p className="home-section-label">
            WHY EXPLOREX?
          </p>

          <h2>Planning a trip shouldn't feel like homework. 😄</h2>

          <p>
            We keep things simple so you can spend less time
            planning and more time thinking about where to go next.
          </p>
        </div>

        <div className="home-why-grid">
          <Link to="/explore" className="home-why-card">
            <div className="home-why-icon">🔎</div>

            <h3>Find Your Place</h3>

            <p>
              Search destinations by location, category, budget,
              or rating. Finding a good place shouldn't be a puzzle.
            </p>
          </Link>

          <Link to="/favorites" className="home-why-card">
            <div className="home-why-icon">❤️</div>

            <h3>Save What You Like</h3>

            <p>
              Found a destination you really like? Save it and
              come back whenever you're ready to plan.
            </p>
          </Link>

          <Link to="/explore" className="home-why-card">
            <div className="home-why-icon">⭐</div>

            <h3>Check Reviews</h3>

            <p>
              See ratings and reviews before making your travel
              decision. Because surprises are better during the trip.
            </p>
          </Link>

          <Link to="/travel-plans" className="home-why-card">
            <div className="home-why-icon">🗓️</div>

            <h3>Plan Your Trip</h3>

            <p>
              Pick your destinations, dates and budget, then
              create a travel plan that actually makes sense.
            </p>
          </Link>
        </div>
      </section>


      {/* CTA Section */}
      <section className="home-cta">
        <div>
          <p className="home-section-label">
            READY TO EXPLORE?
          </p>

          <h2>Your next adventure is waiting.</h2>

          <p>
            Start exploring destinations and create memories
            worth remembering.
          </p>
        </div>

        <Link to="/explore" className="home-cta-button">
          Start Exploring
        </Link>
      </section>
    </main>
  );
}

export default Home;