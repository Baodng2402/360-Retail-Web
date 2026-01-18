export interface Product {
  id: string;
  productName: string;
  barCode?: string | null;
  description?: string | null;
  price: number;
  costPrice?: number | null;
  stockQuantity: number;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string | null;
  isActive: boolean;
  hasVariants?: boolean;
  isInStock?: boolean;
  totalStock?: number;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  size?: string;
  color?: string;
  variantName?: string;
  priceOverride?: number;
  stockQuantity?: number;
}

export interface GetProductsParams {
  storeId?: string;
  keyword?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
}

export interface ProductsResponse {
  items: Product[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CreateProductDto {
  productName: string;
  categoryId: string;
  barCode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  isActive?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  imageFile?: File;
}

export interface UpdateProductDto {
  id: string;
  productName: string;
  barCode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  categoryId: string;
  isActive: boolean;
  imageFile?: File;
  variantsJson?: string;
}
