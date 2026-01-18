export interface Category {
  id: string;
  categoryName: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  categoryName: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  id: string;
  categoryName?: string;
  parentId?: string;
  isActive?: boolean;
}
