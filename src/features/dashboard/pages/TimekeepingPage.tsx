import { useEffect, useState } from "react";
import { AlertCircle, Camera, MapPin, CheckCircle2, Loader2 } from "lucide-react";
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

  if (loading && !today) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải trạng thái chấm công...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        Chấm công GPS & Selfie
      </h1>
      <p className="text-sm text-muted-foreground">
        Sử dụng vị trí hiện tại và ảnh selfie để check-in/check-out ca làm việc.
      </p>

      {today?.warning && (
        <Card className="border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-900">{today.warning}</p>
        </Card>
      )}

      <Card className="p-4 space-y-3">
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

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-semibold text-foreground">
            Ảnh selfie chấm công
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Chọn ảnh khuôn mặt của bạn (JPEG/PNG/WebP, tối đa 5MB). Ảnh sẽ được gửi
          kèm khi check-in.
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

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-semibold text-foreground">
            Thao tác chấm công
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Hệ thống sẽ sử dụng vị trí GPS hiện tại của bạn. Vui lòng cho phép trình
          duyệt truy cập Location.
        </p>
        <div className="flex flex-wrap gap-3">
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
            disabled={processingCheckOut || !today?.hasCheckedIn || today?.hasCheckedOut}
            variant="outline"
          >
            {processingCheckOut && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Check-out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TimekeepingPage;

