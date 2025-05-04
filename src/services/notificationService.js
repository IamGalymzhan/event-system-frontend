import { API_URL } from "../config";
import axios from "axios";
import api from "../utils/api";

const getNotifications = async (params = {}) => {
  try {
    let url = `${API_URL}/events/notifications/`;

    // Add query parameters
    if (Object.keys(params).length) {
      const queryParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      }

      url += `?${queryParams.toString()}`;
    }

    // Use the api utility which handles token refresh automatically
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

const markAllNotificationsAsRead = async () => {
  try {
    // Use the api utility which handles token refresh automatically
    const response = await api.post(
      `${API_URL}/events/notifications/mark_all_read/`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

const notificationService = {
  getNotifications,
  markAllNotificationsAsRead,
};

export default notificationService;
