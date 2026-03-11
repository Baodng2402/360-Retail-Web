import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";

import { useLanguageStore } from "@/shared/store/languageStore";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

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

  const currentLabel = useMemo(() => {
    if (language === "vi") return "Tiếng Việt";
    return "English";
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-full px-3 border-border hover:bg-accent"
          aria-label="Language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Ngôn ngữ</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => toggleLanguage("vi")}
          className="flex items-center justify-between"
        >
          <span>Tiếng Việt</span>
          {language === "vi" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => toggleLanguage("en")}
          className="flex items-center justify-between"
        >
          <span>English</span>
          {language === "en" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

