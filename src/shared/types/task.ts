export interface Task {
  id: string;
  storeId: string;
  assigneeId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  description?: string | null;
  deadline?: string | null;
  createdAt?: string;
  isActive: boolean;
  assigneeName?: string;
  assigneePosition?: string;
}

export type TaskStatus = "Pending" | "InProgress" | "Completed" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High";

export interface CreateTaskDto {
  title: string;
  assigneeId: string;
  priority?: TaskPriority;
  description?: string;
  deadline?: string;
}

export interface UpdateTaskDto {
  title?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  description?: string;
  deadline?: string;
  isActive?: boolean;
}
