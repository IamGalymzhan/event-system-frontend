import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import EventForm from "../components/EventForm";
import eventService from "../services/eventService";
import DashboardSection from "../components/DashboardSection";
import EventGalleryManager from "../components/EventGalleryManager";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user ID
  const userId = user?.id;

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(t("errorFetchingEvent"));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, t]);

  const handleSubmit = async (formData) => {
    return await eventService.updateEvent(id, formData);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">{t("loadingEvent")}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{t("eventNotFound")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authorization check - only event creator or admin can edit
  const isEventCreator = event.creator === userId;
  const canEditEvent = isAdmin || isEventCreator;
  // console.log(event.creator, userId);
  // console.log(isEventCreator, canEditEvent);

  if (!isAuthenticated || !canEditEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t("notAuthorizedEditEvent")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardSection>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {t("editingEvent")}: {event.title}
        </h1>
        <EventForm
          initialData={event}
          onSubmit={handleSubmit}
          isEditing={true}
        />

        {/* Gallery Manager */}
        {canEditEvent && <EventGalleryManager eventId={id} />}
      </div>
    </DashboardSection>
  );
};

export default EditEvent;
