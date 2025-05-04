import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "../components/NotificationDropdown";
import LanguageSelector from "../components/LanguageSelector";

const MainLayout = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <NavLink to="/" className="text-xl font-bold text-sky-600">
                  {t("appName")}
                </NavLink>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-sky-500 text-gray-900 inline-flex items-center px-3 pt-1 text-base font-medium"
                      : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-3 pt-1 text-base font-medium"
                  }
                >
                  {t("browse")}
                </NavLink>
                {isAuthenticated && (
                  <NavLink
                    to="/events"
                    className={({ isActive }) =>
                      isActive
                        ? "border-b-2 border-sky-500 text-gray-900 inline-flex items-center px-3 pt-1 text-base font-medium"
                        : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-3 pt-1 text-base font-medium"
                    }
                  >
                    {t("events")}
                  </NavLink>
                )}
                {isAuthenticated && (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "border-b-2 border-sky-500 text-gray-900 inline-flex items-center px-3 pt-1 text-base font-medium"
                        : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-3 pt-1 text-base font-medium"
                    }
                  >
                    {t("dashboard")}
                  </NavLink>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="ml-3 relative flex items-center space-x-4">
                  {/* Language selector */}
                  <LanguageSelector />

                  {/* Notification button */}
                  <div className="relative">
                    <button
                      onClick={toggleNotificationDropdown}
                      className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
                      aria-label={t("notifications")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </button>

                    {/* Notification dropdown */}
                    <NotificationDropdown
                      isOpen={notificationDropdownOpen}
                      onClose={() => setNotificationDropdownOpen(false)}
                    />
                  </div>

                  <NavLink
                    to="/dashboard/profile"
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <span className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                      {user?.full_name
                        ? user.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                    <span className="ml-2 text-sm font-medium">
                      {user?.full_name || t("profile")}
                    </span>
                  </NavLink>
                  <button
                    onClick={logout}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4 items-center">
                  {/* Language selector for non-authenticated users */}
                  <LanguageSelector />

                  <NavLink
                    to="/login"
                    className="bg-white text-sky-600 border border-sky-600 hover:bg-sky-50 px-4 py-2 rounded-md text-base font-medium"
                  >
                    {t("login")}
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="bg-sky-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-sky-700"
                  >
                    {t("register")}
                  </NavLink>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? "block" : "hidden"} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive
                  ? "bg-sky-50 border-l-4 border-sky-500 text-sky-700 block pl-3 pr-4 py-2 text-base font-medium"
                  : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
              }
            >
              {t("browse")}
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/events"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive
                    ? "bg-sky-50 border-l-4 border-sky-500 text-sky-700 block pl-3 pr-4 py-2 text-base font-medium"
                    : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
                }
              >
                {t("events")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive
                    ? "bg-sky-50 border-l-4 border-sky-500 text-sky-700 block pl-3 pr-4 py-2 text-base font-medium"
                    : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
                }
              >
                {t("dashboard")}
              </NavLink>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <span className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold text-lg">
                      {user?.full_name
                        ? user.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.full_name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </div>
                {/* Add notification option in mobile menu */}
                <button
                  onClick={() => {
                    toggleNotificationDropdown();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  {t("notifications")}
                </button>

                {/* Language selector in mobile menu */}
                <div className="px-4 py-2">
                  <div className="text-base font-medium text-gray-500 mb-2">
                    {t("changeLanguage")}
                  </div>
                  <LanguageSelector />
                </div>

                <NavLink
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  {t("profile")}
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-4">
                {/* Language selector in mobile menu for non-authenticated users */}
                <div className="py-2">
                  <div className="text-base font-medium text-gray-500 mb-2">
                    {t("changeLanguage")}
                  </div>
                  <LanguageSelector />
                </div>

                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="block py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  {t("login")}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={closeMenu}
                  className="block py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  {t("register")}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow py-6">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} {t("appName")}.{" "}
                {t("allRightsReserved")}
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
