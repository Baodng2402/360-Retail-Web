import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

import { useLanguageStore } from "@/shared/store/languageStore";
import { Button } from "@/shared/components/ui/button";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const toggleLanguage = useCallback(
    (nextLang: "vi" | "en") => {
      void i18n.changeLanguage(nextLang);
      setLanguage(nextLang);
      const html = document.documentElement;
      html.lang = nextLang;
    },
    [i18n, setLanguage],
  );

  const nextLang = language === "vi" ? "en" : "vi";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-full border-border hover:bg-accent"
      onClick={() => toggleLanguage(nextLang)}
      aria-label={language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"}
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">
        {language === "vi" ? "English" : "Tiếng Việt"}
      </span>
    </Button>
  );
};

