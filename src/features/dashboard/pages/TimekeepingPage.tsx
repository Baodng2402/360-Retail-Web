import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  CircleMarker,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { motion } from "motion/react";
import {
  AlertCircle,
  Camera,
  MapPin,
  CheckCircle2,
  Loader2,
  BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  timekeepingApi,
  type TimekeepingHistoryRecord,
} from "@/shared/lib/timekeepingApi";
import { storesApi } from "@/shared/lib/storesApi";
import { useAuthStore } from "@/shared/store/authStore";
import { useStoreStore } from "@/shared/store/storeStore";
import StoreSelector from "@/features/dashboard/components/StoreSelector";
import { useTranslation } from "react-i18next";

const STORE_GPS_KEY_PREFIX = "360retail-store-gps-";

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

const TimekeepingPage = () => {
  const { t } = useTranslation("timekeeping");
  const { user } = useAuthStore();
  const { currentStore } = useStoreStore();
  const isStoreOwner = user?.role === "StoreOwner";
  const isManager = user?.role === "Manager";
  const isStaff = user?.role === "Staff";
  const canViewSummary = isStoreOwner || isManager;
  const canTimekeep = !isStoreOwner;

  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<
    Awaited<ReturnType<typeof timekeepingApi.getToday>> | null
  >(null);
  const [history, setHistory] = useState<TimekeepingHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [processingCheckOut, setProcessingCheckOut] = useState(false);
  const [storeLatitude, setStoreLatitude] = useState<number | null>(null);
  const [storeLongitude, setStoreLongitude] = useState<number | null>(null);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const storePosition = useMemo<LatLngExpression | null>(() => {
    if (storeLatitude === null || storeLongitude === null) return null;
    return [storeLatitude, storeLongitude];
  }, [storeLatitude, storeLongitude]);
  const userPosition = useMemo<LatLngExpression | null>(() => {
    if (userLatitude === null || userLongitude === null) return null;
    return [userLatitude, userLongitude];
  }, [userLatitude, userLongitude]);
  const distanceMeters = useMemo(() => {
    if (
      storeLatitude === null ||
      storeLongitude === null ||
      userLatitude === null ||
      userLongitude === null
    ) {
      return null;
    }
    return getDistanceMeters(
      storeLatitude,
      storeLongitude,
      userLatitude,
      userLongitude,
    );
  }, [storeLatitude, storeLongitude, userLatitude, userLongitude]);

  const FitBoundsToPositions = ({
    storePos,
    userPos,
    distance,
  }: {
    storePos: LatLngExpression;
    userPos: LatLngExpression;
    distance: number | null;
  }) => {
    const map = useMap();
    useEffect(() => {
      if (!distance || distance < 100) return;
      const bounds = L.latLngBounds(
        storePos as [number, number],
        userPos as [number, number],
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }, [storePos, userPos, distance, map]);
    return null;
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const records = await timekeepingApi.getHistory();
      setHistory(records);
    } catch (err) {
      console.error("Failed to load timekeeping history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadToday = async () => {
    try {
      setLoading(true);
      const [todayData, store] = await Promise.all([
        timekeepingApi.getToday(),
        storesApi.getMyStore().catch(() => null),
      ]);
      setToday(todayData);
      if (store) {
        const hasGpsFromApi =
          store.latitude !== undefined &&
          store.latitude !== null &&
          store.longitude !== undefined &&
          store.longitude !== null;

        if (hasGpsFromApi) {
          setStoreLatitude(store.latitude ?? null);
          setStoreLongitude(store.longitude ?? null);
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
              const lat = parsed.latitude ? Number(parsed.latitude) : null;
              const lon = parsed.longitude ? Number(parsed.longitude) : null;
              if (
                lat !== null &&
                !Number.isNaN(lat) &&
                lon !== null &&
                !Number.isNaN(lon)
              ) {
                setStoreLatitude(lat);
                setStoreLongitude(lon);
              } else {
                setStoreLatitude(null);
                setStoreLongitude(null);
              }
            } else {
              setStoreLatitude(null);
              setStoreLongitude(null);
            }
          } catch {
            setStoreLatitude(null);
            setStoreLongitude(null);
          }
        }
      } else {
        setStoreLatitude(null);
        setStoreLongitude(null);
      }
    } catch (err) {
      console.error("Failed to load timekeeping today:", err);
      toast.error(t("toasts.loadTodayFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Monthly summary state (Manager/StoreOwner)
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [photoModalRecord, setPhotoModalRecord] =
    useState<TimekeepingHistoryRecord | null>(null);

  const loadMonthlySummary = async (month?: number, year?: number) => {
    try {
      setSummaryLoading(true);
      const res = await timekeepingApi.getSummary({
        month: month ?? summaryMonth,
        year: year ?? summaryYear,
      });
      setMonthlySummary(res);
    } catch {
      setMonthlySummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    void getCurrentLocation().catch(() => {
      // ignore initial location error
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (canTimekeep) void loadToday();
    void loadHistory();
    if (canViewSummary) void loadMonthlySummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id, canViewSummary, canTimekeep]);

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t("toasts.gpsNotSupported")));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLatitude(latitude);
          setUserLongitude(longitude);
          resolve(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Geolocation error", error);
          reject(
            new Error(
              t("toasts.getLocationFailed"),
            ),
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
        },
      );
    });
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelfieFile(null);
      setSelfiePreview(null);
      return;
    }
    setSelfieFile(file);
    const url = URL.createObjectURL(file);
    setSelfiePreview(url);
  };

  const handleCheckIn = async () => {
    if (processingCheckIn) return;
    try {
      setProcessingCheckIn(true);
      const locationGps = await getCurrentLocation();
      const [latStr, lonStr] = locationGps.split(",");
      const currentLat = Number(latStr);
      const currentLon = Number(lonStr);
      if (
        storeLatitude !== null &&
        storeLongitude !== null &&
        !Number.isNaN(currentLat) &&
        !Number.isNaN(currentLon)
      ) {
        const distance = getDistanceMeters(
          storeLatitude,
          storeLongitude,
          currentLat,
          currentLon,
        );
        if (distance > 3000) {
          toast.error(
            t("toasts.tooFarForCheckIn"),
          );
          return;
        }
      }

      let checkInImageUrl: string | undefined;
      if (selfieFile) {
        const uploaded = await timekeepingApi.uploadSelfie(selfieFile);
        checkInImageUrl = uploaded.imageUrl;
      }

      await timekeepingApi.checkIn({ locationGps, checkInImageUrl });
      toast.success(t("toasts.checkInSuccess"));
      void loadToday();
      void loadHistory();
    } catch (err) {
      console.error("Check-in failed", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : t("toasts.checkInFailed"));
      toast.error(message);
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (processingCheckOut) return;
    try {
      setProcessingCheckOut(true);
      const locationGps = await getCurrentLocation();
      const [latStr, lonStr] = locationGps.split(",");
      const currentLat = Number(latStr);
      const currentLon = Number(lonStr);
      if (
        storeLatitude !== null &&
        storeLongitude !== null &&
        !Number.isNaN(currentLat) &&
        !Number.isNaN(currentLon)
      ) {
        const distance = getDistanceMeters(
          storeLatitude,
          storeLongitude,
          currentLat,
          currentLon,
        );
        if (distance > 3000) {
          toast.error(
            t("toasts.tooFarForCheckOut"),
          );
          return;
        }
      }

      await timekeepingApi.checkOut({ locationGps });
      toast.success(t("toasts.checkOutSuccess"));
      void loadToday();
      void loadHistory();
    } catch (err) {
      console.error("Check-out failed", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error ? err.message : t("toasts.checkOutFailed"));
      toast.error(message);
    } finally {
      setProcessingCheckOut(false);
    }
  };

  /** Filter history theo role khi BE trả storeRole: Staff (self+Staff), Manager (Staff+Manager), StoreOwner (all) */
  const filteredHistory = useMemo(() => {
    if (!history.length) return [];
    const role = user?.role as string;
    if (role === "StoreOwner") return history;
    const hasAnyStoreRole = history.some((r) => r.storeRole != null);
    if (!hasAnyStoreRole) return history;
    return history.filter((r) => {
      const recRole = r.storeRole;
      if (!recRole) return true;
      if (role === "Staff") {
        return r.employeeId === user?.id || recRole === "Staff";
      }
      if (role === "Manager") {
        return recRole === "Staff" || recRole === "Manager";
      }
      return true;
    });
  }, [history, user?.id, user?.role]);

  const historySummary = useMemo(() => {
    if (!filteredHistory.length) {
      return { days: 0, hours: 0, late: 0 };
    }
    const days = filteredHistory.length;
    let hours = 0;
    let late = 0;
    for (const r of filteredHistory) {
      if (typeof r.workHours === "number") {
        hours += r.workHours;
      }
      if (r.isLate) {
        late += 1;
      }
    }
    return { days, hours, late };
  }, [filteredHistory]);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    let d: Date;
    try {
      d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
    } catch {
      return value;
    }
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);
  };

  const formatTime = (value?: string | null) => {
    if (!value) return "-";
    let d: Date;
    try {
      d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
    } catch {
      return value;
    }
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);
  };

  const historySubtitle = isStoreOwner
    ? t("history.subtitleOwner", { defaultValue: "Tổng quan chấm công toàn bộ nhân viên trong cửa hàng." })
    : isManager
      ? t("history.subtitleManager", { defaultValue: "Lịch sử chấm công của Staff và Manager trong cửa hàng." })
      : t("history.subtitleStaff", { defaultValue: "Lịch sử chấm công của bạn và đồng nghiệp (Staff)." });

  return (
    <div className="space-y-6">
      <StoreSelector pageDescription={t("page.storeSelectorHint")} />
      {canTimekeep && loading && !today ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("states.loadingToday")}</span>
          </div>
        </div>
      ) : null}

      {canTimekeep && today?.warning && (
        <Card className="border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-900">{today.warning}</p>
        </Card>
      )}

      <div
        className={
          isStoreOwner ? "grid gap-6 lg:grid-cols-1" : "grid gap-6 lg:grid-cols-3"
        }
      >
        {!isStoreOwner && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-4 space-y-3 h-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("today.title")}
                </h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Check-in:{" "}
                  <span className="font-semibold text-teal-600">
                    {today?.hasCheckedIn ? t("today.checkedIn") : t("today.notCheckedIn")}
                  </span>
                  {today?.record?.checkInTime && (
                    <>
                      {" "}
                      <span className="text-xs text-muted-foreground">
                        ({formatDate(today.record.checkInTime)}{" "}
                        <span className="font-semibold text-teal-700">
                          {formatTime(today.record.checkInTime)}
                        </span>
                        )
                      </span>
                    </>
                  )}
                </p>
                <p>
                  Check-out:{" "}
                  <span className="font-semibold text-teal-600">
                    {today?.hasCheckedOut ? t("today.checkedOut") : t("today.notCheckedOut")}
                  </span>
                  {today?.record?.checkOutTime && (
                    <>
                      {" "}
                      <span className="text-xs text-muted-foreground">
                        ({formatDate(today.record.checkOutTime)}{" "}
                        <span className="font-semibold text-teal-700">
                          {formatTime(today.record.checkOutTime)}
                        </span>
                        )
                      </span>
                    </>
                  )}
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {!isStoreOwner && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="relative overflow-hidden p-4 h-full">
            <div className="relative flex flex-col gap-2 mb-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-teal-700 shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                  {t("map.title")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("map.subtitle")}
              </p>
            </div>
            {storePosition ? (
              <div className="relative mt-2 h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <MapContainer
                  center={storePosition}
                  zoom={17}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={storePosition} />
                  {!isStoreOwner && userPosition && (
                    <CircleMarker
                      center={userPosition}
                      radius={8}
                      pathOptions={{
                        color: "#0ea5e9",
                        fillColor: "#0ea5e9",
                        fillOpacity: 0.9,
                      }}
                    />
                  )}
                  {!isStoreOwner &&
                    userPosition &&
                    distanceMeters !== null && (
                      <FitBoundsToPositions
                        storePos={storePosition}
                        userPos={userPosition}
                        distance={distanceMeters}
                      />
                    )}
                </MapContainer>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-6 text-sm text-muted-foreground">
                {t("map.missingStoreGps")}
              </div>
            )}
            {distanceMeters !== null && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("map.distanceLabel")}{" "}
                <span className="font-medium text-foreground">
                  {distanceMeters < 1000
                    ? `${distanceMeters.toFixed(0)} m`
                    : `${(distanceMeters / 1000).toFixed(2)} km`}
                </span>
              </p>
            )}
          </Card>
        </motion.div>
        )}
      </div>

      {canTimekeep && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 space-y-4 h-full">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("selfie.title")}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("selfie.hint")}
              </p>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieChange}
                  className="text-sm"
                />
                {selfiePreview && (
                  <img
                    src={selfiePreview}
                    alt={t("selfie.title")}
                    className="h-16 w-16 rounded-md object-cover border"
                  />
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 space-y-3 h-full">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("actions.title")}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("actions.hint")}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  onClick={handleCheckIn}
                  disabled={processingCheckIn || today?.hasCheckedIn}
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                >
                  {processingCheckIn && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Check-in
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={
                    processingCheckOut || !today?.hasCheckedIn || today?.hasCheckedOut
                  }
                  variant="outline"
                >
                  {processingCheckOut && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Check-out
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("history.title")}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {historySubtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
              <div className="rounded-lg border px-3 py-1.5 bg-muted/60">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("history.daysWithData")}
                </span>
                <span className="font-semibold text-foreground">
                  {historySummary.days}
                </span>
              </div>
              <div className="rounded-lg border px-3 py-1.5 bg-muted/60">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("history.totalHours")}
                </span>
                <span className="font-semibold text-foreground">
                  {historySummary.hours.toFixed(1)}h
                </span>
              </div>
              <div className="rounded-lg border px-3 py-1.5 bg-muted/60">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t("history.lateCount")}
                </span>
                <span className="font-semibold text-foreground">
                  {historySummary.late}
                </span>
              </div>
            </div>
          </div>

          {historyLoading ? (
            <div className="py-6 text-sm text-muted-foreground">
              {t("history.loading")}
            </div>
          ) : !filteredHistory.length ? (
            <div className="py-6 text-sm text-muted-foreground">
              {t("history.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="text-left py-2 pr-3 font-medium">
                      {t("history.table.date")}
                    </th>
                    {(canViewSummary ||
                      filteredHistory.some((r) => r.employeeName)) && (
                      <th className="text-left py-2 px-3 font-medium">
                        {t("history.table.employee")}
                      </th>
                    )}
                    <th className="text-left py-2 px-3 font-medium">
                      Check-in
                    </th>
                    <th className="text-left py-2 px-3 font-medium">
                      Check-out
                    </th>
                    <th className="text-center py-2 px-3 font-medium">
                      {t("history.table.photo", {
                        defaultValue: "Ảnh check-in",
                      })}
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      {t("history.table.workHours")}
                    </th>
                    <th className="text-right py-2 pl-3 font-medium">
                      {t("history.table.late")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.slice(0, 30).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-0 text-foreground/90"
                    >
                      <td className="py-2 pr-3">
                        {formatDate(r.checkInTime || r.checkOutTime)}
                      </td>
                      {(canViewSummary ||
                        filteredHistory.some((x) => x.employeeName)) && (
                        <td className="py-2 px-3">
                          {r.employeeName ?? "—"}
                        </td>
                      )}
                      <td className="py-2 px-3">
                        {formatTime(r.checkInTime)}
                      </td>
                      <td className="py-2 px-3">
                        {formatTime(r.checkOutTime)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {r.checkInImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setPhotoModalRecord(r)}
                            className="inline-flex items-center gap-1 rounded border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] text-teal-700 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            {t("history.table.viewPhoto", {
                              defaultValue: "Xem ảnh",
                            })}
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {t("history.table.noPhoto", {
                              defaultValue: "—",
                            })}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {typeof r.workHours === "number"
                          ? `${r.workHours.toFixed(1)}h`
                          : "-"}
                      </td>
                      <td className="py-2 pl-3 text-right">
                        {r.isLate ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[11px]">
                            {t("history.table.late")}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {t("history.table.onTime")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modal xem ảnh check-in (Manager / StoreOwner / Staff xem ảnh của mình) */}
      <Dialog
        open={!!photoModalRecord}
        onOpenChange={(open) => !open && setPhotoModalRecord(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-teal-600" />
              {t("history.photoModal.title", {
                defaultValue: "Ảnh check-in",
              })}
            </DialogTitle>
          </DialogHeader>
          {photoModalRecord && (
            <div className="space-y-3">
              {canViewSummary && photoModalRecord.employeeName && (
                <p className="text-sm text-muted-foreground">
                  {t("history.photoModal.employee", {
                    defaultValue: "Nhân viên",
                  })}
                  :{" "}
                  <span className="font-medium text-foreground">
                    {photoModalRecord.employeeName}
                  </span>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("history.photoModal.time", {
                  defaultValue: "Thời gian",
                })}
                :{" "}
                <span className="font-medium text-foreground">
                  {formatDate(photoModalRecord.checkInTime)}{" "}
                  {formatTime(photoModalRecord.checkInTime)}
                </span>
              </p>
              {photoModalRecord.checkInImageUrl && (
                <div className="rounded-lg border bg-muted/30 overflow-hidden">
                  <img
                    src={photoModalRecord.checkInImageUrl}
                    alt="Check-in selfie"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Monthly Summary for Manager/StoreOwner */}
      {canViewSummary && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-foreground">
                  {t("monthly.title")}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs">{t("monthly.monthLabel")}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    className="w-16 h-8 text-xs"
                    value={summaryMonth}
                    onChange={(e) => setSummaryMonth(Number(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">{t("monthly.yearLabel")}</Label>
                  <Input
                    type="number"
                    min={2020}
                    max={2030}
                    className="w-20 h-8 text-xs"
                    value={summaryYear}
                    onChange={(e) => setSummaryYear(Number(e.target.value) || 2026)}
                  />
                </div>
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => void loadMonthlySummary(summaryMonth, summaryYear)}
                  disabled={summaryLoading}
                >
                  {summaryLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  {t("monthly.view")}
                </Button>
              </div>
            </div>
            {monthlySummary ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg border px-3 py-2 bg-muted/60">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t("monthly.summary.totalEmployees")}
                  </span>
                  <span className="font-semibold text-foreground">{monthlySummary.totalEmployees ?? "-"}</span>
                </div>
                <div className="rounded-lg border px-3 py-2 bg-muted/60">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t("monthly.summary.totalWorkDays")}
                  </span>
                  <span className="font-semibold text-foreground">{monthlySummary.totalWorkDays ?? "-"}</span>
                </div>
                <div className="rounded-lg border px-3 py-2 bg-muted/60">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t("monthly.summary.totalWorkHours")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {typeof monthlySummary.totalWorkHours === "number" ? `${monthlySummary.totalWorkHours.toFixed(1)}h` : "-"}
                  </span>
                </div>
                <div className="rounded-lg border px-3 py-2 bg-muted/60">
                  <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                    {t("monthly.summary.totalLateCount")}
                  </span>
                  <span className="font-semibold text-foreground">{monthlySummary.totalLateCount ?? "-"}</span>
                </div>
              </div>
            ) : summaryLoading ? (
              <div className="py-4 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("monthly.loading")}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">
                {t("monthly.hint")}
              </p>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TimekeepingPage;

