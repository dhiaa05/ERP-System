'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Public routes that don't require authentication
    const publicRoutes = ['/login'];
    
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
    
    if (pathname === '/' && isAuthenticated) {
        router.push('/dashboard');
    } else if (pathname === '/' && !isAuthenticated) {
        router.push('/login');
    }
  }, [isAuthenticated, pathname, router, mounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return <>{children}</>;
}
