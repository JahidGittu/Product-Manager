// src/store/categoriesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './route';

const API_BASE_URL = 'https://api.bitechx.com';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getAllCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Category' as const, id }))] : ['Category'],
    }),
  }),
});

export const { useGetAllCategoriesQuery } = categoriesApi;
