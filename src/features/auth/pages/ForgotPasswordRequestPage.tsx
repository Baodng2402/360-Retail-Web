import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

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
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <div className="flex w-full max-w-[1920px] mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative flex w-full lg:w-[50%] flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-50 px-6 sm:px-12 md:px-16 lg:px-20 py-12 text-gray-900 dark:text-gray-900 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-[400px] w-[400px] -ml-[100px] -mt-[100px] rounded-full bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-[#19D6C8]/10 to-transparent blur-2xl" />

          <div className="absolute left-6 top-6 sm:left-10 z-20 flex items-center gap-3">
            <img
              src={logo}
              alt="360 Retail"
              className="h-12 sm:h-16 w-auto object-contain"
            />
            <LanguageSwitcher />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative z-10 w-full max-w-md mt-16"
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent leading-snug pb-1">
                {t("auth:forgotPassword.request.title", { defaultValue: "Forgot password" })}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {t("auth:forgotPassword.request.description", {
                  defaultValue:
                    "Enter your account email. We'll send a 6-digit verification code to reset your password.",
                })}
              </p>
            </div>

            <div className="mb-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[#FF7B21]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>
                  {t("auth:layout.backToLogin", {
                    defaultValue: "Back to Login",
                  })}
                </span>
              </Link>
            </div>

            <form className="login-form space-y-5" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  {t("auth:login.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth:forgotPassword.request.emailPlaceholder", {
                    defaultValue: "your@email.com",
                  })}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-email-input h-12 px-4 bg-gray-50 dark:bg-white text-gray-900 dark:text-gray-900 placeholder:text-muted-foreground border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 focus:ring-offset-0 transition-all duration-300 rounded-xl"
                  autoComplete="email"
                />
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
                transition={{ duration: 0.4, delay: 0.4 }}
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

                <p className="text-xs text-muted-foreground bg-muted/50 px-4 py-3 rounded-xl leading-relaxed">
                  {t("auth:forgotPassword.request.securityNote", {
                    defaultValue:
                      "For security, we always show a generic message even if the email does not exist in the system.",
                  })}
                </p>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative hidden lg:flex w-[50%] min-h-screen overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8]">
            <motion.div
              className="absolute top-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-white/10 backdrop-blur-sm"
              animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-[15%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/10 backdrop-blur-sm"
              animate={{ y: [0, 25, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full border-2 border-white/20" />
            <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full border border-white/10" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  className="relative mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <img
                      src={logo}
                      alt="360 Retail Logo"
                      className="w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordRequestPage;
