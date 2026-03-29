import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";

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

  return (
    <AuthFormLayout
      title={t("auth:forgotPassword.reset.title", { defaultValue: "Reset password" })}
      description={t("auth:forgotPassword.reset.description", {
        defaultValue:
          "Enter the 6-digit code sent to your email and set a new password for your account.",
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-14 pr-4 bg-white text-gray-900 border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300 rounded-xl"
              autoComplete="off"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="space-y-2"
        >
          <Label htmlFor="code" className="text-sm font-semibold text-foreground">
            {t("auth:verify.codeLabel", { defaultValue: "Verification code (6 digits)" })}
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
              <KeyRound className="h-5 w-5 text-[#FF7B21]" />
            </div>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="h-12 pl-14 pr-4 tracking-[0.3em] bg-white text-gray-900 border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300 rounded-xl"
              placeholder="••••••"
              autoComplete="one-time-code"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="space-y-2"
        >
          <Label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
            {t("auth:forgotPassword.reset.newPassword", { defaultValue: "New password" })}
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
              <Lock className="h-5 w-5 text-[#FF7B21]" />
            </div>
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 pl-14 pr-14 bg-white text-gray-900 border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300 rounded-xl"
              placeholder={t("auth:forgotPassword.reset.newPasswordPlaceholder", {
                defaultValue: "At least 8 characters",
              })}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10 transition-all duration-300"
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
          transition={{ duration: 0.4, delay: 0.9 }}
          className="space-y-2"
        >
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
            {t("auth:forgotPassword.reset.confirmPassword", { defaultValue: "Confirm new password" })}
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
              <Lock className="h-5 w-5 text-[#FF7B21]" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pl-14 pr-14 bg-white text-gray-900 border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300 rounded-xl"
              placeholder={t("auth:forgotPassword.reset.confirmPasswordPlaceholder", {
                defaultValue: "Re-enter new password",
              })}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10 transition-all duration-300"
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
          transition={{ duration: 0.4, delay: 1.0 }}
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
      </motion.form>
    </AuthFormLayout>
  );
};

export default ForgotPasswordResetPage;
