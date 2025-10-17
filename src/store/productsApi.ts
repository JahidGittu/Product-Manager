// src/store/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './route';

const API_BASE_URL = 'https://api.bitechx.com';

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

// Request payloads
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

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    // Get all products with optional filters
    getProducts: builder.query<
      { data: Product[]; total: number },
      { offset?: number; limit?: number; categoryId?: string; searchedText?: string }
    >({
      query: ({ offset = 0, limit = 12, categoryId, searchedText }) => {
        let url = `/products?offset=${offset}&limit=${limit}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        if (searchedText) url += `&searchedText=${encodeURIComponent(searchedText)}`;
        return url;
      },
      transformResponse: (response: Product[], meta) => {
        const totalHeader = meta?.response?.headers.get('X-Total-Count');
        const total = totalHeader ? parseInt(totalHeader) : response.length;
        return { data: response, total };
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // Get single product by id or slug
    getProduct: builder.query<Product, { id?: string; slug?: string }>({
      query: ({ id, slug }) => {
        if (slug) return `/products/${slug}`;
        if (id) return `/products/${id}`;
        throw new Error('Must provide id or slug');
      },
      providesTags: (result, error, { id, slug }) => [{ type: 'Product', id: id || slug || 'UNKNOWN' }],
    }),

    // Create a new product
    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    // Update an existing product
    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductPayload }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    // Delete a product
    deleteProduct: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
