import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/editDestination.css";

function EditDestination() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // CONVERT ATTRACTION / ACTIVITY TO TEXT
  // ========================================

  const formatItemsWithImages = (items) => {
    if (!Array.isArray(items)) {
      return "";
    }

    return items
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (item && typeof item === "object") {
          const name =
            typeof item.name === "string"
              ? item.name.trim()
              : "";

          if (!name) {
            return "";
          }

          const images = Array.isArray(item.images)
            ? item.images
              .filter(
                (image) =>
                  typeof image === "string"
              )
              .map((image) => image.trim())
              .filter(Boolean)
              .slice(0, 3)
              .join(", ")
            : "";

          return images
            ? `${name} | ${images}`
            : name;
        }

        return "";
      })
      .filter(Boolean)
      .join("\n");
  };

  // ========================================
  // FETCH DESTINATION
  // ========================================

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/destinations/${id}`
        );

        const destination =
          response.data.destination;

        setFormData({
          name: destination.name || "",

          description:
            destination.description || "",

          location:
            destination.location || "",

          category:
            destination.category || "",

          images: Array.isArray(
            destination.images
          )
            ? destination.images
              .filter(Boolean)
              .join(", ")
            : "",

          attractions:
            formatItemsWithImages(
              destination.attractions
            ),

          activities:
            formatItemsWithImages(
              destination.activities
            ),

          bestTimeToVisit:
            destination.bestTimeToVisit || "",

          budget:
            destination.budget ?? "",
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load destination."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchDestination();
    }
  }, [id, token]);

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ========================================
  // PARSE ATTRACTIONS / ACTIVITIES
  // ========================================

  const parseItemsWithImages = (value) => {
    if (!value.trim()) {
      return [];
    }

    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [namePart, imagesPart = ""] =
          item.split("|");

        const name = namePart.trim();

        const images = imagesPart
          .split(",")
          .map((image) => image.trim())
          .filter(Boolean)
          .slice(0, 3);

        return {
          name,
          images,
        };
      })
      .filter((item) => item.name);
  };

  // ========================================
  // HANDLE SUBMIT
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Required field validation
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

    // Budget validation
    const budgetValue = Number(
      formData.budget
    );

    if (
      !Number.isFinite(budgetValue) ||
      budgetValue < 0
    ) {
      setError(
        "Please enter a valid budget."
      );
      return;
    }

    // Authorization check
    if (!token) {
      setError(
        "You are not authorized. Please login again."
      );
      return;
    }

    try {
      setSaving(true);

      const destinationData = {
        name: formData.name.trim(),

        description:
          formData.description.trim(),

        location:
          formData.location.trim(),

        category:
          formData.category.trim(),

        images: formData.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        attractions:
          parseItemsWithImages(
            formData.attractions
          ),

        activities:
          parseItemsWithImages(
            formData.activities
          ),

        bestTimeToVisit:
          formData.bestTimeToVisit.trim(),

        budget: budgetValue,
      };

      await api.put(
        `/destinations/${id}`,
        destinationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        "Destination updated successfully!"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update destination."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="edit-destination-loading">
        <div className="edit-destination-spinner"></div>
        <p>Loading destination...</p>
      </main>
    );
  }

  // ========================================
  // ERROR WHILE LOADING
  // ========================================

  if (error && !formData.name) {
    return (
      <main className="edit-destination-page">
        <div className="edit-destination-message edit-destination-error">
          ⚠️ {error}
        </div>

        <button
          type="button"
          className="edit-destination-cancel"
          onClick={() =>
            navigate("/admin/destinations")
          }
        >
          Back to Destinations
        </button>
      </main>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main className="edit-destination-page">
      {/* ========================================
          HEADER
      ======================================== */}

      <header className="edit-destination-header">
        <p className="edit-destination-label">
          EXPLOREX ADMIN PANEL
        </p>

        <h1>Edit Destination</h1>

        <p>
          Update the destination information below.
        </p>
      </header>

      {/* ========================================
          FORM
      ======================================== */}

      <form
        className="edit-destination-form"
        onSubmit={handleSubmit}
      >
        {/* ========================================
            BASIC INFORMATION
        ======================================== */}

        <section className="edit-destination-section">
          <h2 className="edit-destination-section-title">
            Basic Information
          </h2>

          <p className="edit-destination-section-description">
            Update the main details of this
            destination.
          </p>

          {/* Name */}

          <div className="edit-destination-group">
            <label htmlFor="name">
              Destination Name *
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}

          <div className="edit-destination-group">
            <label htmlFor="description">
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          {/* Location + Category */}

          <div className="edit-destination-row">
            <div className="edit-destination-group">
              <label htmlFor="location">
                Location *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-destination-group">
              <label htmlFor="category">
                Category *
              </label>

              <input
                id="category"
                name="category"
                type="text"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Budget + Best Time */}

          <div className="edit-destination-row">
            <div className="edit-destination-group">
              <label htmlFor="budget">
                Budget *
              </label>

              <input
                id="budget"
                name="budget"
                type="number"
                min="0"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 15000"
                required
              />
            </div>

            <div className="edit-destination-group">
              <label htmlFor="bestTimeToVisit">
                Best Time to Visit
              </label>

              <input
                id="bestTimeToVisit"
                name="bestTimeToVisit"
                type="text"
                value={formData.bestTimeToVisit}
                onChange={handleChange}
                placeholder="October to March"
              />
            </div>
          </div>
        </section>

        {/* ========================================
            DESTINATION IMAGES
        ======================================== */}

        <section className="edit-destination-section">
          <h2 className="edit-destination-section-title">
            Destination Images
          </h2>

          <p className="edit-destination-section-description">
            Update the images displayed for this
            destination.
          </p>

          <div className="edit-destination-group">
            <label htmlFor="images">
              Image URLs
            </label>

            <input
              id="images"
              name="images"
              type="text"
              value={formData.images}
              onChange={handleChange}
              placeholder="URL 1, URL 2, URL 3"
            />

            <small className="edit-destination-help">
              Separate multiple destination images
              with commas.
            </small>
          </div>
        </section>

        {/* ========================================
            ATTRACTIONS
        ======================================== */}

        <section className="edit-destination-section">
          <h2 className="edit-destination-section-title">
            Top Attractions
          </h2>

          <p className="edit-destination-section-description">
            Update important places visitors can
            explore.
          </p>

          <div className="edit-destination-group">
            <label htmlFor="attractions">
              Attractions
            </label>

            <textarea
              id="attractions"
              name="attractions"
              value={formData.attractions}
              onChange={handleChange}
              placeholder={`Example:
