import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import GalleryComponent from "../components/GalleryComponent";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, isInstructor } = useAuth();

  const [event, setEvent] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [userFeedbackValue, setUserFeedbackValue] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [loadingStatistics, setLoadingStatistics] = useState(false);

  // Get current user ID
  const userId = user?.user?.id || user?.id;

  // Determine if the user is the event creator or an admin
  const isEventCreator =
    event?.creator &&
    userId &&
    (event.creator === userId ||
      event.creator === Number(userId) ||
      Number(event.creator) === userId);
  const canManageEvent = isAdmin || isEventCreator;

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch event details
        const eventData = await eventService.getEventById(id);
        setEvent(eventData);

        // Fetch gallery images
        const galleryData = await eventService.getEventGallery(id);
        setGallery(galleryData);

        // Fetch event feedback
        const feedbackData = await eventService.getEventFeedback(id);
        setFeedback(feedbackData);

        // If user is authenticated, check if registered
        if (isAuthenticated && userId) {
          const registrationsResponse =
            await eventService.getUserRegistrations();
          const userRegistration = registrationsResponse.results.find(
            (reg) => reg.event === parseInt(id) && reg.user === userId
          );

          if (userRegistration) {
            setRegistered(true);
            setRegistrationId(userRegistration.id);
          }
        }
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(t("errorFetchingEvent"));
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, userId, isAuthenticated, t]);

  const fetchStatistics = async () => {
    if (!canManageEvent) return;

    setLoadingStatistics(true);
    try {
      const data = await eventService.getEventStatistics(id);
      setStatistics(data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setLoadingStatistics(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { redirectTo: `/events/${id}` } });
      return;
    }

    setRegistering(true);
    try {
      const response = await eventService.registerForEvent(
        parseInt(id),
        userId
      );
      setRegistered(true);
      setRegistrationId(response.id);
    } catch (err) {
      console.error("Error registering for event:", err);
      setError(t("errorRegistering"));
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registrationId) return;

    setRegistering(true);
    try {
      await eventService.cancelRegistration(registrationId);
      setRegistered(false);
      setRegistrationId(null);
    } catch (err) {
      console.error("Error canceling registration:", err);
      setError(t("errorCancelingRegistration"));
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !userFeedbackValue.trim()) return;

    setSubmittingFeedback(true);
    setError(null); // Clear any previous errors

    try {
      // Ensure both IDs are converted to numbers
      const eventId = Number(id);
      const currentUserId = Number(userId);

      if (isNaN(eventId) || isNaN(currentUserId)) {
        throw new Error("Invalid event or user ID");
      }

      // Check minimum content length
      if (userFeedbackValue.trim().length < 3) {
        throw new Error(t("feedbackTooShort"));
      }

      await eventService.submitFeedback(
        eventId,
        currentUserId,
        userFeedbackValue.trim()
      );

      // Refresh feedback
      const feedbackData = await eventService.getEventFeedback(id);
      setFeedback(feedbackData);
      setUserFeedbackValue("");
    } catch (err) {
      console.error("Error submitting feedback:", err);

      // Display a more specific error message if available
      if (err.message && err.message.includes("must be registered")) {
        setError(t("mustBeRegistered"));
        // If the user is not registered, update the UI state
        setRegistered(false);
      } else if (
        err.message &&
        (err.message.startsWith("Validation error:") ||
          err.message.startsWith("Server error:"))
      ) {
        setError(err.message);
      } else {
        setError(t("errorSubmittingFeedback"));
      }

      // Log more detailed error information for debugging
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDelete = async () => {
    if (!canManageEvent) return;

    if (window.confirm(t("confirmDeleteEvent"))) {
      try {
        await eventService.deleteEvent(id);
        navigate("/events");
      } catch (err) {
        console.error("Error deleting event:", err);
        setError(t("errorDeletingEvent"));
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">{t("loadingEvent")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link
          to="/events"
          className="text-sky-600 hover:text-sky-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t("backToEvents")}
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-gray-600">{t("eventNotFound")}</p>
        <div className="text-center mt-4">
          <Link
            to="/events"
            className="text-sky-600 hover:text-sky-800 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            {t("backToEvents")}
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formattedDate = format(new Date(event.start_date), "PPP p");

  // Event type badge colors
  const typeColors = {
    WORKSHOP: "bg-blue-100 text-blue-800",
    CONFERENCE: "bg-purple-100 text-purple-800",
    SEMINAR: "bg-green-100 text-green-800",
    SOCIAL: "bg-pink-100 text-pink-800",
    ACADEMIC: "bg-amber-100 text-amber-800",
    OTHER: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/events"
        className="text-sky-600 hover:text-sky-800 flex items-center mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        {t("backToEvents")}
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Event Image */}
        <div className="relative h-64 md:h-96 bg-gray-100">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Past event overlay */}
          {event.is_past && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-2xl font-semibold px-6 py-3 bg-black bg-opacity-70 rounded">
                {t("pastEvent")}
              </span>
            </div>
          )}

          {/* Event type badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                typeColors[event.event_type] || typeColors.OTHER
              }`}
            >
              {t(event.event_type.toLowerCase())}
            </span>
          </div>
        </div>

        {/* Event Details */}
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-6 mb-6 text-gray-700">
              {/* Date */}
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{formattedDate}</span>
              </div>

              {/* Faculty */}
              {event.faculty_details && (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{event.faculty_details.name}</span>
                </div>
              )}

              {/* Creator */}
              {event.creator_details && (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>
                    {typeof event.creator_details === "object"
                      ? event.creator_details.full_name
                      : event.creator_details}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-700 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Register/Cancel button */}
            {!event.is_past && isAuthenticated && (
              <>
                {!registered ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded transition duration-200 disabled:opacity-50 flex items-center"
                  >
                    {registering ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        {t("registering")}
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {t("register")}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-200 disabled:opacity-50 flex items-center"
                  >
                    {registering ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        {t("canceling")}
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {t("cancelRegistration")}
                      </>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Admin/Creator actions */}
            {canManageEvent && (
              <>
                <Link
                  to={`/dashboard/events/${id}/edit`}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded transition duration-200 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {t("edit")}
                </Link>

                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition duration-200 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("delete")}
                </button>

                {/* Statistics button */}
                <button
                  onClick={fetchStatistics}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded transition duration-200 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  {loadingStatistics ? t("loadingStatistics") : t("statistics")}
                </button>

                {/* Attendance QR Code button */}
                <Link
                  to={`/events/${id}/attendance`}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition duration-200 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM9 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1zM9 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1zM3 17a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1zM17 4a1 1 0 100 2h1a1 1 0 100-2h-1zM16 10a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM17 15a1 1 0 100 2h1a1 1 0 100-2h-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("attendance")}
                </Link>
              </>
            )}
          </div>

          {/* Statistics section (for admins/creators) */}
          {statistics && canManageEvent && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">
                {t("eventStatistics")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-sm text-gray-500">
                    {t("totalParticipants")}
                  </p>
                  <p className="text-2xl font-bold">
                    {statistics.total_participants}
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-sm text-gray-500">{t("attended")}</p>
                  <p className="text-2xl font-bold">
                    {statistics.attended_count}
                  </p>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <p className="text-sm text-gray-500">{t("attendanceRate")}</p>
                  <p className="text-2xl font-bold">
                    {statistics.attendance_rate}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={`/events/${id}/statistics-pdf`}
                  target="_blank"
                  className="text-sky-600 hover:text-sky-800 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("downloadPdfReport")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery section */}
      <GalleryComponent gallery={gallery} />

      {/* Feedback section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{t("feedback")}</h2>

        {/* Feedback form for authenticated users who are registered or for past events */}
        {isAuthenticated ? (
          registered || event.is_past ? (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {t("leaveFeedback")}
              </h3>
              <form onSubmit={handleSubmitFeedback}>
                <div className="mb-4">
                  <textarea
                    value={userFeedbackValue}
                    onChange={(e) => setUserFeedbackValue(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    rows="4"
                    placeholder={t("feedbackPlaceholder")}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submittingFeedback || !userFeedbackValue.trim()}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded transition duration-200 disabled:opacity-50 flex items-center"
                >
                  {submittingFeedback ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("submitFeedback")}
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {t("registerToLeaveFeedback")}{" "}
                    {!event.is_past && (
                      <button
                        onClick={handleRegister}
                        className="font-medium underline hover:text-yellow-600"
                      >
                        {t("registerNow")}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {t("loginToLeaveFeedback")}{" "}
                  <Link
                    to="/login"
                    className="font-medium underline hover:text-blue-600"
                    state={{ redirectTo: `/events/${id}` }}
                  >
                    {t("loginNow")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback list */}
        {feedback && feedback.length > 0 ? (
          <div className="space-y-6">
            {feedback
              .slice(0, showAllFeedback ? feedback.length : 3)
              .map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold mr-3">
                        {typeof item.user_details === "object"
                          ? item.user_details.full_name.charAt(0).toUpperCase()
                          : typeof item.user_details === "string"
                          ? item.user_details.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                      <p className="font-medium">
                        {typeof item.user_details === "object"
                          ? item.user_details.full_name
                          : item.user_details}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(new Date(item.created_at), "PPP")}
                    </p>
                  </div>
                  <p className="text-gray-700 mt-3">{item.comment}</p>
                </div>
              ))}

            {feedback.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowAllFeedback(!showAllFeedback)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-full transition duration-200 flex items-center"
                >
                  {showAllFeedback ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("showLessFeedback")}
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("showAllFeedback")} ({feedback.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-gray-600 italic">{t("noFeedbackYet")}</p>
            {isAuthenticated && (
              <p className="text-gray-500 mt-2">
                {t("beTheFirstToLeaveFeedback")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
