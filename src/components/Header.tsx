'use client';

import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Package, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/route';
import ThemeSwitch from './ThemeSwitch';
import { useRouter, usePathname } from 'next/navigation';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const userEmail = useSelector((state: RootState) => state.auth.userEmail);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header
      className="border-b backdrop-blur sticky top-0 z-50 shadow-sm transition-colors"

    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all hover:scale-105"
            onClick={() => router.push('/products')}
          >
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-bold" >
              BiTechX
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={isActive('/products') ? 'accent' : 'ghost'}
              size="sm"
              onClick={() => router.push('/products')}
              className="transition-all"
            >
              <Package className="h-4 w-4"  />
              Products
            </Button>
            <Button
              variant={isActive('/categories') ? 'accent' : 'ghost'}
              size="sm"
              onClick={() => router.push('/categories')}
              className="transition-all"
            >
              <FolderOpen className="h-4 w-4" />
              Categories
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="text-sm hidden lg:block">
              {userEmail}
            </span>
          )}
          <ThemeSwitch />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
