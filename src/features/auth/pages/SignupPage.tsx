import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";

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
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white overflow-x-hidden">
      <div className="relative z-0 mt-4 w-[calc(100%-24px)] mx-3 min-h-[35vh] sm:min-h-[38vh] md:min-h-[48vh] rounded-[24px] bg-[linear-gradient(160deg,rgba(25,214,200,1)_0%,rgba(255,123,33,1)_100%)] pt-2 pb-16 sm:pb-14 md:pb-20 text-white shadow-md">
        <div className="flex w-full items-start justify-between px-4 sm:px-5">
          <img
            src={logo}
            alt="360 Retail"
            className="h-14 sm:h-16 md:h-20 w-auto object-contain"
          />

          <LanguageSwitcher />
        </div>

        <div className="mt-3 sm:mt-1 sm:-mt-4 md:-mt-8 flex flex-col items-center text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold leading-tight sm:leading-[40px] md:leading-[48px] tracking-[-0.9px]">
            {t("auth:signup.heroTitle")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            {t("auth:signup.heroSubtitle")}
          </p>
        </div>
      </div>

      <div className="relative z-50 signup-card-wrapper mb-16 flex w-full max-w-[1120px] justify-center px-4 sm:px-6 md:px-0">
        <div className="w-full max-w-[520px] rounded-[15px] bg-white shadow-xl">
          <div className="px-4 sm:px-6 md:px-7 pb-8 pt-6 sm:pt-7 md:pt-8">
            <div className="flex flex-col gap-5">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("common:actions.backToHome")}</span>
                </Link>
              </div>

              <div className="flex flex-col gap-6 sm:gap-[30px]">
                <h2 className="text-center text-lg font-extrabold leading-[25.2px] text-gray-700">
                  {t("auth:signup.socialTitle")}
                </h2>

                <div className="flex items-center justify-center gap-3 sm:gap-[15px]">
                  {socialButtons.map((social, index) =>
                    social.alt === "Google" ? (
                      <div
                        key={social.alt + index}
                        className="relative flex h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] min-h-[80px] min-w-[80px] items-center justify-center rounded-[24px] border border-gray-200 bg-white shadow-sm overflow-visible hover:bg-gray-50"
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
                      </div>
                    ) : (
                      <Button
                        key={social.alt + index}
                        variant="outline"
                        className="flex h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] items-center justify-center rounded-[24px] border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm p-1.5"
                      >
                        <img
                          src={social.src}
                          alt={social.alt}
                          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                        />
                      </Button>
                    )
                  )}
                </div>

                <div className="text-center text-lg font-bold leading-[25.2px] text-gray-400">
                  {t("auth:signup.or")}
                </div>
              </div>

              <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="name"
                      className="text-sm font-normal leading-[19.6px] text-gray-700"
                    >
                      {t("auth:signup.name")}
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("auth:signup.namePlaceholder")}
                      className="h-12 sm:h-[50px] rounded-[15px] border border-gray-200 bg-white px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-gray-700 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="password"
                      className="text-sm font-normal leading-[19.6px] text-gray-700"
                    >
                      {t("auth:signup.password")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth:signup.passwordPlaceholder")}
                        className="h-12 sm:h-[50px] rounded-[15px] border border-gray-200 bg-white pr-10 px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-gray-700 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="off"
                        data-form-type="other"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="email"
                      className="text-sm font-normal leading-[19.6px] text-gray-700"
                    >
                      {t("auth:signup.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth:signup.emailPlaceholder")}
                      className="h-12 sm:h-[50px] rounded-[15px] border border-gray-200 bg-white px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-gray-700 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-normal leading-[19.6px] text-gray-700"
                    >
                      {t("auth:signup.confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth:signup.confirmPasswordPlaceholder")}
                        className="h-12 sm:h-[50px] rounded-[15px] border border-gray-200 bg-white pr-10 px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-gray-700 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="off"
                        data-form-type="other"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                        aria-label={
                          showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 sm:h-[52px] rounded-xl bg-[linear-gradient(145deg,rgba(0,187,167,1)_0%,rgba(0,150,137,1)_100%)] px-4 py-3 text-xs sm:text-sm font-bold leading-[18px] tracking-[0.02em] text-white hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? t("auth:signup.submitting") : t("auth:signup.submit")}
                </Button>

                <p className="text-center text-xs font-normal leading-[18px] text-gray-400">
                  {t("auth:signup.alreadyHaveAccount")}{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#00bba7] hover:underline"
                  >
                    {t("auth:signup.goToLogin")}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
