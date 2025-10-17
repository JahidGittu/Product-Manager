// src/components/ProductForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useGetAllCategoriesQuery } from '@/store/categoriesApi';
import { useCreateProductMutation, useUpdateProductMutation, useGetProductQuery } from '@/store/productsApi';
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
import { Loader2 } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

interface ProductFormProps {
  productId?: string;  
  productSlug?: string; 
}

interface FormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, productSlug }) => {
  const router = useRouter();
  const { data: categories } = useGetAllCategoriesQuery();
  const { data: productData } = useGetProductQuery(
    { id: productId, slug: productSlug },
    { skip: !productId && !productSlug }
  );

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const isEditing = !!(productId || productSlug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
  });

  // Populate form in edit mode
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        categoryId: productData.category?.id || '',
        imageUrl: productData.images[0] || '',
      });
    }
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      toast.error('Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      images: formData.imageUrl ? [formData.imageUrl] : [],
      categoryId: formData.categoryId,
    };

    try {
      if (isEditing && productData) {
        await updateProduct({ id: productData.id, data: payload }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await createProduct(payload).unwrap();
        toast.success('Product created successfully!');
      }
      router.push('/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 animate-slide-up">
      <Button variant="ghost" className="mb-6" onClick={() => router.push('/products')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">{isEditing ? 'Edit Product' : 'Create New Product'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update the product information below' : 'Fill in the details to add a new product'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

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
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin h-5 w-5" />}
                {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Product' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/products')} size="lg">
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
