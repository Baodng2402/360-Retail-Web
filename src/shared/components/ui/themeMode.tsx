import { useEffect } from "react";
import { useAppTheme } from "@/shared/store/themeStore";

const Switch = () => {
  const { darkMode, toggleDarkMode } = useAppTheme();

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
      <input
        type="checkbox"
        className="sr-only peer"
        checked={darkMode}
        onChange={toggleDarkMode}
      />

      <div
        className={`
        absolute inset-0 transition-colors duration-500 rounded-[30px]
        bg-[#28096b] peer-checked:bg-[#522ba7]
      `}
      ></div>

      <div
        className={`
        absolute content-[''] h-[1.4em] w-[1.4em] rounded-full left-[10%] bottom-[15%] 
        transition-all duration-500 bg-[#28096b]
        shadow-[inset_8px_-4px_0px_0px_#fff000]
        peer-checked:translate-x-full 
        peer-checked:shadow-[inset_15px_-4px_0px_15px_#fff000]
      `}
      ></div>
    </label>
  );
};

export default Switch;
