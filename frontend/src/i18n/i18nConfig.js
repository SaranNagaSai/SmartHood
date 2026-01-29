// Configures multilingual support for the entire application
// Enables dynamic switching between English and Telugu

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./en.json";
import te from "./te.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      te: { translation: te }
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
