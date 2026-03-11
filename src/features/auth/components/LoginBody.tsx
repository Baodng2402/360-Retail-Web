import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

import logo from "@/assets/logo.png";
import googleIcon from "@/assets/icon/google-icon.svg";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { authApi } from "@/shared/lib/authApi";
import { useAuthStore } from "@/shared/store/authStore";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";

const socialButtons = [{ src: googleIcon, alt: "Google" }] as const;

const getDefaultPathByRole = (role?: string | null) => {
  const r = (role ?? "").toLowerCase();
  if (r === "superadmin") return "/admin";
  if (r === "customer") return "/customer";
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
  const { setAuth } = useAuthStore();

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
      const user = await authApi.me();
      const userWithAvatar = res.profilePictureUrl
        ? { ...user, avatar: res.profilePictureUrl }
        : user;
      setAuth(userWithAvatar, res.accessToken);
      if (res.isNewUser) {
        sessionStorage.setItem("pendingGoogleNewUser", "1");
      }
      toast.success(t("auth:login.googleLoginSuccess"));
      navigate(getDefaultPathByRole(userWithAvatar.role), { replace: true });
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

      const user = await authApi.me();
      setAuth(user, loginRes.accessToken);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success(t("auth:login.googleLoginSuccess"));

      navigate(getDefaultPathByRole(user.role), { replace: true });
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
    <div className="flex min-h-screen w-full bg-white text-gray-900">
      <div className="mx-auto flex w-full max-w-[1920px]">
        <div className="relative flex w-[45%] flex-col items-center justify-center bg-white dark:bg-white px-16 py-14 text-gray-900 dark:text-gray-900">
          <div className="pointer-events-none absolute left-0 top-0 h-[531.85px] w-[531.85px] -ml-[121.8px] -mt-[124.6px] rounded-full bg-gradient-to-br from-[rgba(13,148,136,0.18)] to-[rgba(13,148,136,0)] blur-[32px] rotate-[36.47deg]" />

          <div className="absolute left-16 top-10 z-20 flex items-center gap-3">
            <img
              src={logo}
              alt="360 Retail"
              className="h-24 w-auto object-contain"
            />
            <LanguageSwitcher />
          </div>

          <div className="relative z-10 w-full max-w-md mt-24">
            <div className="mb-3">
              <h1 className="mb-2 text-[35px] font-bold leading-[40px] tracking-[-0.9px] text-teal-600">
                {t("auth:login.title")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("auth:login.subtitle")}
              </p>
            </div>

            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("common:actions.backToHome")}</span>
              </Link>
            </div>

            <form className="login-form space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth:login.email")}
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth:signup.emailPlaceholder")}
                    className="h-12 !bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 pl-11 dark:!bg-white [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#111827] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    data-form-type="other"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("auth:login.password")}
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth:signup.passwordPlaceholder")}
                    className="login-password-input h-12 !bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 pl-11 pr-11 dark:!bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="off"
                    data-form-type="other"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-teal-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={handleRememberChange}
                  className="data-[state=checked]:bg-[#0D9488]"
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-medium text-gray-700"
                >
                  {t("auth:login.rememberMe")}
                </Label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? t("auth:login.submitting") : t("auth:login.submit")}
              </Button>

              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-gray-500 hover:text-teal-600 underline-offset-4 hover:underline"
                  >
                    {t("auth:login.forgotPassword")}
                  </Link>
                  <div className="text-right">
                    <span className="text-gray-600 mr-1">
                      {t("auth:login.noAccount")}
                    </span>
                    <Link
                      to="/signup"
                      className="font-medium text-[#0D9488] hover:underline"
                    >
                      {t("auth:login.goToSignup")}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="uppercase tracking-[0.2em]">
                    {t("auth:signup.or")}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  {socialButtons.map((social) =>
                    social.alt === "Google" ? (
                      <div
                        key={social.alt}
                        className="relative flex h-[72px] w-[72px] sm:h-[84px] sm:w-[84px] min-w-[72px] min-h-[72px] items-center justify-center rounded-[22px] border border-gray-200 bg-white shadow-sm overflow-visible hover:bg-gray-50"
                        style={{ isolation: "isolate" }}
                      >
                        <img
                          src={googleIcon}
                          alt="Google"
                          className="pointer-events-none absolute inset-0 z-10 m-auto h-9 w-9 object-contain sm:h-11 sm:w-11"
                        />
                        {/* Trên production: thêm domain vào Google Cloud Console > Authorized JavaScript origins; server gửi Cross-Origin-Opener-Policy: same-origin-allow-popups */}
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
                      </div>
                    ) : (
                      <Button
                        key={social.alt}
                        type="button"
                        variant="outline"
                        className="flex h-[72px] w-[72px] sm:h-[84px] sm:w-[84px] items-center justify-center rounded-[22px] border border-gray-200 bg-white hover:bg-gray-50 shadow-sm p-1.5"
                      >
                        <img
                          src={social.src}
                          alt={social.alt}
                          className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
                        />
                      </Button>
                    )
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="relative w-[55%] h-[88vh] overflow-hidden rounded-bl-[32px] bg-gradient-to-br from-[#19D6C8] to-[#FF7B21]">
          <div className="absolute bottom-6 left-0 h-[548px] w-[677px] opacity-60">
            <div className="h-full w-full bg-gradient-to-t from-white/20 to-transparent blur-3xl" />
          </div>

          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2">
            <div className="h-full w-full rounded-full bg-white/5 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBody;
