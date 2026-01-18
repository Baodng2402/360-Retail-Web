import { salesApi } from "./axios-instances";
import type {
  Product,
  GetProductsParams,
  CreateProductDto,
  UpdateProductDto,
  ProductsResponse,
} from "@/shared/types/products";
import type { ApiResponse } from "@/shared/types/api-response";

export const productsApi = {
  async getProducts(params?: GetProductsParams): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.storeId) queryParams.append("storeId", params.storeId);
    if (params?.keyword) queryParams.append("keyword", params.keyword);
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params?.includeInactive !== undefined) {
      queryParams.append("includeInactive", params.includeInactive.toString());
    }

    const url = `sales/Products?${queryParams.toString()}`;
    console.log("[productsApi] Request URL:", url);
    console.log("[productsApi] Request params:", params);
    console.log("[productsApi] Base URL:", salesApi.defaults.baseURL);

    const res = await salesApi.get<ApiResponse<ProductsResponse> | Product[]>(url);
    
    console.log("[productsApi] Full response:", res.data);

    // Case 1: Response có cấu trúc ApiResponse với ProductsResponse (phân trang)
    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      
      // Nếu data có cấu trúc ProductsResponse (có items, totalCount, pageNumber, ...)
      if (typeof data === "object" && "items" in data && Array.isArray(data.items)) {
        const paginatedData = data as ProductsResponse;
        console.log("[productsApi] Paginated response:", {
          totalCount: paginatedData.totalCount,
          pageNumber: paginatedData.pageNumber,
          pageSize: paginatedData.pageSize,
          totalPages: paginatedData.totalPages,
          itemsCount: paginatedData.items.length,
        });
        return paginatedData.items;
      }
      
      // Fallback: Nếu data là mảng Product[] trực tiếp (không có phân trang)
      if (Array.isArray(data)) {
        console.log("[productsApi] Response.data is array, length:", data.length);
        return data;
      }
    }
    
    // Case 2: Response trực tiếp là mảng Product[] (không có wrapper ApiResponse)
    if (Array.isArray(res.data)) {
      console.log("[productsApi] Response is direct array, length:", res.data.length);
      return res.data;
    }
    
    console.warn("[productsApi] Unexpected response format:", res.data);
    return [];
  },

  async getProductById(id: string, storeId?: string): Promise<Product> {
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append("storeId", storeId);

    const res = await salesApi.get<ApiResponse<Product> | Product>(
      `sales/Products/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Product;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const formData = new FormData();

    formData.append("ProductName", data.productName);
    formData.append("CategoryId", data.categoryId);
    formData.append("Price", data.price.toString());
    formData.append("StockQuantity", data.stockQuantity.toString());

    if (data.barCode) formData.append("BarCode", data.barCode);
    if (data.description) formData.append("Description", data.description);
    if (data.costPrice !== undefined) {
      formData.append("CostPrice", data.costPrice.toString());
    }
    if (data.variants && data.variants.length > 0) {
      formData.append("VariantsJson", JSON.stringify(data.variants));
    }
    if (data.imageFile) formData.append("ImageFile", data.imageFile);

    const res = await salesApi.post<ApiResponse<Product> | Product>("sales/Products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Product;
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const formData = new FormData();

    formData.append("Id", id);
    formData.append("ProductName", data.productName);
    formData.append("Price", data.price.toString());
    formData.append("StockQuantity", data.stockQuantity.toString());
    formData.append("CategoryId", data.categoryId);
    formData.append("IsActive", data.isActive.toString());

    if (data.barCode) formData.append("BarCode", data.barCode);
    if (data.description) formData.append("Description", data.description);
    if (data.costPrice !== undefined) {
      formData.append("CostPrice", data.costPrice.toString());
    }
    if (data.imageFile) formData.append("ImageFile", data.imageFile);
    if (data.variantsJson) formData.append("VariantsJson", data.variantsJson);

    const res = await salesApi.put<ApiResponse<Product> | Product>(`sales/Products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    await salesApi.delete(`sales/Products/${id}`);
  },
};
