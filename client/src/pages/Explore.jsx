import { useEffect, useState } from "react";
import api from "../services/api";
import DestinationCard from "../components/DestinationCard";

import "../styles/explore.css";

function Explore() {
  const [destinations, setDestinations] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [budget, setBudget] = useState("All");
  const [rating, setRating] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await api.get("/destinations");

        setDestinations(response.data.destinations);
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

  // Get unique categories
  const categories = [
    "All",
    ...new Set(
      destinations
        .map((destination) => destination.category)
        .filter(Boolean)
    ),
  ];

  // Search + Category + Budget + Rating filtering
  const filteredDestinations = destinations.filter((destination) => {
    const searchText = search.toLowerCase().trim();

    // Search filter
    const matchesSearch =
      destination.name.toLowerCase().includes(searchText) ||
      destination.location.toLowerCase().includes(searchText) ||
      destination.category.toLowerCase().includes(searchText);

    // Category filter
    const matchesCategory =
      category === "All" ||
      destination.category.toLowerCase() ===
        category.toLowerCase();

    // Budget filter
    let matchesBudget = true;

    if (budget === "under10k") {
      matchesBudget = destination.budget < 10000;
    } else if (budget === "10k20k") {
      matchesBudget =
        destination.budget >= 10000 &&
        destination.budget <= 20000;
    } else if (budget === "20k50k") {
      matchesBudget =
        destination.budget > 20000 &&
        destination.budget <= 50000;
    } else if (budget === "above50k") {
      matchesBudget = destination.budget > 50000;
    }

    // Rating filter
    let matchesRating = true;

    if (rating !== "All") {
      matchesRating =
        destination.rating >= Number(rating);
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBudget &&
      matchesRating
    );
  });

  // Loading state
  if (loading) {
    return (
      <main className="explore-page">
        <p className="status-message">
          Loading destinations...
        </p>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="explore-page">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  return (
    <main className="explore-page">
      {/* Explore Header */}
      <section className="explore-header">
        <p className="explore-label">
          DISCOVER INDIA
        </p>

        <h1>Explore Destinations</h1>

        <p>
          Find beautiful places, discover new experiences,
          and plan your next adventure with ExploreX.
        </p>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by destination, location or category..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* Filters */}
        <div className="filter-container">
          {/* Category */}
          <label htmlFor="category">
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Budget */}
          <label htmlFor="budget">
            Budget
          </label>

          <select
            id="budget"
            value={budget}
            onChange={(event) =>
              setBudget(event.target.value)
            }
          >
            <option value="All">
              All Budgets
            </option>

            <option value="under10k">
              Under ₹10,000
            </option>

            <option value="10k20k">
              ₹10,000 – ₹20,000
            </option>

            <option value="20k50k">
              ₹20,001 – ₹50,000
            </option>

            <option value="above50k">
              Above ₹50,000
            </option>
          </select>

          {/* Rating */}
          <label htmlFor="rating">
            Rating
          </label>

          <select
            id="rating"
            value={rating}
            onChange={(event) =>
              setRating(event.target.value)
            }
          >
            <option value="All">
              All Ratings
            </option>

            <option value="4">
              ⭐ 4+ Rating
            </option>

            <option value="3">
              ⭐ 3+ Rating
            </option>

            <option value="2">
              ⭐ 2+ Rating
            </option>

            <option value="1">
              ⭐ 1+ Rating
            </option>
          </select>
        </div>
      </section>

      {/* Destinations */}
      <section className="destination-section">
        {filteredDestinations.length === 0 ? (
          <div className="empty-state">
            <h2>No destinations found</h2>

            <p>
              Try changing your search, category,
              budget, or rating filter.
            </p>
          </div>
        ) : (
          <div className="destination-grid">
            {filteredDestinations.map(
              (destination) => (
                <DestinationCard
                  key={destination._id}
                  destination={destination}
                />
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Explore;