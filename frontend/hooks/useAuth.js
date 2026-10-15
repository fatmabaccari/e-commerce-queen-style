// hooks/useAuth.js
'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken, signOut } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      
      if (!token) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const isTokenValid = decoded.exp > Date.now() / 1000;
        
        if (!isTokenValid) {
          signOut();
          return;
        }

        setUser({
          id: decoded.userId,
          role: decoded.role || 'user',
          isAdmin: decoded.isAdmin || false,
        });
        
        setIsAdmin(decoded.isAdmin || false);
      } catch (error) {
        console.error('Erreur de décodage token:', error);
        signOut();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Vérifier l'authentification périodiquement
    const interval = setInterval(checkAuth, 60000); // Toutes les minutes
    
    return () => clearInterval(interval);
  }, []);

  return { user, loading, isAdmin };
};