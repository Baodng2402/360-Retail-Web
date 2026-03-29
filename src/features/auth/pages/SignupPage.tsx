import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

import logo from "@/assets/logo.png";
import googleIcon from "@/assets/icon/google-icon.svg";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi, decodeTokenToUser } from "@/shared/lib/authApi";
import { useAuthStore } from "@/shared/store/authStore";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const socialButtons = [{ src: googleIcon, alt: "Google" }] as const;

/**
 * Get redirect path after login.
 * Luôn redirect về /dashboard - Dashboard sẽ kiểm tra và hiển thị onboarding nếu chưa có store.
 */
const getRedirectPathAfterLogin = (): string => {
  return "/dashboard";
};

const SignupPage = () => {
  const { t } = useTranslation(["auth", "common"]);

  const signupSchema = z
    .object({
      name: z.string().min(1, t("common:validation.required")),
      email: z
        .string()
        .min(1, t("common:validation.required"))
        .email(t("common:validation.invalidEmail")),
      password: z
        .string()
        .min(1, t("common:validation.required"))
        .min(6, t("common:validation.minLength", { min: 6 })),
      confirmPassword: z.string().min(1, t("common:validation.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("common:validation.passwordMismatch"),
    });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuthFromToken } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error(t("auth:login.googleLoginError"));
      return;
    }
    try {
      setError(null);
      const res = await authApi.loginWithGoogle(idToken);
      if (!res.accessToken) {
        throw new Error("Access token không hợp lệ từ server");
      }
      localStorage.setItem("token", res.accessToken);

      // Decode token để lấy full user info
      const user = decodeTokenToUser(res.accessToken);
      const userWithAvatar = res.profilePictureUrl
        ? { ...user, avatar: res.profilePictureUrl }
        : user;

      setAuthFromToken(userWithAvatar, res.accessToken);

      if (res.isNewUser) {
        sessionStorage.setItem("pendingGoogleNewUser", "1");
      }
      toast.success(t("auth:login.googleLoginSuccess"));

      // Redirect về /dashboard - Dashboard sẽ kiểm tra và hiển thị onboarding nếu chưa có store
      navigate(getRedirectPathAfterLogin(), { replace: true });
    } catch (err: unknown) {
      console.error("Google signup/login error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("auth:login.googleLoginError");
      setError(message);
      toast.error(message);
    }
  };

  const handleGoogleError = () => {
    toast.error(t("auth:login.googleLoginCanceled"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? t("common:states.error");
      setError(firstError);
      return;
    }

    try {
      setLoading(true);
      await authApi.register({ email, password });

      toast.success(t("auth:signup.signupSuccess"));
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
    } catch (err: unknown) {
      console.error("Register error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t("auth:signup.signupError");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      {/* Hero section with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-0 mt-4 w-[calc(100%-24px)] mx-3 min-h-[35vh] sm:min-h-[38vh] md:min-h-[48vh] rounded-[24px] bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8] pt-2 pb-16 sm:pb-14 md:pb-20 text-white shadow-xl"
      >
        {/* Glow effects */}
        <div className="absolute top-1/4 -right-10 w-[200px] h-[200px] rounded-full bg-white/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -left-10 w-[150px] h-[150px] rounded-full bg-white/10 blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="flex w-full items-start justify-between px-4 sm:px-5 relative z-10">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            src={logo}
            alt="360 Retail"
            className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />

          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-3 sm:mt-1 sm:-mt-4 md:-mt-8 flex flex-col items-center text-center px-4 relative z-10"
        >
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold leading-tight sm:leading-[40px] md:leading-[48px] tracking-[-0.9px]">
            {t("auth:signup.heroTitle")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            {t("auth:signup.heroSubtitle")}
          </p>
        </motion.div>
      </motion.div>

      {/* Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-50 signup-card-wrapper mb-16 flex w-full max-w-[1120px] justify-center px-4 sm:px-6 md:px-0"
      >
        <div className="w-full max-w-[520px] rounded-[15px] bg-white shadow-xl border border-border/50 overflow-hidden">
          <div className="px-4 sm:px-6 md:px-7 pb-8 pt-6 sm:pt-7 md:pt-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex flex-col gap-5"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-[#FF7B21] hover:gap-3"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300" />
                  <span>{t("common:actions.backToHome")}</span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col gap-6 sm:gap-[30px]"
              >
                <h2 className="text-center text-lg font-extrabold leading-[25.2px] bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                  {t("auth:signup.socialTitle")}
                </h2>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="flex items-center justify-center gap-3 sm:gap-[15px]"
                >
                  {socialButtons.map((social, index) =>
                    social.alt === "Google" ? (
                      <motion.div
                        key={social.alt + index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative flex h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] min-h-[80px] min-w-[80px] items-center justify-center rounded-[24px] border border-border/50 bg-white shadow-lg shadow-gray-200/50 overflow-visible hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                        style={{ isolation: "isolate" }}
                      >
                        <img
                          src={googleIcon}
                          alt="Google"
                          className="pointer-events-none absolute inset-0 z-10 m-auto h-10 w-10 object-contain sm:h-12 sm:w-12"
                        />
                        <div
                          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center opacity-0"
                          aria-hidden="true"
                        >
                          <div className="scale-[4] origin-center">
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={handleGoogleError}
                              useOneTap={false}
                              size="large"
                              theme="outline"
                              shape="rectangular"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <Button
                        key={social.alt + index}
                        variant="outline"
                        className="flex h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] items-center justify-center rounded-[24px] border border-border/50 bg-white hover:bg-gray-50 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 p-1.5"
                      >
                        <img
                          src={social.src}
                          alt={social.alt}
                          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                        />
                      </Button>
                    )
                  )}
                </motion.div>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    {t("auth:signup.or")}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="flex flex-col gap-4 sm:gap-6"
                onSubmit={handleSubmit}
              >
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    className="flex flex-col gap-2.5"
                  >
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                      {t("auth:signup.name")}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("auth:signup.namePlaceholder")}
                      className="h-12 sm:h-[50px] rounded-xl border border-border/50 bg-white px-4 sm:px-5 text-sm text-gray-700 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.0 }}
                    className="flex flex-col gap-2.5"
                  >
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                      {t("auth:signup.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth:signup.emailPlaceholder")}
                      className="h-12 sm:h-[50px] rounded-xl border border-border/50 bg-white px-4 sm:px-5 text-sm text-gray-700 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                    className="flex flex-col gap-2.5"
                  >
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      {t("auth:signup.password")}
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth:signup.passwordPlaceholder")}
                        className="h-12 sm:h-[50px] rounded-xl border border-border/50 bg-white pr-10 px-4 sm:px-5 text-sm text-gray-700 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                        data-form-type="other"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10 transition-all duration-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    className="flex flex-col gap-2.5"
                  >
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                      {t("auth:signup.confirmPassword")}
                    </Label>
                    <div className="relative group">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth:signup.confirmPasswordPlaceholder")}
                        className="h-12 sm:h-[50px] rounded-xl border border-border/50 bg-white pr-10 px-4 sm:px-5 text-sm text-gray-700 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 transition-all duration-300"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="off"
                        data-form-type="other"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10 transition-all duration-300"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 sm:h-[52px] rounded-xl bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] px-4 py-3 text-xs sm:text-sm font-bold leading-[18px] tracking-[0.02em] text-white hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? t("auth:signup.submitting") : t("auth:signup.submit")}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("auth:signup.alreadyHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    {t("auth:signup.goToLogin")}
                  </Link>
                </p>
              </motion.form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
