import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import {
  Settings as SettingsIcon,
  Store,
  Bell,
  Shield,
  Palette,
  Database,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const SettingPage = () => {
  const [storeName, setStoreName] = useState("My Retail Store");
  const [storeAddress, setStoreAddress] = useState(
    "123 Main Street, District 1, HCMC"
  );
  const [storePhone, setStorePhone] = useState("0901234567");
  const [storeEmail, setStoreEmail] = useState("store@retail360.vn");

  const [activeTab, setActiveTab] = useState("store");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [customerFeedbackAlerts, setCustomerFeedbackAlerts] = useState(false);
  const [dailySalesSummary, setDailySalesSummary] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const handleSave = () => {
    console.log("Saving settings:", {
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      notifications: {
        emailNotifications,
        lowStockAlerts,
        autoCheckIn,
        orderNotifications,
        customerFeedbackAlerts,
        dailySalesSummary,
        weeklyReport,
      },
    });

    toast.success("Đã lưu cài đặt thành công!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 h-fit">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("store")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "store"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground dark:text-foreground"
              }`}
            >
              <Store className="h-4 w-4" />
              Store Info / Thông tin cửa hàng
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "notifications"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground dark:text-foreground"
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications / Thông báo
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "security"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground dark:text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Security / Bảo mật
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "appearance"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground dark:text-foreground"
              }`}
            >
              <Palette className="h-4 w-4" />
              Appearance / Giao diện
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "data"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground dark:text-foreground"
              }`}
            >
              <Database className="h-4 w-4" />
              Data & Backup / Dữ liệu
            </button>
          </nav>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Store className="h-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold">
              Store Information / Thông tin cửa hàng
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name / Tên cửa hàng</Label>
              <Input
                id="store-name"
                placeholder="Enter store name..."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-address">Address / Địa chỉ</Label>
              <Input
                id="store-address"
                placeholder="Enter address..."
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-phone">Phone / Số điện thoại</Label>
                <Input
                  id="store-phone"
                  placeholder="0901234567"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Email</Label>
                <Input
                  id="store-email"
                  type="email"
                  placeholder="store@example.com"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-teal-600" />
                <h4 className="font-semibold text-lg">
                  Notification Preferences / Tùy chọn thông báo
                </h4>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for important events / Nhận thông báo
                    qua email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Low Stock Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when products are low in stock / Cảnh báo tồn
                    kho thấp
                  </p>
                </div>
                <Switch
                  checked={lowStockAlerts}
                  onCheckedChange={setLowStockAlerts}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Order Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for new orders / Thông báo đơn hàng mới
                  </p>
                </div>
                <Switch
                  checked={orderNotifications}
                  onCheckedChange={setOrderNotifications}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Customer Feedback Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about negative feedback / Cảnh báo phản hồi
                    tiêu cực
                  </p>
                </div>
                <Switch
                  checked={customerFeedbackAlerts}
                  onCheckedChange={setCustomerFeedbackAlerts}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Auto Check-in Reminder
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remind staff to check in daily / Nhắc nhở chấm công hàng
                    ngày
                  </p>
                </div>
                <Switch
                  checked={autoCheckIn}
                  onCheckedChange={setAutoCheckIn}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Daily Sales Summary
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily sales report / Báo cáo doanh số hàng ngày
                  </p>
                </div>
                <Switch
                  checked={dailySalesSummary}
                  onCheckedChange={setDailySalesSummary}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium cursor-pointer">
                    Weekly Report
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance report / Báo cáo hiệu suất hàng
                    tuần
                  </p>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel / Hủy</Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
                onClick={handleSave}
              >
                Save Changes / Lưu thay đổi
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingPage;
