import { salesApi } from "./axios-instances";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/shared/types/categories";
import type { ApiResponse } from "@/shared/types/api-response";

export const categoriesApi = {
  async getCategories(storeId?: string, includeInactive?: boolean): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append("storeId", storeId);
    if (includeInactive !== undefined) {
      queryParams.append("includeInactive", includeInactive.toString());
    }

    const url = `sales/Categories${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const res = await salesApi.get<ApiResponse<Category[]> | Category[]>(url);
    
    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const res = await salesApi.post<ApiResponse<Category> | Category>("sales/Categories", {
      categoryName: data.categoryName,
      parentId: data.parentId,
    });
    
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Category;
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const res = await salesApi.put<ApiResponse<Category> | Category>(`sales/Categories/${id}`, {
      id,
      categoryName: data.categoryName,
      parentId: data.parentId,
      isActive: data.isActive,
    });
    
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    await salesApi.delete(`sales/Categories/${id}`);
  },
};
