// Base URL for API endpoints
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Event types
export const EVENT_TYPES = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "SEMINAR", label: "Seminar" },
  { value: "LECTURE", label: "Lecture" },
  { value: "SOCIAL", label: "Social" },
  { value: "OTHER", label: "Other" },
];

// User roles
export const USER_ROLES = [
  { value: "STUDENT", label: "Student" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "ADMIN", label: "Admin" },
];

// Colors for event types (used in badges)
export const EVENT_TYPE_COLORS = {
  WORKSHOP: "bg-blue-100 text-blue-800",
  CONFERENCE: "bg-purple-100 text-purple-800",
  SEMINAR: "bg-green-100 text-green-800",
  LECTURE: "bg-yellow-100 text-yellow-800",
  SOCIAL: "bg-pink-100 text-pink-800",
  OTHER: "bg-gray-100 text-gray-800",
};

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;

// Default event image
export const DEFAULT_EVENT_IMAGE = "/images/event-placeholder.jpg";

// Items per page options
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
