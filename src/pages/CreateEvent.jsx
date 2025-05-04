import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import EventForm from "../components/EventForm";
import eventService from "../services/eventService";
import DashboardSection from "../components/DashboardSection";

const CreateEvent = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, isInstructor } = useAuth();

  const handleSubmit = async (formData) => {
    return await eventService.createEvent(formData);
  };

  // Only admins and instructors can create events
  if (!isAuthenticated || (!isAdmin && !isInstructor)) {
    // console.log(isAuthenticated, isAdmin, isInstructor);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t("notAuthorizedCreateEvent")}
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
        <h1 className="text-3xl font-bold mb-8">{t("createNewEvent")}</h1>
        <EventForm onSubmit={handleSubmit} />
      </div>
    </DashboardSection>
  );
};

export default CreateEvent;
