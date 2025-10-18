// src/lib/localProducts.ts
export interface LocalProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  categoryId: string;
  createdBy: string;
  slug: string;
}

const LOCAL_PRODUCTS_KEY = 'myProducts';

export const getLocalProducts = (): LocalProduct[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLocalProduct = (product: LocalProduct) => {
  const products = getLocalProducts();
  const existsIndex = products.findIndex((p) => p.id === product.id);
  if (existsIndex > -1) {
    products[existsIndex] = product; // update existing
  } else {
    products.push(product); // add new
  }
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

export const deleteLocalProduct = (id: string) => {
  const products = getLocalProducts().filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};
