import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const EventCard = ({ event }) => {
  const { t } = useTranslation();

  // Format date
  const formattedDate = format(
    new Date(event.start_date),
    "MMM d, yyyy • h:mm a"
  );

  // Default image if not provided
  const eventImage =
    event.image || "https://via.placeholder.com/300x200?text=Event";

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={eventImage}
          alt={event.title}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
        />

        {/* Past event overlay */}
        {event.is_past && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-lg font-semibold px-4 py-2 bg-black bg-opacity-70 rounded">
              {t("pastEventLabel")}
            </span>
          </div>
        )}

        {/* Event type badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded ${
              typeColors[event.event_type] || typeColors.OTHER
            }`}
          >
            {t(event.event_type.toLowerCase())}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:text-sky-600">
          {event.title}
        </h3>

        <div className="flex items-center text-gray-500 mb-3 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
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

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* Faculty info if available */}
        {event.faculty_details && (
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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

        <Link
          to={`/events/${event.id}`}
          className="block text-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded transition duration-300"
        >
          {t("viewDetails")}
        </Link>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    start_date: PropTypes.string.isRequired,
    event_type: PropTypes.string.isRequired,
    is_past: PropTypes.bool,
    image: PropTypes.string,
    faculty_details: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }).isRequired,
};

export default EventCard;
