'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Package, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/route';
import ThemeSwitch from './ThemeSwitch';
import { useRouter, usePathname } from 'next/navigation';
import { ModalConfirm } from '@/components/ModalConfirm'; 

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); 
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const userEmail = useSelector((state: RootState) => state.auth.userEmail);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLogoutConfirm = () => {
    setShowConfirm(false);
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border shadow-sm transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all hover:scale-105"
              onClick={() => router.push('/products')}
            >
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">BiTechX</h1>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={isActive('/products') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => router.push('/products')}
              >
                <Package className="h-4 w-4" />
                Products
              </Button>

              <Button
                variant={isActive('/categories') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => router.push('/categories')}
              >
                <FolderOpen className="h-4 w-4" />
                Categories
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {userEmail && (
              <span className="text-sm hidden lg:block text-muted-foreground truncate max-w-[200px]">
                {userEmail}
              </span>
            )}
            <ThemeSwitch />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ✅ Confirmation Modal */}
      <ModalConfirm
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleLogoutConfirm}
        title="Logout Confirmation"
        description="Are you sure you want to logout? You’ll be redirected to the login page."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
};
