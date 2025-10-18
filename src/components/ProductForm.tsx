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

interface ProductFormProps {
  productSlug?: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  images: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({ productSlug }) => {
  const router = useRouter();
  const { data: categories } = useGetAllCategoriesQuery();

  const { data: productData, isFetching } = useGetProductQuery(
    { slug: productSlug },
    { skip: !productSlug }
  );

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const isEditing = !!productSlug;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    images: [''],
  });

  // Populate when editing
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price?.toString() || '',
        categoryId: productData.category?.id || '',
        images: productData.images?.length ? productData.images : [''],
      });
    }
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.categoryId
    ) {
      toast.error('⚠️ Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      images: formData.images.filter(Boolean),
      categoryId: formData.categoryId,
    };

    try {
      if (isEditing && productData) {
        await updateProduct({ id: productData.id, data: payload }).unwrap();
        toast.success('✅ Product updated successfully!');
      } else {
        await createProduct(payload).unwrap();
        toast.success('🎉 Product created successfully!');
      }
      router.push('/products');
    } catch (err: any) {
      toast.error(err?.data?.message || '❌ Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 animate-slide-up">
      {/* Back Button */}
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
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
                        // একাধিক ইনপুট থাকলে পুরো রিমুভ
                        newImages.splice(idx, 1);
                      } else {
                        // মাত্র ১টা থাকলে শুধু ভ্যালু ক্লিয়ার
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
                onClick={() =>
                  setFormData({ ...formData, images: [...formData.images, ''] })
                }
              >
                + Add Image
              </Button>

              {/* Preview */}
              {formData.images.some((img) => img) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.images.map(
                    (img, idx) =>
                      img && (
                        <img
                          key={idx}
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="h-24 w-auto rounded-md border object-cover"
                          onError={(e) =>
                            (e.currentTarget.style.display = 'none')
                          }
                        />
                      )
                  )}
                </div>
              )}
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

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/products')}
              >
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
