import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import facultyService from "../services/facultyService";
import PropTypes from "prop-types";

const EventForm = ({ initialData, onSubmit, isEditing = false }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(
    initialData?.start_date
      ? new Date(initialData.start_date).toISOString().slice(0, 16)
      : ""
  );
  const [eventType, setEventType] = useState(
    initialData?.event_type || "OTHER"
  );
  const [facultyId, setFacultyId] = useState(initialData?.faculty || "");
  const [image, setImage] = useState(null);

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchingFaculties, setFetchingFaculties] = useState(false);
  const [facultiesLoaded, setFacultiesLoaded] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Event type options
  const eventTypes = [
    { value: "WORKSHOP", label: t("workshop") },
    { value: "CONFERENCE", label: t("conference") },
    { value: "SEMINAR", label: t("seminar") },
    { value: "SOCIAL", label: t("social") },
    { value: "ACADEMIC", label: t("academic") },
    { value: "OTHER", label: t("other") },
  ];

  // Memoize the fetchFaculties function to prevent unnecessary re-renders
  const fetchFaculties = useCallback(async () => {
    if (facultiesLoaded) return; // Don't fetch if already loaded

    setFetchingFaculties(true);
    try {
      const response = await facultyService.getAllFaculties();
      // Make sure faculties is always an array
      setFaculties(
        Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response)
          ? response
          : []
      );
      setFacultiesLoaded(true);
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setFaculties([]);
    } finally {
      setFetchingFaculties(false);
    }
  }, [facultiesLoaded]);

  // Only fetch faculties when faculty dropdown is focused
  const handleFacultyFocus = () => {
    if (!facultiesLoaded) {
      fetchFaculties();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = t("titleRequired");
    }

    if (!description.trim()) {
      newErrors.description = t("descriptionRequired");
    }

    if (!startDate) {
      newErrors.startDate = t("startDateRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("start_date", new Date(startDate).toISOString());
      formData.append("event_type", eventType);

      if (facultyId) {
        formData.append("faculty", facultyId);
      }

      if (image) {
        formData.append("image", image);
      }

      // Include the creator ID from the logged-in user
      if (user?.user?.id && !isEditing) {
        formData.append("creator", user.user.id);
      }

      await onSubmit(formData);
      navigate("/events");
    } catch (err) {
      console.error("Error submitting form:", err);
      setErrors({
        form: err.response?.data?.detail || t("errorSubmittingForm"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? t("editEvent") : t("createEvent")}
      </h2>

      {errors.form && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("title")} *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.title ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={t("eventTitlePlaceholder")}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("description")} *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={t("eventDescriptionPlaceholder")}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Start Date and Time */}
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("startDate")} *
            </label>
            <input
              type="datetime-local"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${
                errors.startDate ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label
              htmlFor="event-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("eventType")}
            </label>
            <select
              id="event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            >
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div>
            <label
              htmlFor="faculty"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("faculty")}
            </label>
            <select
              id="faculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              onFocus={handleFacultyFocus}
              disabled={fetchingFaculties}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            >
              <option value="">{t("selectFaculty")}</option>
              {Array.isArray(faculties) && faculties.length > 0 ? (
                faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t("noFacultiesAvailable")}
                </option>
              )}
            </select>
            {fetchingFaculties && (
              <p className="mt-1 text-sm text-gray-500">
                {t("loadingFaculties", "Loading faculties...")}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("eventImage")}
            </label>

            {initialData?.image && (
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-2">
                  {t("currentImage")}:
                </p>
                <img
                  src={initialData.image}
                  alt={initialData.title}
                  className="h-32 w-auto object-cover rounded mb-2"
                />
              </div>
            )}

            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">{t("imageUploadHint")}</p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEditing ? t("saving") : t("creating")}
                </>
              ) : isEditing ? (
                t("saveChanges")
              ) : (
                t("createEvent")
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

EventForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default EventForm;
