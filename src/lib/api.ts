// src/lib/api.ts

const BASE_URL = "https://api.bitechx.com";

export const authAPI = async (email: string) => {
  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const productsAPI = {
  getAll: async (token: string) => {
    const res = await fetch(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  create: async (token: string, data: any) => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  update: async (token: string, id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  delete: async (token: string, id: string) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
