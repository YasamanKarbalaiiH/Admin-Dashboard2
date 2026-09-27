export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
};

export type ProductFormData = {
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
};
