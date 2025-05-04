import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import facultyService from "../services/facultyService";
import DashboardSection from "../components/DashboardSection";

const FacultyManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

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
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    setLoading(true);
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
      setError(null);
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError(t("errorLoadingFaculties"));
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      setError(t("allFieldsRequired"));
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await facultyService.updateFaculty(editingId, formData);
      } else {
        await facultyService.createFaculty(formData);
      }

      setFormData({ name: "", code: "" });
      setEditingId(null);
      fetchFaculties();
    } catch (err) {
      console.error("Error saving faculty:", err);
      setError(err.response?.data?.message || t("errorSavingFaculty"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setFormData({
      name: faculty.name,
      code: faculty.code,
    });
    setEditingId(faculty.id);
  };

  const confirmDelete = (faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!facultyToDelete) return;

    setLoading(true);
    try {
      await facultyService.deleteFaculty(facultyToDelete.id);
      setShowDeleteModal(false);
      setFacultyToDelete(null);
      fetchFaculties();
    } catch (err) {
      console.error("Error deleting faculty:", err);
      setError(err.response?.data?.message || t("errorDeletingFaculty"));
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: "", code: "" });
    setEditingId(null);
  };

  const content = (
    <>
      <h1 className="text-2xl font-bold mb-6">{t("facultyManagement")}</h1>

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

      {/* Faculty Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? t("editFaculty") : t("addFaculty")}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("facultyName")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("facultyCode")} *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-500 focus:ring-opacity-50"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              disabled={loading}
            >
              {loading
                ? t("saving")
                : editingId
                ? t("updateFaculty")
                : t("createFaculty")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Faculties List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{t("faculties")}</h2>
        </div>

        {loading && faculties.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">{t("loading")}</p>
          </div>
        ) : !Array.isArray(faculties) || faculties.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">{t("noFacultiesFound")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("name")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("code")}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(faculties) &&
                  faculties.map((faculty) => (
                    <tr key={faculty.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {faculty.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {faculty.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(faculty)}
                          className="text-sky-600 hover:text-sky-900 mr-4"
                        >
                          {t("edit")}
                        </button>
                        <button
                          onClick={() => confirmDelete(faculty)}
                          className="text-red-600 hover:text-red-900"
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
            <p className="text-sm text-gray-500 mb-6">
              {t("deleteFacultyConfirmation", {
                name: facultyToDelete?.name,
              })}
            </p>
            <div className="mt-4 flex space-x-3 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                onClick={() => setShowDeleteModal(false)}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDelete}
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

export default FacultyManagement;
