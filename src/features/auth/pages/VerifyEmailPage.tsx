import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { KeyRound, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";

const VerifyEmailPage = () => {
  const { t } = useTranslation(["auth", "common"]);
  const verifySchema = z.object({
    email: z
      .string()
      .min(1, t("common:validation.required"))
      .email(t("common:validation.invalidEmail")),
    otpCode: z
      .string()
      .min(
        6,
        t("auth:verify.codeLength", { defaultValue: "Verification code must be 6 digits." }),
      )
      .max(
        6,
        t("auth:verify.codeLength", { defaultValue: "Verification code must be 6 digits." }),
      ),
  });

  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = verifySchema.safeParse({ email, otpCode });
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? t("common:states.error");
      setError(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const message = await authApi.verifyEmail({ email, otpCode });
      toast.success(
        message ||
          t("auth:verify.success", {
            defaultValue: "Email verified successfully. You can sign in now.",
          }),
      );
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      console.error("Verify email error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        t("auth:verify.error", {
          defaultValue: "Unable to verify email. Please check the OTP code.",
        });
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error(t("common:validation.required"));
      return;
    }
    try {
      setResending(true);
      const message = await authApi.resendOtp({ email });
      toast.success(
        message ||
          t("auth:verify.resendSuccess", {
            defaultValue: "Verification code resent. Please check your inbox.",
          }),
      );
    } catch (err: unknown) {
      console.error("Resend OTP error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        t("auth:verify.resendError", {
          defaultValue: "Unable to resend code. Please try again later.",
        });
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthFormLayout
      title={t("auth:verify.title", { defaultValue: "Verify email" })}
      description={t("auth:verify.description", {
        defaultValue:
          "Enter your email and the 6-digit code sent to your inbox to activate your account.",
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
          <Label htmlFor="otpCode" className="text-sm font-medium text-gray-700">
            {t("auth:verify.codeLabel", { defaultValue: "Verification code (6 digits)" })}
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="otpCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="h-12 pl-11 tracking-[0.3em] bg-white text-gray-900 border-gray-200"
              placeholder="••••••"
              autoComplete="one-time-code"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting
              ? t("auth:verify.submitting", { defaultValue: "VERIFYING..." })
              : t("auth:verify.submit", { defaultValue: "VERIFY EMAIL" })}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center text-sm text-gray-600 hover:text-teal-600 underline-offset-4 hover:underline disabled:opacity-60"
          >
            {resending
              ? t("auth:verify.resending", { defaultValue: "Resending..." })
              : t("auth:verify.resend", {
                  defaultValue: "Didn't receive the email? Resend code",
                })}
          </button>
        </div>
      </form>
    </AuthFormLayout>
  );
};

export default VerifyEmailPage;
