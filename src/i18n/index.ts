import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  DEFAULT_NAMESPACE,
  NAMESPACES,
} from "./config";
import { resourcesBackend } from "./resources-to-backend";

if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesBackend)
    .init({
      lng: DEFAULT_LANGUAGE,
      fallbackLng: FALLBACK_LANGUAGE,
      defaultNS: DEFAULT_NAMESPACE,
      ns: NAMESPACES,
      interpolation: {
        escapeValue: false,
        format: (value, format, lng) => {
          if (!format) return String(value);

          const locale = lng === "en" ? "en-US" : "vi-VN";

          if (format === "datetime") {
            if (!value) return "";
            const date = value instanceof Date ? value : new Date(String(value));
            if (Number.isNaN(date.getTime())) return String(value);
            return date.toLocaleDateString(locale);
          }

          if (format === "number") {
            const num = typeof value === "number" ? value : Number(value);
            if (Number.isNaN(num)) return String(value);
            return new Intl.NumberFormat(locale).format(num);
          }

          if (format === "currency") {
            const num = typeof value === "number" ? value : Number(value);
            if (Number.isNaN(num)) return String(value);
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency: lng === "en" ? "USD" : "VND",
              maximumFractionDigits: 0,
            }).format(num);
          }

          return String(value);
        },
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "360-retail-language",
      },
      returnNull: false,
      returnEmptyString: false,
      react: {
        useSuspense: true,
      },
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize i18next", error);
    });
}

export default i18next;

