import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-sky-600">404</h1>
        <h2 className="text-3xl font-semibold my-4 text-gray-800">
          {t("pageNotFound")}
        </h2>
        <p className="text-gray-600 mb-8">{t("pageNotFoundMessage")}</p>
        <Link
          to="/"
          className="inline-flex items-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
