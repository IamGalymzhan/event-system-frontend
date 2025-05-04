import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const DashboardSection = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      {/* Dashboard content */}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default DashboardSection;
