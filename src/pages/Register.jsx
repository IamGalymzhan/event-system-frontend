import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import facultyService from "../services/facultyService";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("GUEST");
  const [facultyId, setFacultyId] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFaculties = async () => {
      setIsLoadingFaculties(true);
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
      } catch (err) {
        console.error("Failed to fetch faculties", err);
        setFaculties([]);
      } finally {
        setIsLoadingFaculties(false);
      }
    };

    fetchFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);

    const userData = {
      email,
      password,
      full_name: fullName,
      role,
      faculty_fk: facultyId || null,
    };

    try {
      const response = await register(userData);
      // Redirect to dashboard after successful registration
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          Object.values(err.response?.data || {})[0]?.[0] ||
          t("registrationError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Link
        to="/"
        className="inline-block mb-6 text-sm text-sky-600 hover:text-sky-500"
      >
        {t("backToHome")}
      </Link>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {t("createAccountTitle")}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        {t("or")}{" "}
        <Link
          to="/login"
          className="font-medium text-sky-600 hover:text-sky-500"
        >
          {t("signInToExisting")}
        </Link>
      </p>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            id="full-name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder={t("fullNamePlaceholder")}
          />
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder={t("emailPlaceholder")}
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder={t("passwordPlaceholder")}
          />
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            placeholder={t("confirmPasswordPlaceholder")}
          />

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              {t("role")}
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full py-3 px-4 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            >
              <option value="GUEST">{t("guest")}</option>
              <option value="STUDENT">{t("student")}</option>
              <option value="INSTRUCTOR">{t("instructor")}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="faculty"
              className="block text-sm font-medium text-gray-700"
            >
              {t("faculty")}
            </label>
            <select
              id="faculty"
              name="faculty"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="mt-1 block w-full py-3 px-4 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              disabled={isLoadingFaculties}
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
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("creatingAccount") : t("createAccount")}
          </button>
        </div>

        <div className="text-sm text-center">
          <p className="text-gray-600">
            {t("termsAgreement")}{" "}
            <Link
              to="/terms"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              {t("termsOfService")}
            </Link>{" "}
            {t("and")}{" "}
            <Link
              to="/privacy"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              {t("privacyPolicy")}
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
