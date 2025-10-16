import { FolderOpen } from 'lucide-react';
import { Category } from '@/store/categoriesApi';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <div
      className="rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border group hover:scale-105 animate-fade-in"
    >
      {category.image ? (
        <div
          className="mb-4 rounded-lg overflow-hidden h-32 flex items-center justify-center"

        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          className="mb-4 rounded-lg h-32 flex items-center justify-center"

        >
          <FolderOpen className="h-12 w-12" />
        </div>
      )}

      <h3 className="text-lg font-semibold">
        {category.name}
      </h3>

      {category.createdAt && (
        <p className="text-xs mt-2">
          Created {new Date(category.createdAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
