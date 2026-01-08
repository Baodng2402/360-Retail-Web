import { useEffect } from "react";
import { useAppTheme } from "@/zustand/store";

const Switch = () => {
  const { darkMode, toggleDarkMode } = useAppTheme();

  // Sync "dark" class to the html element for Tailwind
  useEffect(() => {
    const html = document.documentElement;

    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <label className="relative inline-block w-[3.5em] h-[2em] text-[17px] cursor-pointer">
      {/* Ẩn checkbox mặc định */}
      <input
        type="checkbox"
        className="sr-only peer"
        checked={darkMode}
        onChange={toggleDarkMode}
      />

      {/* Khung của Switch (Slider) */}
      <div
        className={`
        absolute inset-0 transition-colors duration-500 rounded-[30px]
        bg-[#28096b] peer-checked:bg-[#522ba7]
      `}
      ></div>

      {/* Nút gạt (Mặt trăng / Mặt trời) */}
      <div
        className={`
        absolute content-[''] h-[1.4em] w-[1.4em] rounded-full left-[10%] bottom-[15%] 
        transition-all duration-500 bg-[#28096b]
        /* Hiệu ứng Mặt Trăng (chưa check) */
        shadow-[inset_8px_-4px_0px_0px_#fff000]
        /* Hiệu ứng Mặt Trời (khi check) */
        peer-checked:translate-x-full 
        peer-checked:shadow-[inset_15px_-4px_0px_15px_#fff000]
      `}
      ></div>
    </label>
  );
};

export default Switch;
