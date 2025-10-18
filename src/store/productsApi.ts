// src/store/productsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./route";

const API_BASE_URL = "https://api.bitechx.com";

// =====================
// Interfaces
// =====================
export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  category: Category;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  categoryId?: string;
}

// =====================
// Local Storage Helpers
// =====================
const DELETED_PRODUCTS_KEY = "deletedProducts_v1";

const getDeletedProducts = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DELETED_PRODUCTS_KEY) || "[]");
  } catch {
    return [];
  }
};

const addDeletedProduct = (id: string) => {
  try {
    const deleted = getDeletedProducts();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
    }
  } catch {}
};

// =====================
// API
// =====================
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    // ---------------------
    // Get all products
    // ---------------------
    getProducts: builder.query<
      { data: Product[]; total: number },
      {
        offset?: number;
        limit?: number;
        categoryId?: string;
        searchedText?: string;
      }
    >({
      query: ({ offset = 0, limit = 50, categoryId, searchedText }) => {
        let url = `/products?offset=${offset}&limit=${limit}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (searchedText) url += `&searchedText=${encodeURIComponent(searchedText)}`;
        return url;
      },
      transformResponse: (response: Product[], meta) => {
        const totalHeader = meta?.response?.headers.get("X-Total-Count");
        let total = totalHeader ? parseInt(totalHeader) : response.length;

        // ✅ ফিল্টার করা: Deleted Products বাদ দেওয়া
        const deleted = getDeletedProducts();
        const filtered = response.filter((p) => !deleted.includes(p.id));
        total = filtered.length;

        return { data: filtered, total };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    // ---------------------
    // Get single product by id or slug
    // ---------------------
    getProduct: builder.query<Product, { id?: string; slug?: string }>({
      query: ({ id, slug }) => {
        if (id) return `/products/${id}`;
        if (slug) return `/products/${slug}`;
        throw new Error("Must provide id or slug");
      },
      providesTags: (result, error, { id, slug }) => [
        { type: "Product", id: id || slug || "UNKNOWN" },
      ],
    }),

    // ---------------------
    // Create product
    // ---------------------
    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // ---------------------
    // Update product
    // ---------------------
    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductPayload }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // ---------------------
    // Delete product
    // ---------------------
    deleteProduct: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // ✅ Deleted Product ID লোকালস্টোরেজে সংরক্ষণ
          addDeletedProduct(id);

          // ✅ RTK Query cache update
          dispatch(
            productsApi.util.updateQueryData("getProducts", { offset: 0, limit: 1000 }, (draft) => {
              if (!draft?.data) return;
              draft.data = draft.data.filter((p) => p.id !== id);
              draft.total = draft.data.length;
            })
          );
        } catch (err) {
          console.error("Failed to delete product locally", err);
        }
      },
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

// =====================
// Hooks
// =====================
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
