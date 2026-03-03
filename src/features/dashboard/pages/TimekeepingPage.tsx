import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { motion } from "motion/react";
import {
  AlertCircle,
  Camera,
  MapPin,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { timekeepingApi } from "@/shared/lib/timekeepingApi";
import { storesApi } from "@/shared/lib/storesApi";

const STORE_GPS_KEY_PREFIX = "360retail-store-gps-";

const TimekeepingPage = () => {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<
    Awaited<ReturnType<typeof timekeepingApi.getToday>> | null
  >(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [processingCheckOut, setProcessingCheckOut] = useState(false);
  const [storeLatitude, setStoreLatitude] = useState<number | null>(null);
  const [storeLongitude, setStoreLongitude] = useState<number | null>(null);
  const storePosition = useMemo<LatLngExpression | null>(() => {
    if (storeLatitude === null || storeLongitude === null) return null;
    return [storeLatitude, storeLongitude];
  }, [storeLatitude, storeLongitude]);

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
          setStoreLatitude(store.latitude);
          setStoreLongitude(store.longitude);
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
      toast.error("Không thể tải trạng thái chấm công hôm nay.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadToday();
  }, []);

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Trình duyệt không hỗ trợ định vị GPS."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Geolocation error", error);
          reject(
            new Error(
              "Không thể lấy vị trí hiện tại. Vui lòng bật GPS/Location cho trình duyệt.",
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

      let checkInImageUrl: string | undefined;
      if (selfieFile) {
        const uploaded = await timekeepingApi.uploadSelfie(selfieFile);
        checkInImageUrl = uploaded.imageUrl;
      }

      await timekeepingApi.checkIn({ locationGps, checkInImageUrl });
      toast.success("Check-in thành công!");
      void loadToday();
    } catch (err) {
      console.error("Check-in failed", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error
          ? err.message
          : "Không thể check-in. Vui lòng thử lại.");
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

      await timekeepingApi.checkOut({ locationGps });
      toast.success("Check-out thành công!");
      void loadToday();
    } catch (err) {
      console.error("Check-out failed", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error
          ? err.message
          : "Không thể check-out. Vui lòng thử lại.");
      toast.error(message);
    } finally {
      setProcessingCheckOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && !today ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang tải trạng thái chấm công...</span>
          </div>
        </div>
      ) : null}

      {today?.warning && (
        <Card className="border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-900">{today.warning}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
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
                Trạng thái hôm nay
              </h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Check-in:{" "}
                <span className="font-medium text-foreground">
                  {today?.hasCheckedIn ? "Đã check-in" : "Chưa check-in"}
                </span>
              </p>
              <p>
                Check-out:{" "}
                <span className="font-medium text-foreground">
                  {today?.hasCheckedOut ? "Đã check-out" : "Chưa check-out"}
                </span>
              </p>
              {today?.record && (
                <p>
                  Giờ check-in:{" "}
                  <span className="font-medium text-foreground">
                    {new Date(today.record.checkInTime).toLocaleString("vi-VN")}
                  </span>
                </p>
              )}
            </div>
          </Card>
        </motion.div>

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
                Bản đồ cửa hàng (OpenStreetMap)
              </div>
              <p className="text-sm text-muted-foreground">
                Vị trí cửa hàng được dùng để kiểm tra khoảng cách khi bạn chấm công
                bằng GPS. Bạn có thể cập nhật tọa độ trong phần Cài đặt cửa hàng.
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
                </MapContainer>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-6 text-sm text-muted-foreground">
                Chưa có tọa độ GPS cho cửa hàng. Vui lòng vào{" "}
                <span className="font-semibold">Dashboard &gt; Settings</span> và
                cập nhật mục <span className="font-semibold">GPS Location</span> để
                xem bản đồ tại đây và bật kiểm tra khoảng cách khi chấm công.
              </div>
            )}
          </Card>
        </motion.div>
      </div>

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
                Ảnh selfie chấm công
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Chọn ảnh khuôn mặt của bạn (JPEG/PNG/WebP, tối đa 5MB). Ảnh sẽ được gửi
              kèm khi check-in để đảm bảo đúng người, đúng ca làm.
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
                  alt="Selfie preview"
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
                Thao tác chấm công
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Hệ thống sẽ sử dụng vị trí GPS hiện tại của bạn. Vui lòng cho phép trình
              duyệt truy cập Location khi được hỏi.
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
    </div>
  );
};

export default TimekeepingPage;

