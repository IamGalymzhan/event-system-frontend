import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EventCard from "../components/EventCard";
import eventService from "../services/eventService";
import facultyService from "../services/facultyService";
import { useAuth } from "../context/AuthContext";
import DashboardSection from "../components/DashboardSection";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, isInstructor } = useAuth();

  // Event type options
  const eventTypes = [
    { value: "", label: t("allTypes") },
    { value: "WORKSHOP", label: t("workshop") },
    { value: "CONFERENCE", label: t("conference") },
    { value: "SEMINAR", label: t("seminar") },
    { value: "SOCIAL", label: t("social") },
    { value: "ACADEMIC", label: t("academic") },
    { value: "OTHER", label: t("other") },
  ];

  useEffect(() => {
    // Parse query params
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const facultyParam = params.get("faculty") || "";
    const typeParam = params.get("type") || "";
    const upcomingParam = params.get("upcoming") === "true";
    const pageParam = parseInt(params.get("page")) || 1;

    setSearch(searchParam);
    setSelectedFaculty(facultyParam);
    setSelectedType(typeParam);
    setUpcomingOnly(upcomingParam);
    setCurrentPage(pageParam);

    // Load faculties
    const loadFaculties = async () => {
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
      } catch (err) {
        console.error("Error loading faculties:", err);
        setFaculties([]);
      }
    };

    loadFaculties();
  }, [location.search]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page: currentPage,
          search: search,
        };

        if (selectedFaculty) {
          params.faculty = selectedFaculty;
        }

        if (selectedType) {
          params.event_type = selectedType;
        }

        if (upcomingOnly) {
          params.upcoming = true;
        }

        const response = await eventService.getEvents(params);
        setEvents(response.results || []);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / 10)); // Assuming 10 items per page
      } catch (err) {
        setError(t("errorLoadingEvents"));
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentPage, search, selectedFaculty, selectedType, upcomingOnly, t]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams(1);
  };

  const updateQueryParams = (page = currentPage) => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (selectedFaculty) params.set("faculty", selectedFaculty);
    if (selectedType) params.set("type", selectedType);
    if (upcomingOnly) params.set("upcoming", "true");
    if (page > 1) params.set("page", page.toString());

    navigate({ search: params.toString() });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateQueryParams(newPage);
  };

  return (
    <DashboardSection>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("events")}</h1>
          {isAuthenticated && (isAdmin || isInstructor) && (
            <button
              onClick={() => navigate("/dashboard/events/create")}
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("createEvent")}
            </button>
          )}
        </div>

        {/* Filters and search */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search input */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("searchEvents")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Faculty filter */}
              <div>
                <label
                  htmlFor="faculty"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("faculty")}
                </label>
                <select
                  id="faculty"
                  value={selectedFaculty}
                  onChange={(e) => {
                    setSelectedFaculty(e.target.value);
                    updateQueryParams(1);
                  }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                >
                  <option value="">{t("allFaculties")}</option>
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
              </div>

              {/* Event type filter */}
              <div>
                <label
                  htmlFor="event-type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("eventType")}
                </label>
                <select
                  id="event-type"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    updateQueryParams(1);
                  }}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upcoming toggle */}
              <div className="flex items-end">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={upcomingOnly}
                    onChange={(e) => {
                      setUpcomingOnly(e.target.checked);
                      updateQueryParams(1);
                    }}
                    className="rounded border-gray-300 text-sky-600 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-50 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t("upcomingOnly")}
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>

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

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">{t("loading")}</p>
          </div>
        )}

        {/* Events grid */}
        {!loading && events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">{t("noEventsFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav
              className="inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">{t("previous")}</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                // Determine the range of displayed page numbers
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = index + 1;
                } else if (currentPage <= 3) {
                  pageToShow = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = totalPages - 4 + index;
                } else {
                  pageToShow = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageToShow
                        ? "z-10 bg-sky-50 border-sky-500 text-sky-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">{t("next")}</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </DashboardSection>
  );
};

export default Events;
