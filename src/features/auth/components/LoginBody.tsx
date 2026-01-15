import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";

import logo from "@/assets/logo.png";
import facebookIcon from "@/assets/icon/facebook-icon.svg";
import appleIcon from "@/assets/icon/apple-icon.svg";
import googleIcon from "@/assets/icon/google-icon.svg";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { authApi } from "@/shared/lib/authApi";
import { useAuthStore } from "@/shared/store/authStore";

const socialButtons = [
  { src: facebookIcon, alt: "Facebook" },
  { src: appleIcon, alt: "Apple" },
  { src: googleIcon, alt: "Google" },
] as const;

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

const LoginBody = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

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
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
      setError(firstError);
      return;
    }

    try {
      setLoading(true);
      const loginRes = await authApi.login({ email, password });

      // Lưu tạm token để gọi /auth/me (axios interceptor sẽ tự gắn Bearer)
      localStorage.setItem("token", loginRes.accessToken);

      // Lấy thông tin user từ claims
      const user = await authApi.me();
      setAuth(user, loginRes.accessToken);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Đăng nhập thành công!");

      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      console.error("Login error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="mx-auto flex w-full max-w-[1920px]">
        <div className="relative flex w-[45%] flex-col items-center justify-center bg-white px-16 py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-[531.85px] w-[531.85px] -ml-[121.8px] -mt-[124.6px] rounded-full bg-gradient-to-br from-[rgba(13,148,136,0.18)] to-[rgba(13,148,136,0)] blur-[32px] rotate-[36.47deg]" />

          <div className="absolute left-16 top-10 z-20">
            <img
              src={logo}
              alt="360 Retail"
              className="h-24 w-auto object-contain"
            />
          </div>

          <div className="relative z-10 w-full max-w-md mt-24">
            <div className="mb-3">
              <h1 className="mb-2 text-[35px] font-bold leading-[40px] tracking-[-0.9px] text-teal-600">
                Sign In
              </h1>
              <p className="text-sm text-gray-600">Welcome 360 Retail</p>
            </div>

            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    className="h-12 bg-white border-gray-200 pl-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className="h-12 bg-white border-gray-200 pl-11 pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  Remember me
                </Label>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "ĐANG ĐĂNG NHẬP..." : "LOGIN"}
              </Button>

              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-teal-600 underline-offset-4 hover:underline"
                  >
                    Forgot password
                  </button>
                  <div className="text-right">
                    <span className="text-gray-600 mr-1">
                      Don&apos;t have an account?
                    </span>
                    <Link
                      to="/signup"
                      className="font-medium text-[#0D9488] hover:underline"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="uppercase tracking-[0.2em]">Or</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  {socialButtons.map((social) => (
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
                  ))}
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
