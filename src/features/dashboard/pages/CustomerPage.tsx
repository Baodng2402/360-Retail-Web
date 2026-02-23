import { Users, Construction } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { motion } from "motion/react";

const CustomerPage = () => {
  return (
    <div className="space-y-6">
      <StoreSelector pageDescription="Chuyển đổi để xem khách hàng của cửa hàng khác" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-12 md:p-16 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Quản lý Khách hàng
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Tính năng quản lý khách hàng đang được hoàn thiện. Bạn vui lòng quay lại sau để xem danh sách khách hàng, lịch sử mua hàng và gửi tin nhắn.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium">
              <Construction className="w-4 h-4" />
              Đang hoàn thiện
            </div>
            <p className="text-sm text-muted-foreground mt-6 max-w-sm mx-auto">
              Trong lúc chờ, bạn có thể tiếp tục bán hàng bình thường tại trang <strong>Bán hàng</strong>. Khi tính năng sẵn sàng, bạn sẽ có thể lưu thông tin khách và theo dõi lịch sử mua hàng.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerPage;
