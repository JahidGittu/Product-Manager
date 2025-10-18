'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, Package, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/route';
import ThemeSwitch from './ThemeSwitch';
import { useRouter, usePathname } from 'next/navigation';
import { ModalConfirm } from '@/components/ModalConfirm';
import clsx from 'clsx';

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const userEmail = useSelector((state: RootState) => state.auth.userEmail);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleLogoutConfirm = () => {
    setShowConfirm(false);
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  const MenuItems = (
    <>
      <Button
        variant={isActive('/products') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          router.push('/products');
          setSidebarOpen(false);
        }}
        className={clsx(
          "flex items-center gap-1 justify-start",
          !isActive('/products') && "hover:bg-accent/20 transition-colors rounded-md"
        )}
      >
        <Package className="h-4 w-4" />
        Products
      </Button>

      <Button
        variant={isActive('/my-products') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          router.push('/my-products');
          setSidebarOpen(false);
        }}
        className={clsx(
          "flex items-center gap-1 justify-start",
          !isActive('/my-products') && "hover:bg-accent/20 transition-colors rounded-md"
        )}
      >
        <Package className="h-4 w-4" />
        My Products
      </Button>
    </>
  );


  return (
    <>
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border shadow-sm transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-all hover:scale-105"
            onClick={() => router.push('/products')}
          >
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">BiTechX</h1>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center justify-center gap-2">
            {MenuItems}
          </nav>

          {/* Right Side */}
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

            {/* Mobile Hamburger */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-1"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/40 z-40 transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside
        className={clsx(
          'fixed top-0 left-0 w-64 h-full bg-card shadow-lg z-50 transform transition-transform duration-300 flex flex-col p-6',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Menu</h2>
          <Button variant="ghost" onClick={() => setSidebarOpen(false)}>
            <X />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {MenuItems}
        </div>
      </aside>

      {/* Confirmation Modal */}
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
