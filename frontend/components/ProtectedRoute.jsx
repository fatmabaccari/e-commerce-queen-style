// components/ProtectedRoute.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin, isAuthenticated } from '@/lib/auth';

export default function ProtectedRoute({ 
  children, 
  adminOnly = false,
  clientOnly = false 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      // Vérifier l'authentification
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Vérifier les permissions
      if (adminOnly && !isAdmin()) {
        router.push('/client');
        return;
      }

      if (clientOnly && isAdmin()) {
        // Si admin mais route client, rediriger vers dashboard
        // Ou laisser selon votre logique
        // router.push('/dashboard');
        // return;
      }

      setLoading(false);
    };

    checkAccess();
  }, [router, adminOnly, clientOnly]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return children;
}