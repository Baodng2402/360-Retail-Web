import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";

import logo from "@/assets/logo.png";
import facebookIcon from "@/assets/icon/facebook-icon.svg";
import appleIcon from "@/assets/icon/apple-icon.svg";
import googleIcon from "@/assets/icon/google-icon.svg";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";

const signupSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên."),
    email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu.")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp.",
  });

const socialButtons = [
  { src: facebookIcon, alt: "Facebook" },
  { src: appleIcon, alt: "Apple" },
  { src: googleIcon, alt: "Google" },
] as const;

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      const firstError = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
      setError(firstError);
      return;
    }

    try {
      setLoading(true);
      await authApi.register({ email, password });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      console.error("Register error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
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

          <div />
        </div>

        <div className="mt-3 sm:mt-1 sm:-mt-4 md:-mt-8 flex flex-col items-center text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold leading-tight sm:leading-[40px] md:leading-[48px] tracking-[-0.9px]">
            Sign up
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            No tech expertise required. We promise.
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
                  <span>Back to Home</span>
                </Link>
              </div>

              <div className="flex flex-col gap-6 sm:gap-[30px]">
                <h2 className="text-center text-lg font-extrabold leading-[25.2px] text-graygray-700">
                  Sign in with
                </h2>

                <div className="flex items-center justify-center gap-3 sm:gap-[15px]">
                  {socialButtons.map((social, index) => (
                    <Button
                      key={social.alt + index}
                      variant="outline"
                      className="flex h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] items-center justify-center rounded-[24px] border border-graygray-200 bg-blackampwhitewhite hover:bg-gray-50 transition-all shadow-sm p-1.5"
                    >
                      <img
                        src={social.src}
                        alt={social.alt}
                        className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                      />
                    </Button>
                  ))}
                </div>

                <div className="text-center text-lg font-bold leading-[25.2px] text-graygray-400">
                  or
                </div>
              </div>

              <form className="flex flex-col gap-4 sm:gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="name"
                      className="text-sm font-normal leading-[19.6px] text-graygray-700"
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-white px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="password"
                      className="text-sm font-normal leading-[19.6px] text-graygray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-white pr-10 px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
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
                      className="text-sm font-normal leading-[19.6px] text-graygray-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-white px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-normal leading-[19.6px] text-graygray-700"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="h-12 sm:h-[50px] rounded-[15px] border border-graygray-200 bg-white pr-10 px-4 sm:px-5 text-sm font-normal leading-[19.6px] text-graygray-400 [&::-webkit-autofill]:!bg-white [&::-webkit-autofill]:![-webkit-text-fill-color:#333] [&::-webkit-autofill]:!transition-all [&::-webkit-autofill]:!duration-500000"
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
                  {loading ? "ĐANG ĐĂNG KÝ..." : "SIGN UP"}
                </Button>

                <p className="text-center text-xs font-normal leading-[18px] text-graygray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#00bba7] hover:underline"
                  >
                    Sign in
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
