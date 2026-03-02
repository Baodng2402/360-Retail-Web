import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Lock, Mail } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";

const resetSchema = z
  .object({
    email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
    code: z
      .string()
      .min(6, "Mã xác nhận gồm 6 số.")
      .max(6, "Mã xác nhận gồm 6 số."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới phải từ 8 ký tự trở lên."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

const ForgotPasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
      setError(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const message = await authApi.resetPassword({
        email,
        code,
        newPassword,
      });
      toast.success(message || "Mật khẩu đã được đặt lại thành công.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      console.error("Reset password error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã xác nhận.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white text-gray-900">
      <div className="mx-auto flex w-full max-w-[1920px]">
        <div className="relative flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 md:px-16">
          <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-[rgba(13,148,136,0.18)] to-[rgba(13,148,136,0)] blur-3xl" />

          <div className="absolute left-4 top-6 sm:left-10 sm:top-8 z-20 flex items-center gap-3">
            <img
              src={logo}
              alt="360 Retail"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </div>

          <div className="relative z-10 w-full max-w-md mt-20">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </button>

            <div className="mb-4 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-teal-600">
                Đặt lại mật khẩu
              </h1>
              <p className="text-sm text-gray-600">
                Nhập mã 6 số được gửi tới email và thiết lập mật khẩu mới cho tài
                khoản của bạn.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-11"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Mã xác nhận (6 số)</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="h-11 pl-11 tracking-[0.3em]"
                    placeholder="••••••"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 pl-11"
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="off"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? "ĐANG XỬ LÝ..." : "ĐẶT LẠI MẬT KHẨU"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordResetPage;

