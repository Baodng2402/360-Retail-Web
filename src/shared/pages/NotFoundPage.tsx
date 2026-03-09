import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-lg font-semibold">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
        </p>
        <div className="mt-5">
          <Button asChild className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

