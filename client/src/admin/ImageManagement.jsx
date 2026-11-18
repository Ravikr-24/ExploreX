
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../styles/imageManagement.css";

export default function ImageManagement() {
    const [destinations, setDestinations] = useState([]);
    const [destinationId, setDestinationId] = useState("");
    const [target, setTarget] = useState("destination");
    const [itemId, setItemId] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const selectedDestination = destinations.find(
        (destination) => destination._id === destinationId
    );

    const items = useMemo(() => {
        if (!selectedDestination || target === "destination") {
            return [];
        }

        return target === "attraction"
            ? selectedDestination.attractions || []
            : selectedDestination.activities || [];
    }, [selectedDestination, target]);

    const selectedItem = items.find(
        (item) => item._id === itemId
    );

    const images = useMemo(() => {
        if (!selectedDestination) return [];

        if (target === "destination") {
            return selectedDestination.images || [];
        }

        return selectedItem?.images || [];
    }, [selectedDestination, selectedItem, target]);

    const endpoint = useMemo(() => {
        if (!destinationId) return "";

        const base = `/images/${destinationId}/${target}`;

        if (target === "destination") {
            return base;
        }

        return itemId ? `${base}/${itemId}` : "";
    }, [destinationId, target, itemId]);

    const fetchDestinations = async () => {
        try {
            setError("");

            const response = await api.get("/destinations");

            const list = Array.isArray(response.data)
                ? response.data
                : response.data.destinations || [];

            setDestinations(list);

            if (destinationId && !list.some((item) => item._id === destinationId)) {
                setDestinationId("");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load destinations."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        setItemId("");
        setFiles([]);
        setMessage("");
        setError("");
    }, [destinationId, target]);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);

        setFiles(selectedFiles);
        setMessage("");
        setError("");
    };

    const handleUpload = async () => {
        if (!endpoint) {
            setError("Please select a destination and gallery item.");
            return;
        }

        if (files.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        if (files.length > 5) {
            setError("You can upload a maximum of 5 images at a time.");
            return;
        }

        try {
            setProcessing(true);
            setError("");
            setMessage("");

            const formData = new FormData();

            files.forEach((file) => {
                formData.append("images", file);
            });

            await api.post(endpoint, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setFiles([]);
            document.getElementById("image-upload-input").value = "";

            setMessage("Images uploaded successfully.");
            await fetchDestinations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Image upload failed."
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleReplace = async (oldImageUrl) => {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
            const file = input.files?.[0];

            if (!file) return;

            try {
                setProcessing(true);
                setError("");
                setMessage("");

                const formData = new FormData();

                formData.append("image", file);
                formData.append("oldImageUrl", oldImageUrl);

                await api.put(endpoint, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                setMessage("Image replaced successfully.");
                await fetchDestinations();
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Image replacement failed."
                );
            } finally {
                setProcessing(false);
            }
        };

        input.click();
    };

    const handleDelete = async (imageUrl) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this image?"
        );

        if (!confirmed) return;

        try {
            setProcessing(true);
            setError("");
            setMessage("");

            await api.delete(endpoint, {
                data: { imageUrl },
            });

            setMessage("Image deleted successfully.");
            await fetchDestinations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Image deletion failed."
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleReorder = async (index, direction) => {
        const newIndex = index + direction;

        if (newIndex < 0 || newIndex >= images.length) return;

        const updatedImages = [...images];

        [updatedImages[index], updatedImages[newIndex]] = [
            updatedImages[newIndex],
            updatedImages[index],
        ];

        try {
            setProcessing(true);
            setError("");
            setMessage("");


            await api.patch(`${endpoint}/reorder`, {
                imageUrls: updatedImages,
            });


            setMessage(
                "Image order updated. The first image is the cover image."
            );

            await fetchDestinations();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reorder images."
            );
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <main className="image-management">
                <p>Loading image management...</p>
            </main>
        );
    }

    return (
        <main className="image-management">
            <header className="image-management-header">
                <p className="image-management-label">
                    EXPLOREX ADMIN PANEL
                </p>

                <h1>Image Management</h1>

                <p>
                    Upload, replace, delete and organize your destination images.
                </p>
            </header>

            <section className="image-management-panel">
                <div className="image-management-fields">
                    <div className="image-form-group">
                        <label htmlFor="destination-select">
                            Select Destination
                        </label>

                        <select
                            id="destination-select"
                            value={destinationId}
                            onChange={(event) => setDestinationId(event.target.value)}
                        >
                            <option value="">Choose a destination</option>

                            {destinations.map((destination) => (
                                <option
                                    key={destination._id}
                                    value={destination._id}
                                >
                                    {destination.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="image-form-group">
                        <label htmlFor="target-select">
                            Select Gallery
                        </label>

                        <select
                            id="target-select"
                            value={target}
                            onChange={(event) => setTarget(event.target.value)}
                        >
                            <option value="destination">Destination Images</option>
                            <option value="attraction">Attraction Images</option>
                            <option value="activity">Activity Images</option>
                        </select>
                    </div>

                    {target !== "destination" && (
                        <div className="image-form-group">
                            <label htmlFor="item-select">
                                Select {target === "attraction" ? "Attraction" : "Activity"}
                            </label>

                            <select
                                id="item-select"
                                value={itemId}
                                onChange={(event) => setItemId(event.target.value)}
                                disabled={!destinationId}
                            >
                                <option value="">Choose an item</option>

                                {items.map((item) => (
                                    <option key={item._id} value={item._id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {destinationId && endpoint && (
                    <div className="image-upload-section">
                        <h2>Upload Images</h2>

                        <p>
                            Select up to 5 image files. Supported formats depend on
                            your server's image upload validation.
                        </p>

                        <input
                            id="image-upload-input"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={processing}
                        />

                        {files.length > 0 && (
                            <p className="selected-files">
                                {files.length} file(s) selected
                            </p>
                        )}

                        <button
                            type="button"
                            className="image-primary-button"
                            onClick={handleUpload}
                            disabled={processing || files.length === 0}
                        >
                            {processing ? "Please wait..." : "Upload Images"}
                        </button>
                    </div>
                )}

                {error && (
                    <p className="image-error" role="alert">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="image-success" role="status">
                        {message}
                    </p>
                )}
            </section>

            <section className="image-gallery-section">
                <div className="image-gallery-heading">
                    <div>
                        <h2>Image Gallery</h2>
                        <p>
                            {images.length} image(s) in the selected gallery.
                        </p>
                    </div>
                </div>

                {!destinationId ? (
                    <p className="image-empty">
                        Select a destination to view its images.
                    </p>
                ) : !endpoint ? (
                    <p className="image-empty">
                        Select an attraction or activity to view its images.
                    </p>
                ) : images.length === 0 ? (
                    <p className="image-empty">
                        No images found in this gallery. Upload some images to get started.
                    </p>
                ) : (
                    <div className="image-gallery-grid">
                        {images.map((imageUrl, index) => (
                            <article className="managed-image-card" key={imageUrl}>
                                <div className="managed-image-wrapper">
                                    <img
                                        src={imageUrl}
                                        alt={`Gallery image ${index + 1}`}
                                    />

                                    {index === 0 && (
                                        <span className="cover-image-label">
                                            COVER IMAGE
                                        </span>
                                    )}
                                </div>

                                <div className="managed-image-actions">
                                    <button
                                        type="button"
                                        onClick={() => handleReorder(index, -1)}
                                        disabled={processing || index === 0}
                                    >
                                        Move Up
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleReorder(index, 1)}
                                        disabled={processing || index === images.length - 1}
                                    >
                                        Move Down
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleReplace(imageUrl)}
                                        disabled={processing}
                                    >
                                        Replace
                                    </button>

                                    <button
                                        type="button"
                                        className="image-delete-button"
                                        onClick={() => handleDelete(imageUrl)}
                                        disabled={processing}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
