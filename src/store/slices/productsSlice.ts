// src/store/slices/productSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  slug: string;
  categoryId: string;
}

interface ProductsState {
  products: ProductState[];
}

const initialState: ProductsState = { products: [] };

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductState[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<ProductState>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<ProductState>) => {
      const idx = state.products.findIndex(p => p.id === action.payload.id);
      if (idx >= 0) state.products[idx] = action.payload;
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
  },
});

export const { setProducts, addProduct, updateProduct, deleteProduct } = productsSlice.actions;
export default productsSlice.reducer;
