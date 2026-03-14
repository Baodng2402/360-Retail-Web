import {
  MoreHorizontal,
  Mail,
  Phone,
  CalendarCheck,
  ListTodo,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { Task } from "@/shared/types/task";

export interface Staff {
  id: string;
  avatar: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  checkin: Date | null;
  task: string;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

interface StaffTableProps {
  data: Staff[];
  onViewStaff?: (staff: Staff) => void;
  onDeleteStaff?: (staff: Staff) => void;
  /** Map staff id -> list of tasks (for "View tasks" click). */
  tasksByStaffId?: Map<string, Task[]>;
  onViewTasks?: (staff: Staff, tasks: Task[]) => void;
}

export const StaffTable = ({
  data,
  onViewStaff,
  onDeleteStaff,
  tasksByStaffId,
  onViewTasks,
}: StaffTableProps) => {
  return (
    <div className="w-full rounded-md border bg-background shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Employee Details</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Current Task</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((staff) => (
          <TableRow key={staff.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage alt={staff.name} src={staff.avatar} />
                    <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{staff.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {staff.role}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {staff.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {staff.phone}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-muted-foreground shrink-0" />
                  {tasksByStaffId && onViewTasks && tasksByStaffId.get(staff.id)?.length ? (
                    <button
                      type="button"
                      onClick={() =>
                        onViewTasks(staff, tasksByStaffId.get(staff.id) ?? [])
                      }
                      className="text-sm text-left text-teal-600 hover:underline focus:outline-none focus:underline"
                    >
                      {staff.task}
                    </button>
                  ) : (
                    <span className="text-sm">{staff.task}</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {staff.checkin ? (
                  <Badge
                    variant="outline"
                    className="gap-1 text-green-600 border-green-200 bg-green-50"
                  >
                    <CalendarCheck className="h-3 w-3" />
                    {staff.checkin.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-white bg-red-600">
                    Not checked in
                  </Badge>
                )}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewStaff?.(staff)}>
                      View / Edit details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteStaff?.(staff)}
                    >
                      Delete staff
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffTable;
