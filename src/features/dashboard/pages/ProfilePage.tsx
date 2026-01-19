import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent } from "@/shared/components/ui/tabs";

import { Mail, Phone } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { EditProfileForm } from "@/features/dashboard/components/EditProfileForm";

import { useAuthStore } from "@/shared/store/authStore";

export function ProfilePage() {
  const { user } = useAuthStore();

  // Show loading if user is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="p-6 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-background border-teal-200 dark:border-teal-900">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
              <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
              <AvatarFallback className="bg-teal-400 text-white text-2xl">
                {user?.name?.[0] || "U"}
                {user?.name?.[1] || ""}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">
                {user?.name || "Guest User"}
              </h2>
              <Badge className="bg-teal-400 text-white">
                {user?.role || "User"}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user?.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{user?.phone || "No phone"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="personal" className="space-y-4">
        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Personal Information / Thông tin cá nhân
            </h3>
            <EditProfileForm user={user} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
