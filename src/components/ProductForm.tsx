'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetAllCategoriesQuery } from '@/store/categoriesApi';
import { useCreateProductMutation, useGetProductQuery, useUpdateProductMutation, Product } from '@/store/productsApi';
import { toast } from 'react-toastify';

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const { data: categories = [] } = useGetAllCategoriesQuery();
  const { data: productData } = useGetProductQuery(productId!, { skip: !productId });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form in edit mode
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        categoryId: productData.category?.id || '',
        imageUrl: productData.images?.[0] || '',
      });
    }
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, categoryId, imageUrl } = formData;
    const priceNumber = parseFloat(price);

    const payload: any = {
      name,
      description,
      price: priceNumber,
      categoryId,
      images: imageUrl ? [imageUrl] : [],
    };

    try {
      setIsSubmitting(true);
      if (isEditing && productId) {
        await updateProduct({ id: productId, data: payload }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(payload).unwrap();
        toast.success('Product created successfully');
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
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/products')}
      >
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
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      toast.error('Invalid image URL');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="animate-spin h-5 w-5" />}
                {isSubmitting
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                  ? 'Update Product'
                  : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/products')}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
