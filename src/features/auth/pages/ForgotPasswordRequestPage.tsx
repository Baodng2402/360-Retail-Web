import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { authApi } from "@/shared/lib/authApi";

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
    <div className="flex min-h-screen w-full bg-white text-gray-900">
      <div className="mx-auto flex w-full max-w-[1920px]">
        <div className="relative flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 md:px-16">
          <div className="pointer-events-none absolute left-0 top-0 h-[360px] w-[360px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-[rgba(13,148,136,0.18)] to-[rgba(13,148,136,0)] blur-3xl" />

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
                Quên mật khẩu
              </h1>
              <p className="text-sm text-gray-600">
                Nhập email tài khoản của bạn, chúng tôi sẽ gửi mã xác nhận 6 số
                để đặt lại mật khẩu.
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
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-11"
                    autoComplete="off"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full bg-[#0D9488] text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#0D9488]/90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? "ĐANG GỬI..." : "GỬI MÃ XÁC NHẬN"}
              </Button>

              <p className="text-xs text-gray-500">
                Để bảo mật, thông báo sẽ luôn hiển thị chung chung ngay cả khi
                email không tồn tại trong hệ thống.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordRequestPage;

