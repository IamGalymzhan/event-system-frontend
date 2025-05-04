import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Available languages with their display names
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "kz", name: "Қазақша", flag: "🇰🇿" },
  ];

  // Get current language
  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Change language handler
  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setDropdownOpen(false);
    // Save language preference to localStorage
    localStorage.setItem("preferredLanguage", languageCode);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
        aria-label={t("changeLanguage")}
        title={t("changeLanguage")}
      >
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="hidden md:inline-block text-sm font-medium">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`${
                  i18n.language === language.code
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700"
                } flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                role="menuitem"
              >
                <span className="mr-2">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
