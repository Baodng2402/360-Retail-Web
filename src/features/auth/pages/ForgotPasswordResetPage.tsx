import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const ForgotPasswordResetPage = () => {
  const { t } = useTranslation(["auth", "common"]);

  const resetSchema = z
    .object({
      email: z
        .string()
        .min(1, t("common:validation.required"))
        .email(t("common:validation.invalidEmail")),
      code: z
        .string()
        .min(
          6,
          t("auth:verify.codeLength", { defaultValue: "Verification code must be 6 digits." }),
        )
        .max(
          6,
          t("auth:verify.codeLength", { defaultValue: "Verification code must be 6 digits." }),
        ),
      newPassword: z
        .string()
        .min(8, t("common:validation.minLength", { min: 8 })),
      confirmPassword: z.string().min(1, t("common:validation.required")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("common:validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = resetSchema.safeParse({
      email,
      code,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? t("common:states.error");
      setError(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const message = await authApi.resetPassword({
        email,
        resetCode: code,
        newPassword,
      });
      toast.success(
        message ||
          t("auth:forgotPassword.reset.success", {
            defaultValue: "Password has been reset successfully.",
          }),
      );
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      console.error("Reset password error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        t("auth:forgotPassword.reset.error", {
          defaultValue: "Unable to reset password. Please check the verification code.",
        });
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClass =
    "h-12 px-4 bg-gray-50 dark:bg-white text-gray-900 dark:text-gray-900 placeholder:text-muted-foreground border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 focus:ring-offset-0 transition-all duration-300 rounded-xl";

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
                {t("auth:forgotPassword.reset.title", { defaultValue: "Reset password" })}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {t("auth:forgotPassword.reset.description", {
                  defaultValue:
                    "Enter the 6-digit code sent to your email and set a new password for your account.",
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`login-email-input ${inputBaseClass}`}
                  autoComplete="email"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="space-y-2"
              >
                <Label htmlFor="code" className="text-sm font-semibold text-foreground">
                  {t("auth:verify.codeLabel", { defaultValue: "Verification code (6 digits)" })}
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`${inputBaseClass} tracking-[0.3em]`}
                  placeholder="••••••"
                  autoComplete="one-time-code"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-2"
              >
                <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
                  {t("auth:forgotPassword.reset.newPassword", { defaultValue: "New password" })}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`login-password-input ${inputBaseClass} pr-14`}
                    placeholder={t("auth:forgotPassword.reset.newPasswordPlaceholder", {
                      defaultValue: "At least 8 characters",
                    })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10 transition-all duration-300"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                  {t("auth:forgotPassword.reset.confirmPassword", {
                    defaultValue: "Confirm new password",
                  })}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`login-password-input ${inputBaseClass} pr-14`}
                    placeholder={t("auth:forgotPassword.reset.confirmPasswordPlaceholder", {
                      defaultValue: "Re-enter new password",
                    })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10 transition-all duration-300"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
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
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-sm font-bold uppercase tracking-wide text-white hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
                >
                  {submitting
                    ? t("auth:forgotPassword.reset.submitting", { defaultValue: "PROCESSING..." })
                    : t("auth:forgotPassword.reset.submit", { defaultValue: "RESET PASSWORD" })}
                </Button>
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

export default ForgotPasswordResetPage;
