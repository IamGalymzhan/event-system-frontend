import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import QRCode from "react-qr-code";

const AttendanceQR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user ID
  const userId = user?.user?.id || user?.id;

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch event details
        const eventData = await eventService.getEventById(id);
        setEvent(eventData);

        // Check if user is authorized to view this page
        const isEventCreator =
          eventData.creator === userId || Number(eventData.creator) === userId;

        if (!isAdmin && !isEventCreator) {
          navigate(`/events/${id}`);
          return;
        }
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(t("errorFetchingEvent"));
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      navigate("/login", { state: { redirectTo: `/events/${id}/attendance` } });
      return;
    }

    fetchEventData();
  }, [id, userId, isAuthenticated, isAdmin, navigate, t]);

  // Generate the base URL for the QR code
  const baseUrl = window.location.origin;
  const attendanceUrl = `${baseUrl}/mark-attendance/${id}`;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {t("attendanceQRTitle")}
        </h1>
        <h2 className="text-xl mb-6 text-center">{event.title}</h2>

        <div className="flex flex-col items-center justify-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <QRCode value={attendanceUrl} size={256} />
          </div>

          <p className="mt-4 text-center text-gray-600">
            {t("scanQRCodeInstructions")}
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {t("backToEvent")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceQR;
