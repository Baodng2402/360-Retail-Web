import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { KeyRound, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

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
          <Label htmlFor="otpCode" className="text-sm font-semibold text-foreground">
            {t("auth:verify.codeLabel", { defaultValue: "Verification code (6 digits)" })}
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
              <KeyRound className="h-5 w-5 text-[#FF7B21]" />
            </div>
            <Input
              id="otpCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="h-12 pl-14 pr-4 tracking-[0.3em] bg-white text-gray-900 border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300 rounded-xl"
              placeholder="••••••"
              autoComplete="one-time-code"
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
          transition={{ duration: 0.4, delay: 0.8 }}
          className="space-y-4"
        >
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-sm font-bold uppercase tracking-wide text-white hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
          >
            {submitting
              ? t("auth:verify.submitting", { defaultValue: "VERIFYING..." })
              : t("auth:verify.submit", { defaultValue: "VERIFY EMAIL" })}
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full text-center text-sm text-muted-foreground hover:text-[#FF7B21] underline-offset-4 hover:underline disabled:opacity-60 transition-colors"
          >
            {resending
              ? t("auth:verify.resending", { defaultValue: "Resending..." })
              : t("auth:verify.resend", {
                  defaultValue: "Didn't receive the email? Resend code",
                })}
          </button>
        </motion.div>
      </motion.form>
    </AuthFormLayout>
  );
};

export default VerifyEmailPage;
