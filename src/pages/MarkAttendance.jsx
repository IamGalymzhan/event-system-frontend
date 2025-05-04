import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";

const MarkAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [registrationId, setRegistrationId] = useState(null);

  // Get current user ID
  const userId = user?.user?.id || user?.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch event details
        const eventData = await eventService.getEventById(id);
        setEvent(eventData);

        // If user is authenticated, check if registered
        if (isAuthenticated && userId) {
          const registrationsResponse =
            await eventService.getUserRegistrations();

          const userRegistrations = registrationsResponse.results.filter(
            (reg) => reg.event === parseInt(id) && reg.user === userId
          );

          setRegistrations(userRegistrations);

          if (userRegistrations.length > 0) {
            setRegistrationId(userRegistrations[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("errorFetchingData"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId, isAuthenticated, t]);

  const handleMarkAttendance = async () => {
    if (!isAuthenticated || !registrationId) return;

    setProcessing(true);
    setError(null);

    try {
      await eventService.markAttendance(registrationId);
      setSuccess(true);
    } catch (err) {
      console.error("Error marking attendance:", err);

      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError(t("errorMarkingAttendance"));
        }
      } else {
        setError(t("errorMarkingAttendance"));
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleLogin = () => {
    navigate("/login", { state: { redirectTo: `/mark-attendance/${id}` } });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {t("eventNotFound")}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
          <div className="mb-6">
            <p className="mb-4">{t("loginRequiredForAttendance")}</p>
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t("login")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {t("attendanceMarkedSuccess")}
          </div>
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {t("viewEventDetails")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{event.title}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {registrationId ? (
          <div>
            <p className="mb-6">{t("confirmAttendance")}</p>
            <button
              onClick={handleMarkAttendance}
              disabled={processing}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${
                processing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {processing ? t("processing") : t("markAttendance")}
            </button>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {t("notRegisteredForEvent")}
            <div className="mt-4">
              <button
                onClick={() => navigate(`/events/${id}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {t("registerForEvent")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
