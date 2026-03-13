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
import { useTranslation } from "react-i18next";
import { storesApi } from "@/shared/lib/storesApi";
import { authApi } from "@/shared/lib/authApi";
import { loyaltyApi } from "@/shared/lib/loyaltyApi";
import { inventoryApi } from "@/shared/lib/inventoryApi";
import type { LoyaltyRule } from "@/shared/types/loyalty";
import { useAuthStore } from "@/shared/store/authStore";
import { useStoreStore } from "@/shared/store/storeStore";
import StoreSelector from "@/features/dashboard/components/StoreSelector";

const toRad = (value: number) => (value * Math.PI) / 180;
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

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
  const { t: tDashboard } = useTranslation("dashboard");
  const { currentStore } = useStoreStore();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeLatitude, setStoreLatitude] = useState<string>("");
  const [storeLongitude, setStoreLongitude] = useState<string>("");
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState(false);
  const { user } = useAuthStore();

  // Một số môi trường backend có thể trả role là string, array hoặc chuỗi gộp.
  const hasRole = (roleValue: unknown, target: string): boolean => {
    if (!roleValue) return false;
    if (Array.isArray(roleValue)) {
      return roleValue.some((r) => typeof r === "string" && r === target);
    }
    if (typeof roleValue === "string") {
      // Hỗ trợ cả "StoreOwner", "Manager" hoặc chuỗi gộp "StoreOwner,Manager"
      return roleValue
        .split(/[,\s]+/)
        .filter(Boolean)
        .includes(target);
    }
    return false;
  };

  const canEditStoreInfo =
    hasRole(user?.role as unknown, "StoreOwner") ||
    hasRole(user?.role as unknown, "Manager");
  const canManageLoyaltyRules =
    hasRole(user?.role as unknown, "StoreOwner") ||
    hasRole(user?.role as unknown, "Manager");

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
    !Number.isNaN(parsedLatitude) &&
    !Number.isNaN(parsedLongitude) &&
    !(parsedLatitude === 0 && parsedLongitude === 0);
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
      void 0;
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
        void 0;
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
  const [lowStockCheckSending, setLowStockCheckSending] = useState(false);

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
        toast.error(tDashboard("settingsPage.toasts.loadStoreFailed"));
      } finally {
        setStoreLoading(false);
      }
    };
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id]);
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
        toast.error(tDashboard("settingsPage.toasts.invalidLatitude"));
        return;
      }
      latitude = parsed;
    }

    if (storeLongitude.trim()) {
      const parsed = Number(storeLongitude.trim());
      if (Number.isNaN(parsed)) {
        toast.error(tDashboard("settingsPage.toasts.invalidLongitude"));
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
      toast.success(tDashboard("settingsPage.toasts.saveStoreSuccess"));
    } catch (err) {
      console.error("Failed to save store:", err);
      toast.error(tDashboard("settingsPage.toasts.saveStoreFailed"));
    } finally {
      setStoreSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(tDashboard("settingsPage.security.validation.passwordMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(tDashboard("settingsPage.security.validation.passwordMinLength", { min: 8 }));
      return;
    }
    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      toast.success(tDashboard("settingsPage.security.toasts.changePasswordSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error(tDashboard("settingsPage.security.toasts.changePasswordFailed"));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(tDashboard("settingsPage.toasts.browserNoGps"));
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
          toast.success(tDashboard("settingsPage.toasts.useCurrentLocationSuccess"));
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
                  {tDashboard("settingsPage.gpsDistanceWarning.title")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tDashboard("settingsPage.gpsDistanceWarning.description", {
                    distance: distanceText,
                  })}
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded border text-xs"
                    onClick={() => {
                      toast.dismiss(t.id);
                      toast(tDashboard("settingsPage.toasts.keepExistingCoords"));
                    }}
                  >
                    {tDashboard("settingsPage.gpsDistanceWarning.keepExisting")}
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-teal-600 text-xs text-white hover:bg-teal-700"
                    onClick={() => {
                      applyLocation();
                      toast.dismiss(t.id);
                    }}
                  >
                    {tDashboard("settingsPage.store.gps.useCurrentLocation")}
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
          tDashboard("settingsPage.toasts.useCurrentLocationFailed"),
        );
        setUsingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={tDashboard("settingsPage.storeSelectorHint")} />
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
              {tDashboard("settingsPage.tabs.store")}
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
              {tDashboard("settingsPage.tabs.notifications")}
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
              {tDashboard("settingsPage.tabs.loyalty")}
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
              {tDashboard("settingsPage.tabs.security")}
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
                          url={OSM_TILE_URL}
                          attribution={OSM_ATTRIBUTION}
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
                      {storeSaving
                        ? tDashboard("settingsPage.store.actions.saving")
                        : tDashboard("settingsPage.store.actions.saveChanges")}
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
                  {tDashboard("settingsPage.notifications.title")}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/50 rounded-lg">
                {tDashboard("settingsPage.notifications.description")}
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
                {canManageLoyaltyRules && (
                  <div className="mt-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          {tDashboard("settingsPage.notifications.lowStockEmail.title")}
                        </p>
                        <p className="text-xs text-amber-800">
                          {tDashboard("settingsPage.notifications.lowStockEmail.description")}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-amber-400 text-amber-800 hover:bg-amber-100"
                      disabled={lowStockCheckSending}
                      onClick={async () => {
                        try {
                          setLowStockCheckSending(true);
                          await inventoryApi.checkLowStock(5);
                          toast.success(
                            tDashboard("settingsPage.notifications.lowStockEmail.toasts.success"),
                          );
                        } catch (err) {
                          console.error("Failed to trigger low stock check:", err);
                          toast.error(
                            tDashboard("settingsPage.notifications.lowStockEmail.toasts.failed"),
                          );
                        } finally {
                          setLowStockCheckSending(false);
                        }
                      }}
                    >
                      {lowStockCheckSending && (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      )}
                      {tDashboard("settingsPage.notifications.lowStockEmail.action", { threshold: 5 })}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "loyalty" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold">
                  {tDashboard("settingsPage.loyalty.title")}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {tDashboard("settingsPage.loyalty.description")}
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {tDashboard("settingsPage.loyalty.note")}
                  </p>
                  {canManageLoyaltyRules && (
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
                            toast.error(tDashboard("settingsPage.loyalty.toasts.loadFailed"));
                          } finally {
                            setLoyaltyLoading(false);
                          }
                        }
                      }}
                    >
                      {tDashboard("settingsPage.loyalty.actions.addRule")}
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  {loyaltyLoading ? (
                    <div className="py-6 text-center text-muted-foreground text-sm">
                      {tDashboard("settingsPage.loyalty.states.loading")}
                    </div>
                  ) : loyaltyRules.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-sm border rounded-lg">
                      {canManageLoyaltyRules
                        ? tDashboard("settingsPage.loyalty.states.emptyManage")
                        : tDashboard("settingsPage.loyalty.states.emptyReadOnly")}
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
                                {tDashboard("settingsPage.loyalty.status.active")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                {tDashboard("settingsPage.loyalty.status.inactive")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {tDashboard("settingsPage.loyalty.ruleSummary", {
                              earningRate: rule.earningRate,
                              minSpend: rule.minSpend,
                            })}
                          </p>
                        </div>
                        {canManageLoyaltyRules && (
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
                              {tDashboard("settingsPage.loyalty.actions.edit")}
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
                                  toast.error(tDashboard("settingsPage.loyalty.toasts.toggleFailed"));
                                }
                              }}
                            >
                              {rule.status === 0
                                ? tDashboard("settingsPage.loyalty.actions.deactivate")
                                : tDashboard("settingsPage.loyalty.actions.activate")}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {canManageLoyaltyRules && (
                  <>
                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">
                        {editingRule
                          ? tDashboard("settingsPage.loyalty.form.editTitle")
                          : tDashboard("settingsPage.loyalty.form.createTitle")}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            {tDashboard("settingsPage.loyalty.form.nameLabel")}
                          </Label>
                          <Input
                            value={ruleForm.name}
                            onChange={(e) =>
                              setRuleForm((s) => ({ ...s, name: e.target.value }))
                            }
                            placeholder={tDashboard("settingsPage.loyalty.form.namePlaceholder")}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            {tDashboard("settingsPage.loyalty.form.earningRateLabel")}
                          </Label>
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
                          <Label className="text-xs">
                            {tDashboard("settingsPage.loyalty.form.minSpendLabel")}
                          </Label>
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
                          <Label className="text-xs">
                            {tDashboard("settingsPage.loyalty.form.statusLabel")}
                          </Label>
                          <div className="flex items-center gap-2 text-xs">
                            <Switch
                              checked={ruleForm.status === 0}
                              onCheckedChange={(v) =>
                                setRuleForm((s) => ({ ...s, status: v ? 0 : 1 }))
                              }
                              className="data-[state=checked]:bg-teal-600"
                            />
                            <span className="text-muted-foreground">
                              {ruleForm.status === 0
                                ? tDashboard("settingsPage.loyalty.status.active")
                                : tDashboard("settingsPage.loyalty.status.inactive")}
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
                          {tDashboard("settingsPage.loyalty.form.reset")}
                        </Button>
                        <Button
                          size="sm"
                          disabled={ruleSaving}
                          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                          onClick={async () => {
                            if (!ruleForm.name.trim()) {
                              toast.error(tDashboard("settingsPage.loyalty.toasts.nameRequired"));
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
                                toast.success(tDashboard("settingsPage.loyalty.toasts.updateSuccess"));
                              } else {
                                const created = await loyaltyApi.createRule(ruleForm);
                                setLoyaltyRules((prev) => [created, ...prev]);
                                toast.success(tDashboard("settingsPage.loyalty.toasts.createSuccess"));
                              }
                            } catch (err) {
                              console.error("Failed to save loyalty rule:", err);
                              toast.error(tDashboard("settingsPage.loyalty.toasts.saveFailed"));
                            } finally {
                              setRuleSaving(false);
                            }
                          }}
                        >
                          {ruleSaving
                            ? tDashboard("settingsPage.loyalty.form.saving")
                            : editingRule
                              ? tDashboard("settingsPage.loyalty.form.saveChanges")
                              : tDashboard("settingsPage.loyalty.form.create")}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold">
                  {tDashboard("settingsPage.security.title")}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {tDashboard("settingsPage.security.description")}
              </p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">
                    {tDashboard("settingsPage.security.fields.currentPasswordLabel")}
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={tDashboard(
                      "settingsPage.security.fields.currentPasswordPlaceholder",
                    )}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    {tDashboard("settingsPage.security.fields.newPasswordLabel")}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={tDashboard(
                      "settingsPage.security.fields.newPasswordPlaceholder",
                    )}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    {tDashboard("settingsPage.security.fields.confirmPasswordLabel")}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={tDashboard(
                      "settingsPage.security.fields.confirmPasswordPlaceholder",
                    )}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
                >
                  {passwordSaving
                    ? tDashboard("settingsPage.security.actions.processing")
                    : tDashboard("settingsPage.security.actions.changePassword")}
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
