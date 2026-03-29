import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

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
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
            {t("auth:login.email")}
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
              <Mail className="h-5 w-5 text-[#FF7B21]" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder={t("auth:forgotPassword.request.emailPlaceholder", {
                defaultValue: "your@email.com",
              })}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-14 pr-4 bg-white text-gray-900 placeholder:text-muted-foreground border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300 rounded-xl"
              autoComplete="off"
            />
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20"
          >
            {error}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="space-y-4"
        >
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-sm font-bold uppercase tracking-wide text-white hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
          >
            {submitting
              ? t("auth:forgotPassword.request.submitting", { defaultValue: "SENDING..." })
              : t("auth:forgotPassword.request.submit", { defaultValue: "SEND CODE" })}
          </Button>

          <p className="text-xs text-muted-foreground bg-muted/50 px-4 py-3 rounded-xl">
            {t("auth:forgotPassword.request.securityNote", {
              defaultValue:
                "For security, we always show a generic message even if the email does not exist in the system.",
            })}
          </p>
        </motion.div>
      </motion.form>
    </AuthFormLayout>
  );
};

export default ForgotPasswordRequestPage;
