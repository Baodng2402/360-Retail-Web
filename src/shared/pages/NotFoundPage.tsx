import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";

export default function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">{t("pages.notFound.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("pages.notFound.description")}
        </p>
        <div className="mt-5">
          <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
            <Link to="/">{t("actions.backToHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

