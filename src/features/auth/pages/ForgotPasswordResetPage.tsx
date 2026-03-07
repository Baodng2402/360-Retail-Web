import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";

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
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
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
    <AuthFormLayout
      title="Đặt lại mật khẩu"
      description="Nhập mã 6 số được gửi tới email và thiết lập mật khẩu mới cho tài khoản của bạn."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
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
            Mã xác nhận (6 số)
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
            Mật khẩu mới
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 pl-11 pr-11 bg-white text-gray-900 border-gray-200 placeholder:text-gray-500"
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
              aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
            Xác nhận mật khẩu mới
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 pr-11 bg-white text-gray-900 border-gray-200 placeholder:text-gray-500"
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
          {submitting ? "ĐANG XỬ LÝ..." : "ĐẶT LẠI MẬT KHẨU"}
        </Button>
      </form>
    </AuthFormLayout>
  );
};

export default ForgotPasswordResetPage;
