import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../services/api";
import "../styles/travelPlans.css";

function TravelPlans() {
  const { token } = useSelector((state) => state.auth);

  // =========================
  // STATE
  // =========================

  const [travelPlans, setTravelPlans] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Form states
  const [title, setTitle] = useState("");
  const [selectedDestinations, setSelectedDestinations] =
    useState([]);

  const [destinationSearch, setDestinationSearch] =
    useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [destinationsLoading, setDestinationsLoading] =
    useState(true);

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit state
  const [editingPlanId, setEditingPlanId] =
    useState(null);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // GET TODAY'S DATE
  // =========================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================
  // FETCH TRAVEL PLANS
  // =========================

  const fetchTravelPlans = async () => {
    try {
      const response = await api.get("/travel-plans");

      setTravelPlans(
        response.data.travelPlans || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load travel plans."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH DESTINATIONS
  // =========================

  const fetchDestinations = async () => {
    try {
      const response = await api.get(
        "/destinations"
      );

      setDestinations(
        response.data.destinations || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load destinations."
      );
    } finally {
      setDestinationsLoading(false);
    }
  };

  // =========================
  // INITIAL DATA FETCH
  // =========================

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setDestinationsLoading(false);
      return;
    }

    fetchTravelPlans();
    fetchDestinations();
  }, [token]);

  // =========================
  // FILTER DESTINATIONS
  // =========================

  const filteredDestinations =
    destinations.filter((destination) => {
      const searchText =
        destinationSearch
          .toLowerCase()
          .trim();

      return (
        destination.name
          .toLowerCase()
          .includes(searchText) ||
        destination.location
          .toLowerCase()
          .includes(searchText) ||
        destination.category
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =========================
  // SELECT / REMOVE DESTINATION
  // =========================

  const handleDestinationSelection = (
    destinationId
  ) => {
    setSelectedDestinations((previous) => {
      if (
        previous.includes(destinationId)
      ) {
        return previous.filter(
          (id) => id !== destinationId
        );
      }

      return [
        ...previous,
        destinationId,
      ];
    });
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setTitle("");
    setSelectedDestinations([]);
    setDestinationSearch("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setNotes("");

    setEditingPlanId(null);
  };

  // =========================
  // EDIT TRAVEL PLAN
  // =========================

  const handleEdit = (plan) => {
    setError("");
    setSuccess("");

    setEditingPlanId(plan._id);

    setTitle(plan.title || "");

    const destinationIds =
      plan.destinations?.map(
        (destination) =>
          typeof destination === "string"
            ? destination
            : destination._id
      ) || [];

    setSelectedDestinations(
      destinationIds
    );

    setStartDate(
      plan.startDate
        ? new Date(plan.startDate)
          .toISOString()
          .split("T")[0]
        : ""
    );

    setEndDate(
      plan.endDate
        ? new Date(plan.endDate)
          .toISOString()
          .split("T")[0]
        : ""
    );

    setBudget(
      plan.budget !== undefined
        ? String(plan.budget)
        : ""
    );

    setNotes(plan.notes || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    resetForm();

    setError("");
    setSuccess("");
  };

  // =========================
  // CREATE / UPDATE PLAN
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------
    // Title validation
    // -------------------------

    if (!title.trim()) {
      setError(
        "Please enter a travel plan title."
      );

      return;
    }

    // -------------------------
    // Destination validation
    // -------------------------

    if (
      selectedDestinations.length === 0
    ) {
      setError(
        "Please select at least one destination."
      );

      return;
    }

    // -------------------------
    // Date validation
    // -------------------------

    if (!startDate || !endDate) {
      setError(
        "Please select start and end dates."
      );

      return;
    }

    const today = getTodayDate();

    // Start date cannot be in past
    if (startDate < today) {
      setError(
        "Start date cannot be in the past."
      );

      return;
    }

    // End date cannot be in past
    if (endDate < today) {
      setError(
        "End date cannot be in the past."
      );

      return;
    }

    // End date cannot be before start date
    if (endDate < startDate) {
      setError(
        "End date cannot be before start date."
      );

      return;
    }

    // -------------------------
    // Budget validation
    // -------------------------

    if (
      budget === "" ||
      Number(budget) < 0 ||
      !Number.isFinite(Number(budget))
    ) {
      setError(
        "Please enter a valid budget."
      );

      return;
    }

    // -------------------------
    // Data to send
    // -------------------------

    const planData = {
      title: title.trim(),
      destinations:
        selectedDestinations,
      startDate,
      endDate,
      budget: Number(budget),
      notes: notes.trim(),
    };

    // =========================
    // UPDATE EXISTING PLAN
    // =========================

    if (editingPlanId) {
      setUpdating(true);

      try {
        const response = await api.put(`/travel-plans/${editingPlanId}`, planData);
        setSuccess(
          response.data.message ||
          "Travel plan updated successfully."
        );

        resetForm();

        await fetchTravelPlans();
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to update travel plan."
        );
      } finally {
        setUpdating(false);
      }

      return;
    }

    // =========================
    // CREATE NEW PLAN
    // =========================

    setCreating(true);

    try {
      const response = await api.post("/travel-plans", planData);

      setSuccess(
        response.data.message ||
        "Travel plan created successfully."
      );

      resetForm();

      await fetchTravelPlans();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create travel plan."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // DELETE TRAVEL PLAN
  // =========================

  const handleDelete = async (planId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this travel plan?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await api.delete(`/travel-plans/${planId}`);
      setSuccess(
        response.data.message ||
        "Travel plan deleted successfully."
      );

      setTravelPlans(
        (previousPlans) =>
          previousPlans.filter(
            (plan) =>
              plan._id !== planId
          )
      );

      if (editingPlanId === planId) {
        resetForm();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete travel plan."
      );
    }
  };

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!token) {
    return (
      <main className="travel-plans-page">
        <section className="travel-plans-empty">

          <h1>My Travel Plans</h1>

          <p>
            Please login to create and
            manage your travel plans.
          </p>

          <Link to="/login">
            Login
          </Link>

        </section>
      </main>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <main className="travel-plans-page">

      {/* =========================
          HEADER
      ========================= */}

      <section className="travel-plans-header">

        <p className="travel-plans-label">
          PLAN YOUR JOURNEY
        </p>

        <h1>
          My Travel Plans
        </h1>

        <p>
          Create, organize, and manage
          your upcoming journeys with
          ExploreX.
        </p>

      </section>

      {/* =========================
          MESSAGES
      ========================= */}

      {error && (
        <div className="travel-plan-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="travel-plan-message success">
          {success}
        </div>
      )}

      {/* =========================
          CREATE / EDIT FORM
      ========================= */}

      <section className="travel-plan-form-section">

        <div className="travel-plan-form-header">

          <div>

            <h2>
              {editingPlanId
                ? "Edit Travel Plan"
                : "Create New Travel Plan"}
            </h2>

            {editingPlanId && (
              <p>
                Update your travel plan
                details below.
              </p>
            )}

          </div>

        </div>

        <form
          className="travel-plan-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              TITLE
          ========================= */}

          <div className="form-group">

            <label htmlFor="title">
              Plan Title
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Manali Adventure"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              maxLength={100}
              required
            />

          </div>

          {/* =========================
              DESTINATIONS
          ========================= */}

          <div className="form-group">

            <label htmlFor="destination-search">
              Destinations
            </label>

            {destinationsLoading ? (
              <p className="form-loading">
                Loading destinations...
              </p>
            ) : (
              <>

                {/* Search */}

                <input
                  id="destination-search"
                  type="text"
                  placeholder="Search destinations..."
                  value={
                    destinationSearch
                  }
                  onChange={(event) =>
                    setDestinationSearch(
                      event.target.value
                    )
                  }
                />

                {/* Destination List */}

                <div className="destination-selection-list">

                  {filteredDestinations.length ===
                    0 ? (
                    <p className="no-destination-result">
                      No destinations found.
                    </p>
                  ) : (
                    filteredDestinations.map(
                      (destination) => {

                        const isSelected =
                          selectedDestinations.includes(
                            destination._id
                          );

                        return (
                          <button
                            type="button"
                            key={
                              destination._id
                            }
                            className={`destination-selection-item ${isSelected
                              ? "selected"
                              : ""
                              }`}
                            onClick={() =>
                              handleDestinationSelection(
                                destination._id
                              )
                            }
                          >

                            <div>

                              <strong>
                                {
                                  destination.name
                                }
                              </strong>

                              <span>
                                📍{" "}
                                {
                                  destination.location
                                }
                              </span>

                              <small>
                                {
                                  destination.category
                                }
                              </small>

                            </div>

                            <span className="destination-check">
                              {isSelected
                                ? "✓"
                                : "+"}
                            </span>

                          </button>
                        );
                      }
                    )
                  )}

                </div>

                {/* Selected Destinations */}

                {selectedDestinations.length >
                  0 && (
                    <div className="selected-destinations">

                      <p>
                        Selected Destinations:
                      </p>

                      <div className="selected-destination-tags">

                        {selectedDestinations.map(
                          (id) => {

                            const destination =
                              destinations.find(
                                (item) =>
                                  item._id ===
                                  id
                              );

                            if (!destination) {
                              return null;
                            }

                            return (
                              <span
                                key={id}
                                className="selected-destination-tag"
                              >

                                {
                                  destination.name
                                }

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDestinationSelection(
                                      id
                                    )
                                  }
                                  aria-label={`Remove ${destination.name}`}
                                >
                                  ×
                                </button>

                              </span>
                            );
                          }
                        )}

                      </div>

                    </div>
                  )}

              </>
            )}

          </div>

          {/* =========================
              DATES
          ========================= */}

          <div className="form-row">

            {/* Start Date */}

            <div className="form-group">

              <label htmlFor="startDate">
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                min={getTodayDate()}
                onChange={(event) => {

                  const selectedDate =
                    event.target.value;

                  setStartDate(
                    selectedDate
                  );

                  // If current end date
                  // is before new start date
                  if (
                    endDate &&
                    endDate <
                    selectedDate
                  ) {
                    setEndDate("");
                  }

                }}
                required
              />

            </div>

            {/* End Date */}

            <div className="form-group">

              <label htmlFor="endDate">
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                min={
                  startDate ||
                  getTodayDate()
                }
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
                required
              />

            </div>

          </div>

          {/* =========================
              BUDGET
          ========================= */}

          <div className="form-group">

            <label htmlFor="budget">
              Budget (₹)
            </label>

            <input
              id="budget"
              type="number"
              placeholder="e.g. 25000"
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
              min="0"
              step="1"
              required
            />

          </div>

          {/* =========================
              NOTES
          ========================= */}

          <div className="form-group">

            <label htmlFor="notes">
              Notes
            </label>

            <textarea
              id="notes"
              placeholder="Add notes about your trip..."
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              rows="4"
              maxLength={1000}
            />

          </div>

          {/* =========================
              FORM BUTTONS
          ========================= */}

          <div className="travel-plan-form-actions">

            <button
              type="submit"
              className="create-plan-button"
              disabled={
                creating ||
                updating ||
                destinationsLoading
              }
            >
              {creating
                ? "Creating Plan..."
                : updating
                  ? "Updating Plan..."
                  : editingPlanId
                    ? "Update Travel Plan"
                    : "Create Travel Plan"}
            </button>

            {editingPlanId && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={
                  handleCancelEdit
                }
                disabled={updating}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>

      </section>

      {/* =========================
          SAVED PLANS
      ========================= */}

      <section className="travel-plans-list-section">

        <div className="travel-plans-list-header">

          <h2>
            My Saved Plans
          </h2>

          <span>
            {travelPlans.length}{" "}
            {travelPlans.length === 1
              ? "Plan"
              : "Plans"}
          </span>

        </div>

        {/* Loading */}

        {loading ? (
          <p className="status-message">
            Loading travel plans...
          </p>

        ) : travelPlans.length ===
          0 ? (

          /* Empty State */

          <div className="travel-plans-empty">

            <h3>
              No Travel Plans Yet
            </h3>

            <p>
              Create your first travel
              plan using the form above.
            </p>

          </div>

        ) : (

          /* Plans */

          <div className="travel-plans-grid">

            {travelPlans.map(
              (plan) => (

                <article
                  className="travel-plan-card"
                  key={plan._id}
                >

                  {/* Card Header */}

                  <div className="travel-plan-card-header">

                    <h3>
                      {plan.title}
                    </h3>

                    <div className="travel-plan-card-actions">

                      <button
                        type="button"
                        className="edit-plan-button"
                        onClick={() =>
                          handleEdit(plan)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-plan-button"
                        onClick={() =>
                          handleDelete(
                            plan._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                  {/* Destinations */}

                  <div className="travel-plan-detail">

                    <strong>
                      Destinations
                    </strong>

                    <div className="plan-destinations">

                      {plan.destinations?.map(
                        (destination) => (

                          <span
                            key={
                              destination._id ||
                              destination
                            }
                          >
                            {destination.name ||
                              destination}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                  {/* Dates */}

                  <div className="travel-plan-detail">

                    <strong>
                      Travel Dates
                    </strong>

                    <p>
                      {new Date(
                        plan.startDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}{" "}
                      -{" "}
                      {new Date(
                        plan.endDate
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                  {/* Budget */}

                  <div className="travel-plan-detail">

                    <strong>
                      Budget
                    </strong>

                    <p>
                      ₹
                      {Number(
                        plan.budget
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                  {/* Notes */}

                  {plan.notes && (
                    <div className="travel-plan-detail">

                      <strong>
                        Notes
                      </strong>

                      <p>
                        {plan.notes}
                      </p>

                    </div>
                  )}

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default TravelPlans;