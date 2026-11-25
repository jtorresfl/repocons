// Tipos que reflejan los Request/Response de los controladores Spring Boot.

export interface ProductImage { id: number; url: string; order: number | null; }

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  collectionId: number | null;
  collectionName: string | null;
  name: string;
  stock: number;
  price: number;
  images: ProductImage[];
  status: boolean;
}

export interface ProductRequest {
  categoryId: number;
  collectionId: number | null;
  name: string;
  stock: number;
  price: number;
  createdBy: string;
  images: { url: string; order: number }[];
}

export type PublicationType = 'VENTA' | 'INTERCAMBIO';

export interface PublicationExchange {
  id: number;
  requestedName: string;
  description: string | null;
  quantity: number;
}

export interface Publication {
  id: number;
  username: string;
  idProduct: number;
  productName: string;
  categoryName: string;
  title: string;
  description: string | null;
  type: PublicationType;
  state: string;
  date: string;
  exchanges: PublicationExchange[];
  status: boolean;
}

export interface PublicationRequest {
  username: string;
  productId: number;
  title: string;
  description: string;
  type: PublicationType;
  state: string;
  createdBy: string;
  exchanges: { requestedName: string; description: string; quantity: number }[];
}

export interface Category { id: number; name: string; description: string | null; status: boolean; }
export interface CategoryRequest { name: string; description: string; createdBy: string; }

export interface Collection { id: number; idCategory: number; name: string; description: string | null; status: boolean; }
export interface CollectionRequest { idCategory: number; name: string; description: string; createdBy: string; }

export interface User { username: string; email: string; phone: string | null; enabled: boolean; }
export interface UserRequest { username: string; email: string; password: string; phone: string | null; }