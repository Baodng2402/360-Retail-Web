import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

const DateTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getDayName = (day: number): string => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return days[day];
  };

  const formatDate = (): string => {
    const day = getDayName(currentTime.getDay());
    const date = currentTime.getDate().toString().padStart(2, "0");
    const month = (currentTime.getMonth() + 1).toString().padStart(2, "0");
    const year = currentTime.getFullYear();
    return `${day}, ${date}/${month}/${year}`;
  };

  const formatTime = (): string => {
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-teal-200">
      <Calendar className="w-5 h-5 text-teal-600" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium text-teal-900">
          {formatDate()}
        </span>
        <span className="text-xs sm:text-sm font-bold text-teal-600">
          {formatTime()}
        </span>
      </div>
    </div>
  );
};

export default DateTimeClock;
