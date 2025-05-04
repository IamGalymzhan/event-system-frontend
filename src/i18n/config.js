import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslation from "../locales/en/translation.json";
import ruTranslation from "../locales/ru/translation.json";
import kzTranslation from "../locales/kz/translation.json";

// Get preferred language from localStorage or use browser detection
const getPreferredLanguage = () => {
  return (
    localStorage.getItem("preferredLanguage") ||
    navigator.language?.split("-")[0] ||
    "en"
  );
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: getPreferredLanguage(),
    resources: {
      en: {
        translation: enTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
      kz: {
        translation: kzTranslation,
      },
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "preferredLanguage",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
