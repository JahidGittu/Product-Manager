// src/components/ProductForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useGetAllCategoriesQuery } from '@/store/categoriesApi';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductQuery,
} from '@/store/productsApi';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import { Loader2, ArrowLeft, DeleteIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/route';
import { saveLocalProduct, LocalProduct } from '@/lib/localProducts';

interface ProductFormProps {
  productSlug?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  images: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ productSlug }) => {
  const router = useRouter();

  // categories + loading flag
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: categoriesError,
  } = useGetAllCategoriesQuery();

  // product (edit) + loading flag
  const { data: productData, isFetching: isFetchingProduct } = useGetProductQuery(
    { slug: productSlug as string },
    { skip: !productSlug }
  );

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const isEditing = !!productSlug;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // form state (without category)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    images: [''],
  });

  // category state separate (controlled)
  const [categoryId, setCategoryId] = useState<string>('');

  // flag to avoid overwriting user changes after initial populate
  const [initialized, setInitialized] = useState(false);

  // get current user email from Redux
  const userEmail = useSelector((state: RootState) => state.auth.userEmail);

  // Combined populate: when productData and categories are available, populate once.
  useEffect(() => {
    if (!productData) return;

    const initialForm: FormData = {
      name: productData.name ?? '',
      description: productData.description ?? '',
      price: productData.price != null ? String(productData.price) : '',
      images: productData.images && productData.images.length ? productData.images : [''],
    };

    setFormData(initialForm);

    if (!initialized) {
      if (categories && categories.length) {
        const found = categories.find((c) => c.id === productData.category?.id);
        setCategoryId(found ? found.id : productData.category?.id || '');
        setInitialized(true);
      } else {
        if (productData.category?.id) setCategoryId(productData.category.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData, categories]);

  useEffect(() => {
    if (!initialized && productData && categories && categories.length) {
      const found = categories.find((c) => c.id === productData.category?.id);
      if (found) setCategoryId(found.id);
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.price.trim() || !categoryId) {
      toast.error('⚠️ Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error('⚠️ Please enter a valid price greater than 0.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parsedPrice,
      images: formData.images.filter(Boolean),
      categoryId,
      createdBy: userEmail,
    };

    try {
      let createdProduct;
      if (isEditing && productData) {
        createdProduct = await updateProduct({ id: productData.id, data: payload }).unwrap();
        toast('🦄 Product updated successfully!');
      } else {
        createdProduct = await createProduct(payload).unwrap();
        toast('🎉 Product created successfully!');
      }

      // Save to local storage
      const localProduct: LocalProduct = {
        id: createdProduct.id,
        name: createdProduct.name,
        description: createdProduct.description,
        images: createdProduct.images,
        price: createdProduct.price,
        categoryId: createdProduct.category.id,
        createdBy: userEmail ?? 'me@gmail.com',
        slug: createdProduct.slug,
      };
      saveLocalProduct(localProduct);

      router.push('/products');
    } catch (err: unknown) {
      let message = '❌ Something went wrong.';

      if (err instanceof Error) {
        message = err.message; // Standard JS Error
      } else if (typeof err === 'object' && err !== null && 'data' in err) {
        message = (err as { data?: { message?: string } }).data?.message ?? message;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }

  };

  const showLoading = isFetchingProduct || isLoadingCategories;

  if (showLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (categoriesError) {
    return <p className="text-center text-red-500 mt-6">Failed to load categories.</p>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 animate-slide-up">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => router.push('/products')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {isEditing
              ? 'Update the product information below.'
              : 'Fill in the details to add a new product.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>

            {/* Price & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  key={`cat-select-${categories?.length ?? 0}-${categoryId}`}
                  value={categoryId}
                  onValueChange={(val) => {
                    setCategoryId(val);
                    setInitialized(true);
                  }}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    {categories && categories.length ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" />
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images</Label>
              {formData.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <Input
                    type="url"
                    value={img}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[idx] = e.target.value;
                      setFormData({ ...formData, images: newImages });
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newImages = [...formData.images];
                      if (formData.images.length > 1) {
                        newImages.splice(idx, 1);
                      } else {
                        newImages[idx] = '';
                      }
                      setFormData({ ...formData, images: newImages });
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
              >
                + Add Image
              </Button>

              {/* Live Preview */}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.images.map((img, idx) => {
                  if (!img) return null;
                  return (
                    <img
                      key={idx}
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="h-24 w-auto rounded-md border object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update Product' : 'Create Product'}</>
                )}
              </Button>

              <Button type="button" variant="outline" size="lg" onClick={() => router.push('/products')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
