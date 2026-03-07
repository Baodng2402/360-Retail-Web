import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";
import { AuthFormLayout } from "@/features/auth/components/AuthFormLayout";

const forgotSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email.").email("Email không hợp lệ."),
});

const ForgotPasswordRequestPage = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
      setError(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const message = await authApi.requestPasswordReset({ email });
      toast.success(
        message ||
          "Nếu email tồn tại, mã xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.",
      );
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      console.error("Forgot password error", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Không thể gửi mã đặt lại mật khẩu. Vui lòng thử lại sau.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFormLayout
      title="Quên mật khẩu"
      description="Nhập email tài khoản của bạn, chúng tôi sẽ gửi mã xác nhận 6 số để đặt lại mật khẩu."
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
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white text-gray-900 placeholder:text-gray-500 border-gray-200 pl-11"
              autoComplete="off"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? "ĐANG GỬI..." : "GỬI MÃ XÁC NHẬN"}
        </Button>

        <p className="text-xs text-gray-500">
          Để bảo mật, thông báo sẽ luôn hiển thị chung chung ngay cả khi email
          không tồn tại trong hệ thống.
        </p>
      </form>
    </AuthFormLayout>
  );
};

export default ForgotPasswordRequestPage;
