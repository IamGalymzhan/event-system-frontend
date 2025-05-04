import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import facultyService from "../services/facultyService";
import DashboardSection from "../components/DashboardSection";

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUserInfo } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    faculty_fk: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        faculty_fk: user.faculty_fk || "",
      });
    }

    const fetchFaculties = async () => {
      try {
        const response = await facultyService.getAllFaculties();
        setFaculties(
          Array.isArray(response?.results)
            ? response.results
            : Array.isArray(response)
            ? response
            : []
        );
      } catch (err) {
        console.error("Error fetching faculties:", err);
        setFaculties([]);
      }
    };

    fetchFaculties();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const profileDataWithId = {
        ...formData,
        id: user.id,
      };

      const updatedUser = await userService.updateProfile(profileDataWithId);
      updateUserInfo(updatedUser);
      setSuccess(t("profileUpdateSuccess"));
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(t("profileUpdateError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError(t("passwordsDoNotMatch"));
      setLoading(false);
      return;
    }

    try {
      await userService.updatePassword({
        userId: user.id,
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setSuccess(t("passwordUpdateSuccess"));
    } catch (err) {
      console.error("Error updating password:", err);
      setError(t("passwordUpdateError"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardSection>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t("profile")}</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {t("profileInformation")}
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("fullName")}
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("email")}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("faculty")}
                      </label>
                      <select
                        name="faculty_fk"
                        value={formData.faculty_fk}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                      >
                        <option value="">{t("selectFaculty")}</option>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("role")}
                      </label>
                      <input
                        type="text"
                        value={t(user.role.toLowerCase())}
                        className="w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {t("roleCannotBeChanged")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                      disabled={loading}
                    >
                      {loading ? t("saving") : t("saveChanges")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* User Info Summary & Password Change */}
          <div className="md:col-span-1">
            {/* User Summary Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">{t("accountSummary")}</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.full_name
                      ? user.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium">{user.full_name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        {t("role")}
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {t(user.role.toLowerCase())}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">{t("changePassword")}</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("currentPassword")}
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("newPassword")}
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("confirmNewPassword")}
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                      disabled={loading}
                    >
                      {loading ? t("updating") : t("updatePassword")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardSection>
  );
};

export default Profile;
