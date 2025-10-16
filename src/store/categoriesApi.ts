// src/store/categoriesApi.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './route';


const API_BASE_URL = 'https://interview-api-7c03b7d89c69.herokuapp.com/api';

export interface Category {
  id: string;
  name: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoriesResponse, { page?: number; search?: string; limit?: number }>({
      query: ({ page = 1, search = '', limit = 10 }) => ({
        url: '/categories',
        params: search ? { searchedText: search, offset: (page - 1) * limit, limit } : { offset: (page - 1) * limit, limit },
      }),
      providesTags: ['Category'],
    }),
    getAllCategories: builder.query<Category[], void>({
      query: () => '/categories',
      transformResponse: (response: CategoriesResponse) => response.data,
      providesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetAllCategoriesQuery,
} = categoriesApi;
