"use client";

import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/shared/store/authStore";

export const title = "Profile Dropdown with Status";
const Example = () => {
  const { user, logout } = useAuthStore((state) => state);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-10 w-10 rounded-full" variant="ghost">
          <Avatar>
            <AvatarImage
              alt="@haydenbleasel"
              src="https://github.com/haydenbleasel.png"
            />
            <AvatarFallback>HB</AvatarFallback>
          </Avatar>
          <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                alt="@haydenbleasel"
                src="https://github.com/haydenbleasel.png"
              />
              <AvatarFallback>HB</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">
                {user?.name || "User Name"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "User Email"}
              </p>
              <Badge className="w-fit text-xs" variant="secondary">
                {user?.role?.replace(/([A-Z])/g, " $1").trim() || "Store Owner"}{" "}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default Example;
