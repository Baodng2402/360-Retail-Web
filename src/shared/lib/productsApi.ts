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
    const res = await salesApi.get<ApiResponse<ProductsResponse> | Product[]>(url);

    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      
      if (typeof data === "object" && "items" in data && Array.isArray(data.items)) {
        const paginatedData = data as ProductsResponse;
        return paginatedData.items;
      }
      
      if (Array.isArray(data)) {
        return data;
      }
    }
    
    if (Array.isArray(res.data)) {
      return res.data;
    }
    
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

    if (data.hasVariants !== undefined) {
      formData.append("HasVariants", data.hasVariants.toString());
    }
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

    if (data.hasVariants !== undefined) {
      formData.append("HasVariants", data.hasVariants.toString());
    }
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
