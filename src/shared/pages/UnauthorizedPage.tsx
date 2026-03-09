import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">Bạn không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tài khoản của bạn không được cấp quyền để truy cập trang này.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
            <Link to="/">Về trang chủ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">Đăng nhập lại</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

