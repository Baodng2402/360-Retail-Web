import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Separator } from "@/shared/components/ui/separator";
import {
  Store,
  Bell,
  Shield,
  MapPin,
  Loader2,
  Star,
  Percent,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import toast from "react-hot-toast";
import { storesApi } from "@/shared/lib/storesApi";
import { authApi } from "@/shared/lib/authApi";
import { loyaltyApi } from "@/shared/lib/loyaltyApi";
import type { LoyaltyRule } from "@/shared/types/loyalty";
import { useAuthStore } from "@/shared/store/authStore";

const toRad = (value: number) => (value * Math.PI) / 180;

const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
};
const SettingPage = () => {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeLatitude, setStoreLatitude] = useState<string>("");
  const [storeLongitude, setStoreLongitude] = useState<string>("");
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState(false);
  const { user } = useAuthStore();
  const userRole = user?.role ?? "";
  const canEditStoreInfo =
    userRole === "StoreOwner" || userRole === "Manager";

  const NOTIFICATION_KEY = "360retail-notification-settings";
  const STORE_GPS_KEY_PREFIX = "360retail-store-gps-";
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<
    { displayName: string; lat: string; lon: string }[]
  >([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSearchEnabled, setAddressSearchEnabled] = useState(false);
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const parsedLatitude = Number(storeLatitude.trim());
  const parsedLongitude = Number(storeLongitude.trim());
  const hasValidCoords =
    !Number.isNaN(parsedLatitude) && !Number.isNaN(parsedLongitude);
  const currentPosition: LatLngExpression = hasValidCoords
    ? [parsedLatitude, parsedLongitude]
    : [21.0278, 105.8342]; // Hà Nội mặc định

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        if (!canEditStoreInfo) return;
        const { lat, lng } = e.latlng;
        setStoreLatitude(String(lat));
        setStoreLongitude(String(lng));
      },
    });
    return hasValidCoords ? <Marker position={currentPosition} /> : null;
  };

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

  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRule[]>([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    type: 0,
    earningRate: 1,
    minSpend: 10000,
    status: 0,
  });
  const [ruleSaving, setRuleSaving] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      setStoreLoading(true);
      try {
        const store = await storesApi.getMyStore();
        setStoreId(store.id);
        setStoreName(store.storeName || "");
        setStoreAddress(store.address || "");
        setStorePhone(store.phone || "");
        const hasGpsFromApi =
          store.latitude !== undefined &&
          store.latitude !== null &&
          store.longitude !== undefined &&
          store.longitude !== null;

        if (hasGpsFromApi) {
          setStoreLatitude(String(store.latitude));
          setStoreLongitude(String(store.longitude));
        } else {
          try {
            const cachedGps = localStorage.getItem(
              `${STORE_GPS_KEY_PREFIX}${store.id}`,
            );
            if (cachedGps) {
              const parsed = JSON.parse(cachedGps) as {
                latitude?: string;
                longitude?: string;
              };
              setStoreLatitude(parsed.latitude || "");
              setStoreLongitude(parsed.longitude || "");
            } else {
              setStoreLatitude("");
              setStoreLongitude("");
            }
          } catch {
            setStoreLatitude("");
            setStoreLongitude("");
          }
        }
      } catch (err) {
        console.error("Failed to load store:", err);
        toast.error("Không thể tải thông tin cửa hàng");
      } finally {
        setStoreLoading(false);
      }
    };
    loadStore();
  }, []);
  useEffect(() => {
    if (!addressSearchEnabled) {
      setAddressSuggestions([]);
      setAddressLoading(false);
      return;
    }

    if (!storeAddress.trim() || storeAddress.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setAddressLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=vn&q=${encodeURIComponent(
          storeAddress.trim(),
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          display_name: string;
          lat: string;
          lon: string;
        }[];
        setAddressSuggestions(
          data.map((item) => ({
            displayName: item.display_name,
            lat: item.lat,
            lon: item.lon,
          })),
        );
      } catch {
        // ignore
      } finally {
        setAddressLoading(false);
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [storeAddress, addressSearchEnabled]);

  const handleSaveStore = async () => {
    if (!storeId) return;

    let latitude: number | null | undefined = undefined;
    let longitude: number | null | undefined = undefined;

    if (storeLatitude.trim()) {
      const parsed = Number(storeLatitude.trim());
      if (Number.isNaN(parsed)) {
        toast.error("Latitude không hợp lệ");
        return;
      }
      latitude = parsed;
    }

    if (storeLongitude.trim()) {
      const parsed = Number(storeLongitude.trim());
      if (Number.isNaN(parsed)) {
        toast.error("Longitude không hợp lệ");
        return;
      }
      longitude = parsed;
    }

    setStoreSaving(true);
    try {
      await storesApi.updateStore(storeId, {
        storeName,
        address: storeAddress || undefined,
        phone: storePhone || undefined,
        isActive: true,
        latitude,
        longitude,
      });
      try {
        localStorage.setItem(
          `${STORE_GPS_KEY_PREFIX}${storeId}`,
          JSON.stringify({
            latitude: storeLatitude.trim(),
            longitude: storeLongitude.trim(),
          }),
        );
      } catch {
        // ignore
      }
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ GPS/location.");
      return;
    }
    const prevLat = Number(storeLatitude.trim());
    const prevLon = Number(storeLongitude.trim());
    const hasPrevCoords =
      !Number.isNaN(prevLat) && !Number.isNaN(prevLon) && storeAddress.trim();
    setUsingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const applyLocation = () => {
          setStoreLatitude(String(latitude));
          setStoreLongitude(String(longitude));
          setAddressSuggestions([]);
          setAddressSearchEnabled(false);
          addressInputRef.current?.blur();
          toast.success("Đã lấy tọa độ hiện tại cho cửa hàng.");
        };

        if (hasPrevCoords) {
          const distance = getDistanceMeters(
            prevLat,
            prevLon,
            latitude,
            longitude,
          );
          if (distance > 2000) {
            const distanceText =
              distance < 1000
                ? `${distance.toFixed(0)} m`
                : `${(distance / 1000).toFixed(1)} km`;
            toast.custom((t) => (
              <div className="max-w-sm rounded-md bg-background border shadow-lg p-3 text-sm">
                <p className="font-medium mb-1">
                  Vị trí hiện tại cách xa cửa hàng
                </p>
                <p className="text-xs text-muted-foreground">
                  Vị trí hiện tại của bạn đang cách vị trí cửa hàng khoảng{" "}
                  <span className="font-semibold">{distanceText}</span>. Bạn có
                  chắc muốn cập nhật GPS cửa hàng theo vị trí hiện tại?
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded border text-xs"
                    onClick={() => {
                      toast.dismiss(t.id);
                      toast("Đã giữ nguyên toạ độ cửa hàng.");
                    }}
                  >
                    Giữ nguyên
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-teal-600 text-xs text-white hover:bg-teal-700"
                    onClick={() => {
                      applyLocation();
                      toast.dismiss(t.id);
                    }}
                  >
                    Dùng vị trí hiện tại
                  </button>
                </div>
              </div>
            ));
            setUsingCurrentLocation(false);
            return;
          }
        }

        applyLocation();
        setUsingCurrentLocation(false);
      },
      () => {
        toast.error(
          "Không thể lấy vị trí hiện tại. Vui lòng bật Location cho trình duyệt.",
        );
        setUsingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
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
              onClick={() => setActiveTab("loyalty")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === "loyalty"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm"
                  : "hover:bg-teal-50 dark:hover:bg-teal-900/20 text-foreground"
              }`}
            >
              <Percent className="h-4 w-4" />
              Loyalty Rules / Tích điểm
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
                      disabled={!canEditStoreInfo}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-address">Address / Địa chỉ</Label>
                    <Input
                      id="store-address"
                      placeholder="Enter address..."
                      ref={addressInputRef}
                      value={storeAddress}
                      onChange={(e) => {
                        setAddressSearchEnabled(true);
                        setStoreAddress(e.target.value);
                      }}
                      disabled={!canEditStoreInfo}
                    />
                    {addressLoading && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Đang gợi ý địa chỉ...
                      </p>
                    )}
                    {addressSuggestions.length > 0 && (
                      <div className="mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover text-popover-foreground text-sm shadow-md">
                        {addressSuggestions.map((s) => (
                          <button
                            key={`${s.lat}-${s.lon}-${s.displayName}`}
                            type="button"
                            className="block w-full px-3 py-2 text-left hover:bg-muted"
                            onClick={() => {
                              setStoreAddress(s.displayName);
                              setStoreLatitude(s.lat);
                              setStoreLongitude(s.lon);
                              setAddressSuggestions([]);
                              setAddressSearchEnabled(false);
                              addressInputRef.current?.blur();
                            }}
                          >
                            {s.displayName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>GPS Location (map preview)</Label>
                    <p className="text-xs text-muted-foreground">
                      Bạn có thể bấm trực tiếp trên bản đồ để chọn tọa độ cho cửa hàng. Marker
                      sẽ tự động di chuyển và cập nhật Latitude/Longitude phía trên.
                    </p>
                    <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <MapContainer
                        center={currentPosition}
                        zoom={hasValidCoords ? 17 : 13}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationSelector />
                      </MapContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Phone / Số điện thoại</Label>
                    <Input
                      id="store-phone"
                      placeholder="0901234567"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      disabled={!canEditStoreInfo}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>GPS Location (tùy chọn)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={handleUseCurrentLocation}
                        disabled={usingCurrentLocation || !canEditStoreInfo}
                      >
                        {usingCurrentLocation ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Đang lấy vị trí...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3" />
                            Dùng vị trí hiện tại
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nếu bạn nhập tọa độ GPS, hệ thống sẽ dùng để kiểm tra khoảng cách khi
                      nhân viên chấm công.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="store-latitude" className="text-xs">
                          Latitude
                        </Label>
                        <Input
                          id="store-latitude"
                          placeholder="10.7769"
                          value={storeLatitude}
                          onChange={(e) => setStoreLatitude(e.target.value)}
                          disabled={!canEditStoreInfo}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="store-longitude" className="text-xs">
                          Longitude
                        </Label>
                        <Input
                          id="store-longitude"
                          placeholder="106.7009"
                          value={storeLongitude}
                          onChange={(e) => setStoreLongitude(e.target.value)}
                          disabled={!canEditStoreInfo}
                        />
                      </div>
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
                      disabled={storeSaving || !canEditStoreInfo}
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

          {activeTab === "loyalty" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold">
                  Loyalty Rules / Cấu hình tích điểm
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Thiết lập quy tắc tích điểm cho khách hàng. Mỗi quy tắc định nghĩa
                cách quy đổi doanh thu sang điểm thưởng.
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Các quy tắc sẽ được áp dụng theo thứ tự ưu tiên do backend quy định.
                  </p>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                    onClick={async () => {
                      setEditingRule(null);
                      setRuleForm({
                        name: "",
                        type: 0,
                        earningRate: 1,
                        minSpend: 10000,
                        status: 0,
                      });
                      if (!loyaltyRules.length) {
                        setLoyaltyLoading(true);
                        try {
                          const rules = await loyaltyApi.getRules();
                          setLoyaltyRules(rules);
                        } catch (err) {
                          console.error("Failed to load loyalty rules:", err);
                          toast.error("Không thể tải danh sách loyalty rules.");
                        } finally {
                          setLoyaltyLoading(false);
                        }
                      }
                    }}
                  >
                    Thêm quy tắc
                  </Button>
                </div>

                <div className="grid gap-4">
                  {loyaltyLoading ? (
                    <div className="py-6 text-center text-muted-foreground text-sm">
                      Đang tải loyalty rules...
                    </div>
                  ) : loyaltyRules.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-sm border rounded-lg">
                      Chưa có loyalty rule nào. Bạn có thể thêm quy tắc đầu tiên.
                    </div>
                  ) : (
                    loyaltyRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {rule.name}
                            </span>
                            {rule.status === 0 ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                Đang áp dụng
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                Tạm tắt
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Tích {rule.earningRate} điểm mỗi{" "}
                            {rule.minSpend.toLocaleString("vi-VN")}₫ chi tiêu.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRule(rule);
                              setRuleForm({
                                name: rule.name,
                                type: rule.type,
                                earningRate: rule.earningRate,
                                minSpend: rule.minSpend,
                                status: rule.status,
                              });
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={
                              rule.status === 0
                                ? "border-red-500 text-red-600 hover:bg-red-50"
                                : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            }
                            onClick={async () => {
                              const newStatus = rule.status === 0 ? 1 : 0;
                              try {
                                const updated = await loyaltyApi.updateRule(rule.id, {
                                  name: rule.name,
                                  type: rule.type,
                                  earningRate: rule.earningRate,
                                  minSpend: rule.minSpend,
                                  status: newStatus,
                                });
                                setLoyaltyRules((prev) =>
                                  prev.map((r) => (r.id === rule.id ? updated : r)),
                                );
                              } catch (err) {
                                console.error("Failed to toggle rule:", err);
                                toast.error("Không thể cập nhật trạng thái loyalty rule.");
                              }
                            }}
                          >
                            {rule.status === 0 ? "Tạm tắt" : "Kích hoạt"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">
                    {editingRule ? "Chỉnh sửa quy tắc" : "Tạo mới / cập nhật quy tắc"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tên quy tắc</Label>
                      <Input
                        value={ruleForm.name}
                        onChange={(e) =>
                          setRuleForm((s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder="Tích 1 điểm / 10,000đ"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tỷ lệ điểm (earningRate)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={ruleForm.earningRate}
                        onChange={(e) =>
                          setRuleForm((s) => ({
                            ...s,
                            earningRate: Number(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Mức chi tối thiểu (minSpend)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={ruleForm.minSpend}
                        onChange={(e) =>
                          setRuleForm((s) => ({
                            ...s,
                            minSpend: Number(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Trạng thái</Label>
                      <div className="flex items-center gap-2 text-xs">
                        <Switch
                          checked={ruleForm.status === 0}
                          onCheckedChange={(v) =>
                            setRuleForm((s) => ({ ...s, status: v ? 0 : 1 }))
                          }
                          className="data-[state=checked]:bg-teal-600"
                        />
                        <span className="text-muted-foreground">
                          {ruleForm.status === 0 ? "Đang áp dụng" : "Tạm tắt"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRule(null);
                        setRuleForm({
                          name: "",
                          type: 0,
                          earningRate: 1,
                          minSpend: 10000,
                          status: 0,
                        });
                      }}
                    >
                      Xóa form
                    </Button>
                    <Button
                      size="sm"
                      disabled={ruleSaving}
                      className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                      onClick={async () => {
                        if (!ruleForm.name.trim()) {
                          toast.error("Vui lòng nhập tên quy tắc.");
                          return;
                        }
                        try {
                          setRuleSaving(true);
                          if (editingRule) {
                            const updated = await loyaltyApi.updateRule(
                              editingRule.id,
                              ruleForm,
                            );
                            setLoyaltyRules((prev) =>
                              prev.map((r) =>
                                r.id === editingRule.id ? updated : r,
                              ),
                            );
                            toast.success("Đã cập nhật loyalty rule.");
                          } else {
                            const created = await loyaltyApi.createRule(ruleForm);
                            setLoyaltyRules((prev) => [created, ...prev]);
                            toast.success("Đã tạo loyalty rule mới.");
                          }
                        } catch (err) {
                          console.error("Failed to save loyalty rule:", err);
                          toast.error("Không thể lưu loyalty rule. Vui lòng thử lại.");
                        } finally {
                          setRuleSaving(false);
                        }
                      }}
                    >
                      {ruleSaving
                        ? "Đang lưu..."
                        : editingRule
                          ? "Lưu thay đổi"
                          : "Tạo quy tắc"}
                    </Button>
                  </div>
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
