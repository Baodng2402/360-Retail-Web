import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
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
import { Switch } from "@/shared/components/ui/switch";
import { authApi, decodeTokenToUser } from "@/shared/lib/authApi";
import { useAuthStore } from "@/shared/store/authStore";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const socialButtons = [{ src: googleIcon, alt: "Google" }] as const;

/**
 * Get redirect path after login.
 * Luôn redirect về /dashboard - Dashboard sẽ kiểm tra và hiển thị onboarding nếu chưa có store.
 * Theo luồng MVP: Login -> Dashboard -> (nếu chưa có store) hiện onboarding + StartTrialDialog
 */
const getRedirectPathAfterLogin = (): string => {
  return "/dashboard";
};

const LoginBody = () => {
  const { t } = useTranslation(["auth", "common"]);

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t("common:validation.required"))
      .email(t("common:validation.invalidEmail")),
    password: z
      .string()
      .min(1, t("common:validation.required"))
      .min(6, t("common:validation.minLength", { min: 6 })),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      // Decode token để lấy full user info (role, status, store_id)
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
      console.error("Google login error", err);
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

  useEffect(() => {
    const storedRemember = localStorage.getItem("loginRememberMe");
    const storedEmail = localStorage.getItem("rememberedEmail");

    if (storedRemember === "true") {
      setRememberMe(true);
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  const handleRememberChange = (checked: boolean) => {
    setRememberMe(checked);
    localStorage.setItem("loginRememberMe", String(checked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? t("common:states.error");
      setError(firstError);
      return;
    }

    try {
      setLoading(true);
      const loginRes = await authApi.login({ email, password });

      if (!loginRes.accessToken) {
        throw new Error("Access token không hợp lệ từ server");
      }

      localStorage.setItem("token", loginRes.accessToken);

      // Decode token để lấy full user info (role, status, store_id)
      const user = decodeTokenToUser(loginRes.accessToken);
      setAuthFromToken(user, loginRes.accessToken);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success(t("auth:login.loginSuccess", { defaultValue: "Login successful!" }));

      // Redirect về /dashboard - Dashboard sẽ kiểm tra và hiển thị onboarding nếu chưa có store
      navigate(getRedirectPathAfterLogin(), { replace: true });
    } catch (err: unknown) {
      console.error("Login error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("common:states.error");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <div className="flex w-full max-w-[1920px] mx-auto">
        {/* Left Panel - Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative flex w-full lg:w-[50%] flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-50 px-6 sm:px-12 md:px-16 lg:px-20 py-12 text-gray-900 dark:text-gray-900 backdrop-blur-xl"
        >
          {/* Background decoration */}
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent leading-tight">
                {t("auth:login.title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {t("auth:login.subtitle")}
              </p>
            </div>

            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[#FF7B21]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("common:actions.backToHome")}</span>
              </Link>
            </div>

            <form className="login-form space-y-5" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground"
                >
                  {t("auth:login.email")}
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
                    <Mail className="h-5 w-5 text-[#FF7B21]" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth:signup.emailPlaceholder")}
                    className="login-email-input h-12 pl-14 pr-4 bg-gray-50 dark:bg-white text-gray-900 dark:text-gray-900 placeholder:text-muted-foreground border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 focus:ring-offset-0 transition-all duration-300 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    data-form-type="other"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground"
                >
                  {t("auth:login.password")}
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7B21]/10 to-[#19D6C8]/10 flex items-center justify-center transition-all duration-300 group-focus-within:bg-gradient-to-br group-focus-within:from-[#FF7B21]/20 group-focus-within:to-[#19D6C8]/20">
                    <Lock className="h-5 w-5 text-[#FF7B21]" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth:signup.passwordPlaceholder")}
                    className="login-password-input h-12 pl-14 pr-14 bg-gray-50 dark:bg-white text-gray-900 dark:text-gray-900 placeholder:text-muted-foreground border-border/50 focus:border-[#FF7B21] focus:ring-2 focus:ring-[#FF7B21]/20 focus:ring-offset-0 transition-all duration-300 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    data-form-type="other"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#FF7B21] p-2 rounded-lg hover:bg-[#FF7B21]/10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex items-center space-x-3"
              >
                <Switch
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={handleRememberChange}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-medium text-muted-foreground"
                >
                  {t("auth:login.rememberMe")}
                </Label>
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
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-sm font-bold uppercase tracking-wide text-white hover:shadow-xl hover:shadow-[#FF7B21]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
                >
                  {loading ? t("auth:login.submitting") : t("auth:login.submit")}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-muted-foreground hover:text-[#FF7B21] underline-offset-4 hover:underline transition-colors"
                  >
                    {t("auth:login.forgotPassword")}
                  </Link>
                  <div className="text-right">
                    <span className="text-muted-foreground mr-1">
                      {t("auth:login.noAccount")}
                    </span>
                    <Link
                      to="/signup"
                      className="font-bold bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                    >
                      {t("auth:login.goToSignup")}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="uppercase tracking-widest font-semibold">
                    {t("auth:signup.or")}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  {socialButtons.map((social) =>
                    social.alt === "Google" ? (
                      <motion.div
                        key={social.alt}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative flex h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] min-w-[72px] min-h-[72px] items-center justify-center rounded-2xl border border-border/50 bg-white shadow-lg shadow-gray-200/50 overflow-visible hover:bg-gray-50 hover:shadow-xl transition-all duration-300"
                        style={{ isolation: "isolate" }}
                      >
                        <img
                          src={googleIcon}
                          alt="Google"
                          className="pointer-events-none absolute inset-0 z-10 m-auto h-9 w-9 object-contain sm:h-10 sm:w-10"
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
                        key={social.alt}
                        type="button"
                        variant="outline"
                        className="flex h-[72px] w-[72px] sm:h-[80px] sm:w-[80px] items-center justify-center rounded-2xl border border-border/50 bg-white hover:bg-gray-50 shadow-lg shadow-gray-200/50 p-1.5 hover:shadow-xl transition-all duration-300"
                      >
                        <img
                          src={social.src}
                          alt={social.alt}
                          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
                        />
                      </Button>
                    )
                  )}
                </div>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>

        {/* Right Panel - Decorative */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative hidden lg:flex w-[50%] min-h-screen overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF7B21] via-[#FF9F45] to-[#19D6C8]">
            {/* Animated floating orbs */}
            <motion.div
              className="absolute top-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-white/10 backdrop-blur-sm"
              animate={{
                y: [0, -30, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-[15%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/10 backdrop-blur-sm"
              animate={{
                y: [0, 25, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <motion.div
              className="absolute top-[50%] right-[5%] w-[150px] h-[150px] rounded-full bg-white/10 backdrop-blur-sm"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
            <motion.div
              className="absolute top-[30%] left-[20%] w-[180px] h-[180px] rounded-full bg-white/5 backdrop-blur-sm"
              animate={{
                y: [0, 30, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute bottom-[35%] right-[25%] w-[120px] h-[120px] rounded-full bg-white/10 backdrop-blur-sm"
              animate={{
                y: [0, -25, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />

            {/* Decorative circles */}
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full border-2 border-white/20" />
            <div className="absolute bottom-32 left-20 w-48 h-48 rounded-full border border-white/10" />
            <div className="absolute top-40 left-1/3 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>

          {/* Content overlay - Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Animated Logo Circle */}
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
                  {/* Floating emoji decorations */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-2xl">🛒</span>
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 -left-4 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    <span className="text-2xl">📊</span>
                  </motion.div>
                  <motion.div
                    className="absolute top-1/2 -right-10 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                    animate={{ x: [0, 5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <span className="text-xl">👥</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginBody;
