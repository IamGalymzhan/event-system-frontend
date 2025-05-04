import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import facultyService from "../services/facultyService";
import DashboardSection from "../components/DashboardSection";

const UserManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Check if user is admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t("unauthorizedAccess")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, facultiesData] = await Promise.all([
          userService.getAllUsers(),
          facultyService.getAllFaculties(),
        ]);
        setUsers(usersData.results || []);
        setFaculties(facultiesData || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("errorLoadingData"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      await userService.deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);

      // Refresh user list
      const response = await userService.getAllUsers();
      setUsers(response.results || []);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || t("errorDeletingUser"));
    } finally {
      setLoading(false);
    }
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find((f) => f.id === facultyId);
    return faculty ? faculty.name : t("noFaculty");
  };

  const content = (
    <>
      <h1 className="text-2xl font-bold mb-6">{t("userManagement")}</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{t("users")}</h2>
        </div>

        {loading && users.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">{t("loading")}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">{t("noUsersFound")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("email")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("faculty")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "INSTRUCTOR"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t(user.role.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFacultyName(user.faculty_fk)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => confirmDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user.id === user.id}
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl z-10 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("confirmDelete")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {t("deleteUserConfirmation", {
                name: userToDelete?.full_name,
              })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                disabled={loading}
              >
                {loading ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return <DashboardSection>{content}</DashboardSection>;
};

export default UserManagement;
