import { Outlet } from "react-router-dom";
import { HomeNavbar } from "./HomeNavbar";

export const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <HomeNavbar />
      <Outlet />
    </div>
  );
};

