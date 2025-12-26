import { useAppTheme } from "./zustand/store";

function App() {
  const darkMode = useAppTheme((state) => state.darkMode);
  const toggleDarkMode = useAppTheme((state) => state.toggleDarkMode);

  return (
    // Sử dụng dấu huyền `` để truyền biến vào class
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
    }`}>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Hello Tailwind + Zustand!</h1>
        <button 
          onClick={toggleDarkMode}
          className="mt-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {darkMode ? "Chế độ Sáng" : "Chế độ Tối"}
        </button>
      </div>
    </div>
  );
}

export default App;