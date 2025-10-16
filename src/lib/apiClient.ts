// src/lib/apiClient.ts

import axios from 'axios';

const API_BASE_URL = 'https://api.bitechx.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// loginUser function
export const loginUser = async (email: string) => {
  const response = await apiClient.post('/auth', { email });
  return response.data;
};
