import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const DashboardTabs = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive
              ? "border-sky-500 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          }
        >
          {t("dashboard")}
        </NavLink>

        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            isActive
              ? "border-sky-500 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          }
        >
          {t("profile")}
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            isActive
              ? "border-sky-500 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          }
        >
          {t("events")}
        </NavLink>

        {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
          <NavLink
            to="/dashboard/events/create"
            className={({ isActive }) =>
              isActive
                ? "border-sky-500 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            }
          >
            {t("createEvent")}
          </NavLink>
        )}

        {user?.role === "ADMIN" && (
          <>
            <NavLink
              to="/dashboard/users"
              className={({ isActive }) =>
                isActive
                  ? "border-sky-500 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              }
            >
              {t("userManagement")}
            </NavLink>

            <NavLink
              to="/dashboard/faculties"
              className={({ isActive }) =>
                isActive
                  ? "border-sky-500 text-sky-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              }
            >
              {t("facultyManagement")}
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};

export default DashboardTabs;
