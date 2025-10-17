import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './route';

const API_BASE_URL = 'https://api.bitechx.com';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];       
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  category: {
    id: string;
    name: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
    description?: string | null;
  };
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
    getProducts: builder.query<Product[], { offset?: number; limit?: number; categoryId?: string }>({
      query: ({ offset = 0, limit = 12, categoryId }) => {
        let url = `/products?offset=${offset}&limit=${limit}`;
        if (categoryId) url += `&categoryId=${categoryId}`;
        return url;
      },
      providesTags: ['Product'],
    }),
    searchProducts: builder.query<Product[], { searchedText: string }>({
      query: ({ searchedText }) => `/products/search?searchedText=${searchedText}`,
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Partial<Product> & { categoryId: string }>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; data: Partial<Product> & { categoryId?: string } }>({
      query: ({ id, data }) => ({ url: `/products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
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
