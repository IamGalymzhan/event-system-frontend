import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import EventCard from "../components/EventCard";
import eventService from "../services/eventService";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch events if user is authenticated
    if (isAuthenticated) {
      const fetchUpcomingEvents = async () => {
        setLoading(true);
        try {
          const response = await eventService.getUpcomingEvents({
            page: 1,
            ordering: "start_date",
          });
          setUpcomingEvents(response.results || []);
        } catch (err) {
          console.error("Error fetching upcoming events:", err);
          setError(t("errorLoadingEvents"));
        } finally {
          setLoading(false);
        }
      };

      fetchUpcomingEvents();
    }
  }, [t, isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg shadow-xl overflow-hidden mb-16">
        <div className="md:flex md:items-center">
          <div className="md:w-1/2 py-10 px-6 md:px-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("eventSystemTitle")}
            </h1>
            <p className="text-sky-100 mb-6 text-lg">
              {t("eventSystemDescription")}
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated && (
                <Link
                  to="/events"
                  className="bg-white text-sky-600 hover:bg-sky-50 py-3 px-6 rounded-md font-medium shadow-sm transition duration-300"
                >
                  {t("exploreEvents")}
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-sky-600 py-3 px-6 rounded-md font-medium transition duration-300"
                >
                  {t("getStarted")}
                </Link>
              )}
            </div>
          </div>
          <div className="md:w-1/2 p-6 hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt={t("eventIllustration")}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Upcoming Events Section - Only shown to authenticated users */}
      {isAuthenticated && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("upcomingEvents")}
            </h2>
            <Link
              to="/events"
              className="text-sky-600 hover:text-sky-800 flex items-center"
            >
              {t("viewAll")}{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">{t("loading")}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Events grid */}
          {!loading && upcomingEvents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">{t("noUpcomingEvents")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {t("featuresTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sky-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
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
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("featureEventManagement")}
            </h3>
            <p className="text-gray-600">{t("featureEventManagementDesc")}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sky-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("featureAttendance")}
            </h3>
            <p className="text-gray-600">{t("featureAttendanceDesc")}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sky-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {t("featureAnalytics")}
            </h3>
            <p className="text-gray-600">{t("featureAnalyticsDesc")}</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">{t("joinUsTitle")}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {t("joinUsDescription")}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-6 rounded-md transition duration-300"
            >
              {t("signUp")}
            </Link>
            <Link
              to="/login"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-md transition duration-300"
            >
              {t("signIn")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
