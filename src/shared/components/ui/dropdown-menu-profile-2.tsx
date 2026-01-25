"use client";

import { useState } from "react";
import { LogOut, Settings, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useAuthStore } from "@/shared/store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export const title = "Profile Dropdown with Status";

const DropdownMenuItemLink = ({
  to,
  children,
  onClick,
  className,
}: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) onClick();
    navigate(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      {children}
    </Link>
  );
};

const Example = () => {
  const { user, logout } = useAuthStore((state) => state);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative h-10 w-10 rounded-full"
          variant="ghost"
        >
          <Avatar>
            <AvatarImage alt={user?.name || "User"} src={user?.avatar || undefined} />
            <AvatarFallback className="bg-teal-400 text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {open && (
          <DropdownMenuContent
            align="end"
            className="w-64"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      alt={user?.name || "User"}
                      src={user?.avatar || undefined}
                    />
                    <AvatarFallback className="bg-teal-400 text-white">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user?.name || "User Name"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@email.com"}
                    </p>
                    <Badge className="w-fit text-xs bg-teal-400" variant="secondary">
                      {user?.role?.replace(/([A-Z])/g, " $1").trim() || "Store Owner"}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItemLink to="/dashboard/profile" className="gap-2" onClick={() => setOpen(false)}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItemLink>
              <DropdownMenuItemLink to="/dashboard" className="gap-2" onClick={() => setOpen(false)}>
                <Settings className="h-4 w-4" />
                Dashboard
              </DropdownMenuItemLink>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};
export default Example;
