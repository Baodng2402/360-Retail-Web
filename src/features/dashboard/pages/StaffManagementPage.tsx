import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";
import { Users, CalendarCheck, ListChecks, BadgeAlert } from "lucide-react";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import type { StatItem } from "@/features/dashboard/components/DashboardStats";
import DataTable, { type Staff } from "@/shared/components/ui/table-standard-2";
import { SearchInput } from "@/shared/components/ui/input-search";
import { useState, useMemo } from "react";

const BUTTON_GRADIENT =
  "from-teal-500 to-teal-600 bg-gradient-to-r hover:from-teal-600 hover:to-teal-700 text-white shadow-sm transition-all";

const MOCK_STAFF_DATA: Staff[] = [
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    name: "John Doe",
    role: "Manager",
    email: "john.doe@example.com",
    phone: "+84 123 456 789",
    checkin: new Date(2026, 0, 16, 8, 30),
    task: "Review monthly reports",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    name: "Jane Smith",
    role: "Sales Staff",
    email: "jane.smith@example.com",
    phone: "+84 987 654 321",
    checkin: new Date(2026, 0, 16, 9, 0),
    task: "Customer support",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    name: "Mike Johnson",
    role: "Warehouse Staff",
    email: "mike.j@example.com",
    phone: "+84 555 123 456",
    checkin: new Date(2026, 0, 16, 8, 45),
    task: "Inventory check",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    name: "Sarah Williams",
    role: "Sales Staff",
    email: "sarah.w@example.com",
    phone: "+84 444 789 012",
    checkin: new Date(2026, 0, 16, 9, 15),
    task: "Process orders",
  },
  {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    name: "Tom Brown",
    role: "Warehouse Staff",
    email: "tom.brown@example.com",
    phone: "+84 333 456 789",
    checkin: null,
    task: "Prepare shipments",
  },
];

const MOCK_STATS: StatItem[] = [
  {
    label: "Total Staff",
    subLabel: "Tổng nhân viên",
    value: 12,
    icon: Users,
    color: "bg-teal-50 text-teal-600",
  },
  {
    label: "Checked In Today",
    subLabel: "Đã điểm danh",
    value: 4,
    icon: CalendarCheck,
    change: "+2 hôm nay",
    trend: "up",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Active Task",
    subLabel: "Công việc",
    value: 12,
    icon: ListChecks,
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "Not Checked In",
    subLabel: "Chưa điểm danh",
    value: 1,
    icon: BadgeAlert,
    trend: "down",
    color: "bg-red-50 text-red-600",
  },
];

const StaffManagement = () => {
  const [query, setQuery] = useState("");

  const filteredStaff = useMemo(() => {
    if (!query.trim()) return MOCK_STAFF_DATA;

    const searchTerm = query.toLowerCase().trim();
    return MOCK_STAFF_DATA.filter((staff) => {
      return (
        staff.name.toLowerCase().includes(searchTerm) ||
        staff.email.toLowerCase().includes(searchTerm)
      );
    });
  }, [query]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          variant="outline"
          className="border-teal-600 text-teal-600 hover:bg-teal-50"
        >
          Create Task / Tạo công việc
        </Button>
        <Button className={BUTTON_GRADIENT}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add staff / Thêm nhân viên
        </Button>
      </div>

      <DashboardStats stats={MOCK_STATS} />
      <div className="border pb-10 px-5 rounded-2xl">
        <div className="flex items-center justify-between pt-5">
          <span className="text-md font-bold">
            Staff List / Danh sách nhân viên
          </span>
          <div className="relative ml-auto w-64">
            <SearchInput
              placeholder="Search staff / Tìm kiếm..."
              wrapperClassName="w-64 ml-auto"
              className="from-gray-50 to-gray-100 bg-gradient-to-r"
              value={query}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex justify-center pt-10 min-w-full">
          <DataTable data={filteredStaff} />
        </div>
      </div>
    </div>
  );
};
export default StaffManagement;
