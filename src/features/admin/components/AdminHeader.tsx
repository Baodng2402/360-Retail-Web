import { useNavigate } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";

import { useAuthStore } from "@/shared/store/authStore";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import ThemeMode from "@/shared/components/ui/themeMode";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";

export function AdminHeader({
  onMobileMenuToggle,
  isMobileMenuOpen,
}: {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}) {
  const { t } = useTranslation("admin");
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = (user?.name || user?.email || "SA")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-background sticky top-0 z-40 h-[60px] sm:h-[73px] flex items-center">
      <div
        className="flex items-center justify-between w-full px-4 transition-all duration-300"
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/50 hover:bg-accent transition-all duration-200 active:scale-95"
            aria-label={isMobileMenuOpen ? t("header.closeMenu") : t("header.openMenu")}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </motion.div>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              {t("sidebar.brand.title")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="scale-75 origin-right">
            <ThemeMode />
          </div>
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 px-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.name ?? user?.email ?? t("header.userAlt")}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium max-w-[180px] truncate">
                  {user?.email ?? user?.name ?? t("sidebar.brand.title")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.name || t("sidebar.brand.title")}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t("header.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

