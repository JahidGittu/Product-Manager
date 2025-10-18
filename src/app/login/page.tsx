// src/app/login/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import { loginUser } from '@/lib/apiClient';
import { loginSuccess } from '@/store/slices/authSlice';
import { RootState } from '@/store/route';

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      router.push('/products');
    }
  }, [token, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email); // type of response inferred from loginUser
      dispatch(loginSuccess({ token: response.token, email }));
      toast('🦄 Login successful!');
      router.push('/products');
    } catch (error) {
      // error typing safely
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-light/30 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md animate-scale-in">
        <div className="rounded-2xl shadow-lg p-8 border bg-accent-glow/80">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Package className="h-8 w-8" />
            <h1 className="text-2xl font-bold">BiTechX Products</h1>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-center">
            Sign in to continue
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1"
              />
            </div>

            <Button type="submit" variant="default" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-center mt-6">
            Enter your email to access the product management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
