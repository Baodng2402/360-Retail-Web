import { useEffect, useState } from "react";
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

const TimekeepingPage = () => {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<
    Awaited<ReturnType<typeof timekeepingApi.getToday>> | null
  >(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [processingCheckIn, setProcessingCheckIn] = useState(false);
  const [processingCheckOut, setProcessingCheckOut] = useState(false);

  const loadToday = async () => {
    try {
      setLoading(true);
      const data = await timekeepingApi.getToday();
      setToday(data);
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.25)_0,_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.25)_0,_transparent_60%)]" />
            <div className="relative flex flex-col gap-2 mb-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-teal-700 shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                Bản đồ check-in (minh họa)
              </div>
              <p className="text-sm text-muted-foreground">
                Vị trí của bạn được lấy tự động từ GPS trình duyệt và so sánh với
                tọa độ cửa hàng để đảm bảo chấm công đúng vị trí.
              </p>
            </div>
            <div className="relative mt-2 h-40 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden border border-slate-800/70">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.6),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.6),transparent_55%)]" />
              <div className="relative h-full w-full">
                <div className="absolute inset-6 border border-white/10 rounded-2xl" />
                <motion.div
                  className="absolute left-1/4 top-1/3 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.4)]"
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="absolute left-1/4 top-[45%] -translate-x-1/2 text-[10px] text-emerald-100">
                  Cửa hàng
                </span>
                <motion.div
                  className="absolute right-1/4 bottom-1/3 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.4)]"
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
                <span className="absolute right-1/4 bottom-[45%] translate-x-1/2 text-[10px] text-sky-100">
                  Vị trí bạn
                </span>
              </div>
            </div>
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

