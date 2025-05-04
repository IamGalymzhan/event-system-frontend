import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import notificationService from "../services/notificationService";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        const response = await notificationService.getNotifications();
        setNotifications(response.results || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(t("errorLoadingNotifications"));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen, t]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();

      // Update local state to mark all as read
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      setError(t("errorMarkingAsRead"));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-14 left-4 md:left-auto md:right-4 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50"
    >
      <div className="sticky top-0 z-10 bg-white p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("notifications")}</h3>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-sky-600 hover:text-sky-800"
          >
            {t("markAllAsRead")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 text-center">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-gray-500 text-center">
          {t("noNotifications")}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 hover:bg-gray-50 ${
                !notification.is_read ? "bg-sky-50" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">
                  {notification.message}
                </h4>
                {!notification.is_read && (
                  <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">
                    {t("new")}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {notification.event_details}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {format(
                  new Date(notification.created_at),
                  "MMM d, yyyy • h:mm a"
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDropdown;
