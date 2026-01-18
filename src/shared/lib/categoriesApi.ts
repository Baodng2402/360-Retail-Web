import { salesApi } from "./axios-instances";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/shared/types/categories";
import type { ApiResponse } from "@/shared/types/api-response";

export const categoriesApi = {
  async getCategories(storeId?: string): Promise<Category[]> {
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append("storeId", storeId);

    const url = `sales/Categories${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    console.log("[categoriesApi.getCategories] Request URL:", url);
    console.log("[categoriesApi.getCategories] storeId:", storeId);

    const res = await salesApi.get<ApiResponse<Category[]> | Category[]>(url);
    
    console.log("[categoriesApi.getCategories] Raw response:", res.data);
    console.log("[categoriesApi.getCategories] Response type check:", {
      hasSuccess: "success" in res.data,
      success: "success" in res.data ? (res.data as any).success : undefined,
      hasData: "success" in res.data ? "data" in (res.data as any) : undefined,
      isArray: Array.isArray(res.data),
    });
    
    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      console.log("[categoriesApi.getCategories] Returning data.data:", res.data.data);
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      console.log("[categoriesApi.getCategories] Returning res.data as array:", res.data);
      return res.data;
    }
    console.log("[categoriesApi.getCategories] Returning empty array");
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
