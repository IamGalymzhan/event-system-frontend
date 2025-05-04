import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import userService from "../services/userService";
import DashboardSection from "../components/DashboardSection";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    myEvents: 0,
    registeredEvents: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const dashboardStats = {};

        // Get event statistics
        if (user.role === "ADMIN") {
          const [eventsResponse, usersResponse] = await Promise.all([
            eventService.getEvents({ page: 1, page_size: 1 }),
            userService.getAllUsers({ page: 1, page_size: 1 }),
          ]);

          dashboardStats.totalEvents = eventsResponse.count || 0;
          dashboardStats.totalUsers = usersResponse.count || 0;

          // Get upcoming events count
          const upcomingResponse = await eventService.getUpcomingEvents({
            page: 1,
            page_size: 1,
          });
          dashboardStats.upcomingEvents = upcomingResponse.count || 0;
        }

        // Get events created by the user if they're an instructor or admin
        if (user.role === "INSTRUCTOR" || user.role === "ADMIN") {
          const myEventsResponse = await eventService.getMyEvents({
            page: 1,
            page_size: 1,
          });
          dashboardStats.myEvents = myEventsResponse.count || 0;
        }

        // Get events the user is registered for
        const registeredEventsResponse = await eventService.getRegisteredEvents(
          { page: 1, page_size: 1 }
        );
        dashboardStats.registeredEvents = registeredEventsResponse.count || 0;

        setStats(dashboardStats);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(t("errorLoadingDashboardData"));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, t]);

  const DashboardCard = ({ title, value, icon, linkTo, linkText, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      {linkTo && (
        <div className="mt-4">
          <Link
            to={linkTo}
            className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center"
          >
            {linkText}{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
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
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const dashboardContent = (
    <>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Show total events and users for admin */}
        {user.role === "ADMIN" && (
          <>
            <DashboardCard
              title={t("totalEvents")}
              value={stats.totalEvents}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
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
              }
              linkTo="/events"
              linkText={t("viewAllEvents")}
              color="border-sky-500"
            />

            <DashboardCard
              title={t("totalUsers")}
              value={stats.totalUsers}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
              linkTo="/dashboard/users"
              linkText={t("manageUsers")}
              color="border-purple-500"
            />
          </>
        )}

        {/* Show upcoming events for all users */}
        <DashboardCard
          title={t("upcomingEvents")}
          value={stats.upcomingEvents}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          linkTo="/events?upcoming=true"
          linkText={t("viewUpcomingEvents")}
          color="border-amber-500"
        />

        {/* Show created events for instructors and admins */}
        {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
          <DashboardCard
            title={t("myCreatedEvents")}
            value={stats.myEvents}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
            linkTo="/events?created_by_me=true"
            linkText={t("viewMyEvents")}
            color="border-emerald-500"
          />
        )}

        {/* Show registered events for all users */}
        <DashboardCard
          title={t("myRegisteredEvents")}
          value={stats.registeredEvents}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
          linkTo="/events?registered=true"
          linkText={t("viewRegisteredEvents")}
          color="border-pink-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-16">
        <h2 className="text-xl font-semibold mb-4">{t("quickActions")}</h2>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/events"
              className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-sky-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-gray-700">{t("browseEvents")}</span>
            </Link>

            <Link
              to="/dashboard/profile"
              className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-sky-500 mr-3"
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
              <span className="text-gray-700">{t("editProfile")}</span>
            </Link>

            {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
              <Link
                to="/dashboard/events/create"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-sky-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-gray-700">{t("createEvent")}</span>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link
                to="/dashboard/faculties"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-sky-500 mr-3"
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
                <span className="text-gray-700">{t("manageFaculties")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return <DashboardSection>{dashboardContent}</DashboardSection>;
};

export default Dashboard;
