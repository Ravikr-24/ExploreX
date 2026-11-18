import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import "../styles/addDestination.css";

function AddDestination() {
  const { token } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    category: "",
    images: "",
    attractions: "",
    activities: "",
    bestTimeToVisit: "",
    budget: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

   /* HANDLE INPUT CHANGE */

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  /*  PARSE ATTRACTIONS / ACTIVITIES */

  const parseItemsWithImages = (value) => {
    if (!value.trim()) {
      return [];
    }

    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [namePart, imagesPart = ""] = item.split("|");
        const name = namePart.trim();
        const images = imagesPart.split(",").map((image) => image.trim()).filter(Boolean).slice(0, 3);
        return {
          name, images,
        };
      })
      .filter((item) => item.name);
  };

   /* HANDLE SUBMIT */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /* Required field validation */
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.category.trim() ||
      !formData.budget
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    /*  Budget validation */

    const budgetValue = Number(formData.budget);

    if (
      !Number.isFinite(budgetValue) ||
      budgetValue < 0
    ) {
      setError("Please enter a valid budget.");
      return;
    }

    /* Authorization check */
    if (!token) {
      setError(
        "You are not authorized. Please login again."
      );
      return;
    }

    /*  Parse attractions and activities */
    const attractions = parseItemsWithImages(formData.attractions);

    const activities = parseItemsWithImages(formData.activities);

    try {
      setLoading(true);
      const destinationData = {

        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category.trim(),
        images: formData.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        attractions,
        activities,

        bestTimeToVisit: formData.bestTimeToVisit.trim(),
        budget: budgetValue,
        rating: 0,
      };

      const response = await api.post("/destinations", destinationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(
        "Destination added successfully!"
      );

      setFormData({
        name: "",
        description: "",
        location: "",
        category: "",
        images: "",
        attractions: "",
        activities: "",
        bestTimeToVisit: "",
        budget: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to add destination."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="add-destination-page">

           {/*  HEADER */}

      <header className="add-destination-header">
        <p className="add-destination-label">EXPLOREX ADMIN PANEL</p>
        <h1>Add Destination</h1>
        <p>
          Add a new destination to the ExploreX
          collection.
        </p>
      </header>

              {/* FORM */}

      <form className="add-destination-form" onSubmit={handleSubmit}>
        <section>
          <h2 className="add-destination-section-title">
            Basic Information
          </h2>

          <p className="add-destination-section-description">
            Enter the main details of the destination.
          </p>

          {/* Destination Name */}

          <div className="add-destination-group">
            <label htmlFor="name">
              Destination Name *
            </label>

            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="e.g. Jaipur" required />
          </div>

          <div className="add-destination-group">
            <label htmlFor="description">  Description *</label>

            <textarea id="description" name="description" value={formData.description} onChange={handleChange}
              placeholder="Enter destination description" rows="5" required />
          </div>

          {/* Location + Category */}

          <div className="add-destination-row">
            <div className="add-destination-group">
              <label htmlFor="location">Location *</label>

              <input id="location" name="location" type="text" value={formData.location}
                onChange={handleChange} placeholder="e.g. Rajasthan" required />
            </div>

            <div className="add-destination-group">
              <label htmlFor="category">Category * </label>

              <input id="category" name="category" type="text" value={formData.category} onChange={handleChange}
                placeholder="e.g. Historical" required />
            </div>
          </div>

          {/* Budget + Best Time */}

          <div className="add-destination-row">
            <div className="add-destination-group">
              <label htmlFor="budget"> Budget * </label>

              <input id="budget" name="budget" type="number" min="0" value={formData.budget} onChange={handleChange}
                placeholder="e.g. 15000" required />
            </div>

            <div className="add-destination-group">
              <label htmlFor="bestTimeToVisit">
                Best Time to Visit
              </label>

              <input id="bestTimeToVisit" name="bestTimeToVisit" type="text" value={formData.bestTimeToVisit} onChange={handleChange}
                placeholder="e.g. October to March" />
            </div>
          </div>
        </section>



        <section className="add-destination-section">
          <h2 className="add-destination-section-title"> Destination Images </h2>

          <p className="add-destination-section-description">
            Add images that represent the destination.
          </p>

          <div className="add-destination-group">
            <label htmlFor="images"> Image URLs </label>

            <input id="images" name="images" type="text" value={formData.images} onChange={handleChange} placeholder="url1, url2, url3" />

            <small className="add-destination-help">
              Enter multiple image URLs separated by
              commas.
            </small>
          </div>
        </section>



        <section className="add-destination-section">
          <h2 className="add-destination-section-title">
            Top Attractions
          </h2>

          <p className="add-destination-section-description">
            Add important places visitors can explore.
          </p>

          <div className="add-destination-group">
            <label htmlFor="attractions"> Attractions </label>

            <textarea id="attractions" name="attractions" value={formData.attractions} onChange={handleChange}
              placeholder={`Example:
Hadimba Temple | url1, url2, url3
Solang Valley | url4, url5
Rohtang Pass | url6, url7, url8`}
              rows="7"
            />

            <small className="add-destination-help">
              Add one attraction per line.
              Use <strong>|</strong> between the
              attraction name and image URLs.
              <br />
              You can add up to 3 images per attraction.
            </small>

            <div className="add-destination-format">
              <strong>Format:</strong>
              <br />
              Attraction Name | image-url-1,
              image-url-2, image-url-3
            </div>
          </div>
        </section>

        {/* ========================================
            ACTIVITIES
        ======================================== */}

        <section className="add-destination-section">
          <h2 className="add-destination-section-title">
            Things to Do
          </h2>

          <p className="add-destination-section-description">
            Add activities visitors can enjoy.
          </p>

          <div className="add-destination-group">
            <label htmlFor="activities">
              Activities
            </label>

            <textarea
              id="activities"
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              placeholder={`Example:
Paragliding | url1, url2
Trekking | url3, url4, url5
River Rafting | url6, url7`}
              rows="7"
            />

            <small className="add-destination-help">
              Add one activity per line.
              Use <strong>|</strong> between the
              activity name and image URLs.
              <br />
              You can add up to 3 images per activity.
            </small>

            <div className="add-destination-format">
              <strong>Format:</strong>
              <br />
              Activity Name | image-url-1,
              image-url-2, image-url-3
            </div>
          </div>
        </section>

        {/* ========================================
            MESSAGES
        ======================================== */}

        {error && (
          <div className="add-destination-message add-destination-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="add-destination-message add-destination-success">
            ✓ {success}
          </div>
        )}

        {/* ========================================
            ACTIONS
        ======================================== */}

        <div className="add-destination-submit-area">
          <Link to="/admin/destinations" className="add-destination-cancel"> Cancel </Link>

          <button type="submit" className="add-destination-submit" disabled={loading}>
            {loading ? (
              <span className="add-destination-loading">
                <span className="add-destination-spinner"></span>
                Adding Destination...
              </span>
            ) : (
              "Add Destination"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AddDestination;