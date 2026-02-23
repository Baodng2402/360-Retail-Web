import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import { Store, Bell, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { storesApi } from "@/shared/lib/storesApi";
import { authApi } from "@/shared/lib/authApi";
const SettingPage = () => {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState(false);

  const NOTIFICATION_KEY = "360retail-notification-settings";

  const loadNotificationsFromStorage = () => {
    try {
      const s = localStorage.getItem(NOTIFICATION_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        return {
          emailNotifications: parsed.emailNotifications ?? true,
          lowStockAlerts: parsed.lowStockAlerts ?? true,
          autoCheckIn: parsed.autoCheckIn ?? true,
          orderNotifications: parsed.orderNotifications ?? true,
          customerFeedbackAlerts: parsed.customerFeedbackAlerts ?? false,
          dailySalesSummary: parsed.dailySalesSummary ?? true,
          weeklyReport: parsed.weeklyReport ?? false,
        };
      }
    } catch {
    }
    return {
      emailNotifications: true,
      lowStockAlerts: true,
      autoCheckIn: true,
      orderNotifications: true,
      customerFeedbackAlerts: false,
      dailySalesSummary: true,
      weeklyReport: false,
    };
  };

  const [activeTab, setActiveTab] = useState("store");
  const [notifications, setNotifications] = useState(loadNotificationsFromStorage);

  const updateNotification = (key: string, value: boolean) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      setStoreLoading(true);
      try {
        const store = await storesApi.getMyStore();
        setStoreId(store.id);
        setStoreName(store.storeName || "");
        setStoreAddress(store.address || "");
        setStorePhone(store.phone || "");
      } catch (err) {
        console.error("Failed to load store:", err);
        toast.error("Không thể tải thông tin cửa hàng");
      } finally {
        setStoreLoading(false);
      }
    };
    loadStore();
  }, []);

  const handleSaveStore = async () => {
    if (!storeId) return;
    setStoreSaving(true);
    try {
      await storesApi.updateStore(storeId, {
        storeName,
        address: storeAddress || undefined,
        phone: storePhone || undefined,
        isActive: true,
      });
      toast.success("Đã lưu thông tin cửa hàng!");
    } catch (err) {
      console.error("Failed to save store:", err);
      toast.error("Không thể lưu thông tin cửa hàng");
    } finally {
      setStoreSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải từ 8 ký tự trở lên");
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error("Không thể đổi mật khẩu. Kiểm tra mật khẩu hiện tại.");
    } finally {
      setPasswordSaving(false);
    }
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
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground"
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
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground"
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
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" />
              Security / Bảo mật
            </button>
          </nav>
        </Card>

        <Card className="p-6 lg:col-span-2">
          {activeTab === "store" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Store className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold">
                  Store Information / Thông tin cửa hàng
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Lưu thông tin cửa hàng xuống máy chủ khi bạn nhấn <strong>Lưu thay đổi</strong>.
              </p>

              {storeLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Đang tải...
                </div>
              ) : (
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

                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Phone / Số điện thoại</Label>
                    <Input
                      id="store-phone"
                      placeholder="0901234567"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Bell className="h-5 w-5 text-teal-600" />
                      <h4 className="font-semibold text-lg">
                        Notification Preferences / Tùy chọn thông báo
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lưu ý: Cài đặt thông báo sẽ được lưu trên thiết bị (chưa đồng bộ backend).
                    </p>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium cursor-pointer">
                          Low Stock Alerts
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Cảnh báo tồn kho thấp
                        </p>
                      </div>
                      <Switch
                        checked={notifications.lowStockAlerts}
                        onCheckedChange={(v) => updateNotification("lowStockAlerts", v)}
                        className="data-[state=checked]:bg-teal-600"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium cursor-pointer">
                          Order Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Thông báo đơn hàng mới
                        </p>
                      </div>
                      <Switch
                        checked={notifications.orderNotifications}
                        onCheckedChange={(v) => updateNotification("orderNotifications", v)}
                        className="data-[state=checked]:bg-teal-600"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium cursor-pointer">
                          Daily Sales Summary
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Báo cáo doanh số hàng ngày
                        </p>
                      </div>
                      <Switch
                        checked={notifications.dailySalesSummary}
                        onCheckedChange={(v) => updateNotification("dailySalesSummary", v)}
                        className="data-[state=checked]:bg-teal-600"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button
                      className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
                      onClick={handleSaveStore}
                      disabled={storeSaving}
                    >
                      {storeSaving ? "Đang lưu..." : "Save Changes / Lưu thay đổi"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold">
                  Notification Preferences / Tùy chọn thông báo
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
                Cài đặt thông báo được lưu trên thiết bị của bạn. Tính năng đồng bộ lên máy chủ sẽ được cập nhật sau.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo qua email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(v) => updateNotification("emailNotifications", v)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Cảnh báo tồn kho thấp</p>
                  </div>
                  <Switch
                    checked={notifications.lowStockAlerts}
                    onCheckedChange={(v) => updateNotification("lowStockAlerts", v)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Thông báo đơn hàng mới</p>
                  </div>
                  <Switch
                    checked={notifications.orderNotifications}
                    onCheckedChange={(v) => updateNotification("orderNotifications", v)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Customer Feedback Alerts</Label>
                    <p className="text-sm text-muted-foreground">Cảnh báo phản hồi tiêu cực</p>
                  </div>
                  <Switch
                    checked={notifications.customerFeedbackAlerts}
                    onCheckedChange={(v) => updateNotification("customerFeedbackAlerts", v)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Auto Check-in Reminder</Label>
                    <p className="text-sm text-muted-foreground">Nhắc nhở chấm công hàng ngày</p>
                  </div>
                  <Switch
                    checked={notifications.autoCheckIn}
                    onCheckedChange={(v) => updateNotification("autoCheckIn", v)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">Báo cáo hiệu suất hàng tuần</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(v) => updateNotification("weeklyReport", v)}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold">Security / Bảo mật</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Đổi mật khẩu được lưu vào hệ thống. Sau khi đổi thành công, bạn cần đăng nhập lại.
              </p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
                >
                  {passwordSaving ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SettingPage;
