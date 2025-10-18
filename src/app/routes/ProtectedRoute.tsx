// src/app/ProtectedLayout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/route';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Simulate a small delay for auth check
    const timer = setTimeout(() => {
      if (!token) {
        router.push('/login'); // redirect if not logged in
      } else {
        setCheckingAuth(false); // allow children to render
      }
    }, 200); // 200ms delay for smooth UX
    return () => clearTimeout(timer);
  }, [token, router]);

  // Show loader while checking auth or redirecting
  if (checkingAuth || !token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    );
  }

  return <>{children}</>;
}
