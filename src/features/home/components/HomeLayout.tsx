import { Outlet } from "react-router-dom";
import { HomeNavbar } from "./HomeNavbar";
import { ChatbotWidget } from "@/shared/components/ui/ChatbotWidget";

export const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <HomeNavbar />
      <div className="safe-area-bottom">
        <Outlet />
      </div>
      <ChatbotWidget />
    </div>
  );
};

