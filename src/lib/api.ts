// src/lib/api.ts
const BASE_URL = "https://api.bitechx.com";

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  createdBy: string;
  slug: string;
  [key: string]: unknown; // optional extra fields
}

export const authAPI = async (email: string): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(`Auth API error: ${res.statusText}`);
  }

  const data: AuthResponse = await res.json();
  return data;
};

export const productsAPI = {
  getAll: async (token: string): Promise<Product[]> => {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`GetAll Products API error: ${res.statusText}`);
    }

    const data: Product[] = await res.json();
    return data;
  },

  create: async (token: string, data: Omit<Product, "id" | "slug">): Promise<Product> => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Create Product API error: ${res.statusText}`);
    }

    const product: Product = await res.json();
    return product;
  },

  update: async (
    token: string,
    id: string,
    data: Partial<Omit<Product, "id" | "slug">>
  ): Promise<Product> => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Update Product API error: ${res.statusText}`);
    }

    const product: Product = await res.json();
    return product;
  },

  delete: async (token: string, id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Delete Product API error: ${res.statusText}`);
    }

    const result: { success: boolean; message?: string } = await res.json();
    return result;
  },
};
