import api from "../utils/api";

// Get all events with optional filtering
const getEvents = async (params = {}) => {
  try {
    const response = await api.get(`/events/events/`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Get a specific event by ID
const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/events/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    throw error;
  }
};

// Get upcoming events
const getUpcomingEvents = async (params = {}) => {
  try {
    const upcomingParams = { ...params, upcoming: true };
    const response = await api.get(`/events/events/`, {
      params: upcomingParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

// Get events created by current user
const getMyEvents = async (params = {}) => {
  try {
    const myEventsParams = { ...params, created_by_me: true };
    const response = await api.get(`/events/events/`, {
      params: myEventsParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my events:", error);
    throw error;
  }
};

// Get events the current user is registered for
const getRegisteredEvents = async (params = {}) => {
  try {
    const registeredParams = { ...params, registered: true };
    const response = await api.get(`/events/events/`, {
      params: registeredParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching registered events:", error);
    throw error;
  }
};

// Create a new event
const createEvent = async (eventData) => {
  try {
    const response = await api.post(`/events/events/`, eventData);
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Update an existing event
const updateEvent = async (id, eventData) => {
  try {
    const response = await api.patch(`/events/events/${id}/`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Error updating event with ID ${id}:`, error);
    throw error;
  }
};

// Delete an event
const deleteEvent = async (id) => {
  try {
    await api.delete(`/events/events/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }
};

// Register for an event
const registerForEvent = async (eventId, userId) => {
  try {
    const response = await api.post(`/events/registrations/`, {
      event: eventId,
      user: userId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error registering for event with ID ${eventId}:`, error);
    throw error;
  }
};

// Cancel event registration
const cancelRegistration = async (registrationId) => {
  try {
    await api.delete(`/events/registrations/${registrationId}/`);
    return true;
  } catch (error) {
    console.error(
      `Error canceling registration with ID ${registrationId}:`,
      error
    );
    throw error;
  }
};

// Get event attendees
const getEventAttendees = async (eventId) => {
  try {
    const response = await api.get(`/events/events/${eventId}/attendees/`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching attendees for event with ID ${eventId}:`,
      error
    );
    throw error;
  }
};

// Get event statistics
const getEventStatistics = async (eventId) => {
  try {
    const response = await api.get(`/events/events/${eventId}/statistics/`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching statistics for event with ID ${eventId}:`,
      error
    );
    throw error;
  }
};

// Submit feedback for an event
const submitFeedback = async (eventId, userId, comment) => {
  try {
    // Check if we can retrieve the registration ID first
    // This may be a requirement for the API
    const registrationsResponse = await api.get(`/events/registrations/`);
    const userRegistration = registrationsResponse.data.results.find(
      (reg) => reg.event === Number(eventId) && reg.user === Number(userId)
    );

    if (!userRegistration) {
      throw new Error(
        "You must be registered for this event to leave feedback"
      );
    }

    // Ensure all required fields are present and properly formatted
    const payload = {
      event: Number(eventId),
      user: Number(userId),
      comment: comment.trim(),
    };

    console.log("Submitting feedback with payload:", payload);

    const response = await api.post(`/events/feedback/`, payload);
    console.log("Feedback submission successful:", response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error(
      `Error submitting feedback for event with ID ${eventId}:`,
      error
    );

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);

      // Include more specific error information if available
      if (error.response.data && error.response.data.detail) {
        throw new Error(`Server error: ${error.response.data.detail}`);
      } else if (typeof error.response.data === "object") {
        // Format validation errors for better display
        const validationErrors = Object.entries(error.response.data)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          )
          .join("; ");
        throw new Error(`Validation error: ${validationErrors}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error("No response received from server");
    }

    throw error;
  }
};

// Get event gallery images
const getEventGallery = async (eventId) => {
  try {
    const response = await api.get(`/events/gallery/event_gallery/`, {
      params: { event_id: eventId },
    });
    return response.data;
  } catch (error) {
    console.error(`Error getting gallery for event with ID ${eventId}:`, error);
    throw error;
  }
};

// Upload an image to event gallery
const uploadGalleryImage = async (eventId, imageFile, caption = "") => {
  try {
    const formData = new FormData();
    formData.append("event", eventId);
    formData.append("image", imageFile);
    if (caption) {
      formData.append("caption", caption);
    }

    const response = await api.post(`/events/gallery/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error uploading gallery image for event with ID ${eventId}:`,
      error
    );
    throw error;
  }
};

// Download event report
const downloadEventReport = async (eventId) => {
  try {
    const response = await api.get(`/events/events/${eventId}/report/`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error downloading report for event with ID ${eventId}:`,
      error
    );
    throw error;
  }
};

// Get event feedback
const getEventFeedback = async (eventId) => {
  try {
    const response = await api.get(`/events/feedback/event_feedback/`, {
      params: { event_id: eventId },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching feedback for event with ID ${eventId}:`,
      error
    );
    throw error;
  }
};

// Get user registrations
const getUserRegistrations = async () => {
  try {
    const response = await api.get(`/events/registrations/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    throw error;
  }
};

// Mark attendance for a registration
const markAttendance = async (registrationId) => {
  try {
    const response = await api.post(
      `/events/registrations/${registrationId}/mark_attendance/`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error marking attendance for registration ${registrationId}:`,
      error
    );
    throw error;
  }
};

const eventService = {
  getEvents,
  getEventById,
  getUpcomingEvents,
  getMyEvents,
  getRegisteredEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getEventAttendees,
  getEventStatistics,
  submitFeedback,
  getEventGallery,
  uploadGalleryImage,
  downloadEventReport,
  getEventFeedback,
  getUserRegistrations,
  markAttendance,
};

export default eventService;
