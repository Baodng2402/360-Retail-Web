import { hrApi } from "./axios-instances";
import type {
  Employee,
  UpdateEmployeeProfileDto,
  UpdateEmployeeByOwnerDto,
} from "@/shared/types/employee";
import type { ApiResponse } from "@/shared/types/api-response";

export const employeesApi = {
  async getMe(): Promise<Employee> {
    const res = await hrApi.get<ApiResponse<Employee> | Employee>(
      "hr/employees/me"
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Employee;
  },

  async updateMe(data: UpdateEmployeeProfileDto): Promise<Employee> {
    const res = await hrApi.put<ApiResponse<Employee> | Employee>(
      "hr/employees/me",
      data
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Employee;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await hrApi.post<
      ApiResponse<{ avatarUrl: string }> | { avatarUrl: string }
    >("hr/employees/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as { avatarUrl: string };
  },

  async getEmployees(includeInactive?: boolean): Promise<Employee[]> {
    const query = includeInactive !== undefined
      ? `?includeInactive=${includeInactive}`
      : "";
    const res = await hrApi.get<ApiResponse<Employee[]> | Employee[]>(
      `hr/employees${query}`
    );
    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) return res.data;
    return [];
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const res = await hrApi.get<ApiResponse<Employee> | Employee>(
      `hr/employees/${id}`
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Employee;
  },

  async updateEmployee(
    id: string,
    data: UpdateEmployeeByOwnerDto
  ): Promise<Employee> {
    const res = await hrApi.put<ApiResponse<Employee> | Employee>(
      `hr/employees/${id}`,
      data
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Employee;
  },
};
