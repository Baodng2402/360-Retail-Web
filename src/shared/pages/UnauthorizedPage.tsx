import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";

export default function UnauthorizedPage() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">{t("pages.unauthorized.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("pages.unauthorized.description")}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
            <Link to="/">{t("actions.backToHome")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">{t("pages.unauthorized.backToLogin")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