Hadimba Temple | url1, url2, url3
Solang Valley | url4, url5
Rohtang Pass | url6, url7, url8`}
              rows="7"
            />

            <small className="edit-destination-help">
              Add one attraction per line.
              Use <strong>|</strong> between the
              attraction name and image URLs.
              <br />
              You can add up to 3 images per
              attraction.
            </small>

            <div className="edit-destination-format">
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

        <section className="edit-destination-section">
          <h2 className="edit-destination-section-title">
            Things to Do
          </h2>

          <p className="edit-destination-section-description">
            Update activities visitors can enjoy.
          </p>

          <div className="edit-destination-group">
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

            <small className="edit-destination-help">
              Add one activity per line.
              Use <strong>|</strong> between the
              activity name and image URLs.
              <br />
              You can add up to 3 images per
              activity.
            </small>

            <div className="edit-destination-format">
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
          <div className="edit-destination-message edit-destination-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="edit-destination-message edit-destination-success">
            ✓ {success}
          </div>
        )}

        {/* ========================================
            ACTIONS
        ======================================== */}

        <div className="edit-destination-actions">
          <button
            type="button"
            className="edit-destination-cancel"
            onClick={() =>
              navigate("/admin/destinations")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-destination-submit"
            disabled={saving}
          >
            {saving
              ? "Saving Changes..."
              : "Update Destination"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditDestination;