import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white text-gray-900 border-gray-200 pl-11"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium text-gray-700">
            {t("auth:verify.codeLabel", { defaultValue: "Verification code (6 digits)" })}
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="h-12 pl-11 tracking-[0.3em] bg-white text-gray-900 border-gray-200"
              placeholder="••••••"
              autoComplete="one-time-code"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            {t("auth:forgotPassword.reset.newPassword", { defaultValue: "New password" })}
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 pl-11 pr-11 bg-white text-gray-900 border-gray-200 placeholder:text-gray-500"
              placeholder={t("auth:forgotPassword.reset.newPasswordPlaceholder", {
                defaultValue: "At least 8 characters",
              })}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            {t("auth:forgotPassword.reset.confirmPassword", { defaultValue: "Confirm new password" })}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pr-11 bg-white text-gray-900 border-gray-200 placeholder:text-gray-500"
              placeholder={t("auth:forgotPassword.reset.confirmPasswordPlaceholder", {
                defaultValue: "Re-enter new password",
              })}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting
            ? t("auth:forgotPassword.reset.submitting", { defaultValue: "PROCESSING..." })
            : t("auth:forgotPassword.reset.submit", { defaultValue: "RESET PASSWORD" })}
        </Button>
      </form>
    </AuthFormLayout>
  );
};

export default ForgotPasswordResetPage;
