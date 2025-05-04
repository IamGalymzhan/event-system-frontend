import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="h-16 flex items-center px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white">
        <Link to="/" className="text-xl font-bold text-sky-600">
          {t("appName")}
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <Outlet />
        </div>
      </div>

      <div className="py-4 text-center text-sm text-gray-500 bg-white border-t border-gray-200">
        <p>
          &copy; {new Date().getFullYear()} {t("appName")}.{" "}
          {t("allRightsReserved")}
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
