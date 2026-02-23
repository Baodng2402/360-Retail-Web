import { hrApi } from "./axios-instances";
import type { Task, CreateTaskDto, UpdateTaskDto } from "@/shared/types/task";
import type { ApiResponse } from "@/shared/types/api-response";

export const tasksApi = {
  async createTask(data: CreateTaskDto): Promise<Task> {
    const res = await hrApi.post<ApiResponse<Task> | Task>("hr/tasks", data);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Task;
  },

  async getTasks(includeInactive?: boolean): Promise<Task[]> {
    const query =
      includeInactive !== undefined
        ? `?includeInactive=${includeInactive}`
        : "";
    const res = await hrApi.get<ApiResponse<Task[]> | Task[]>(
      `hr/tasks${query}`
    );
    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  async getMyTasks(includeInactive?: boolean): Promise<Task[]> {
    const query =
      includeInactive !== undefined
        ? `?includeInactive=${includeInactive}`
        : "";
    const res = await hrApi.get<ApiResponse<Task[]> | Task[]>(
      `hr/tasks/me${query}`
    );
    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  async getTaskById(id: string): Promise<Task> {
    const res = await hrApi.get<ApiResponse<Task> | Task>(`hr/tasks/${id}`);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Task;
  },

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const res = await hrApi.put<ApiResponse<Task> | Task>(
      `hr/tasks/${id}`,
      data
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Task;
  },

  async updateTaskStatus(id: string, status: string): Promise<Task> {
    const res = await hrApi.put<ApiResponse<Task> | Task>(
      `hr/tasks/${id}/status?status=${encodeURIComponent(status)}`
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Task;
  },

  async deleteTask(id: string): Promise<void> {
    await hrApi.delete(`hr/tasks/${id}`);
  },
};
