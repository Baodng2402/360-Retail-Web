import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";

const ForgotPasswordRequestPage = () => {
  const { t } = useTranslation(["auth", "common"]);
  const forgotSchema = z.object({
    email: z
      .string()
      .min(1, t("common:validation.required"))
      .email(t("common:validation.invalidEmail")),
  });

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? t("common:states.error");
      setError(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const message = await authApi.requestPasswordReset({ email });
      toast.success(
        message ||
          t("auth:forgotPassword.request.success", {
            defaultValue:
              "If the email exists, a verification code has been sent. Please check your inbox.",
          }),
      );
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      console.error("Forgot password error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        t("auth:forgotPassword.request.error", {
          defaultValue:
            "Unable to send reset code. Please try again later.",
        });
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title={t("auth:forgotPassword.request.title", { defaultValue: "Forgot password" })}
      description={t("auth:forgotPassword.request.description", {
        defaultValue:
          "Enter your account email. We'll send a 6-digit verification code to reset your password.",
      })}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t("auth:login.email")}
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder={t("auth:forgotPassword.request.emailPlaceholder", {
                defaultValue: "your@email.com",
              })}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 pl-11"
              autoComplete="off"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting
            ? t("auth:forgotPassword.request.submitting", { defaultValue: "SENDING..." })
            : t("auth:forgotPassword.request.submit", { defaultValue: "SEND CODE" })}
        </Button>

        <p className="text-xs text-gray-500">
          {t("auth:forgotPassword.request.securityNote", {
            defaultValue:
              "For security, we always show a generic message even if the email does not exist in the system.",
          })}
        </p>
      </form>
    </AuthFormLayout>
  );
};

export default ForgotPasswordRequestPage;
