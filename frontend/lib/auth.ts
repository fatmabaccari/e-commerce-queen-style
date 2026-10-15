import Cookies from 'js-cookie';
import { authAPI } from './api';

export const setAuthToken = (token: string) => {
  Cookies.set('adminToken', token, { expires: 7 }); // 7 days
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('adminToken');
};

export const removeAuthToken = () => {
  Cookies.remove('adminToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const signOut = async () => {
  try {
    await authAPI.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  } finally {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};


import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'authToken';

export interface JwtPayload {
  userId?: number;
  adminId?: number;
  role?: string;
  isAdmin?: boolean;
  exp?: number;
}

export const getUserInfo = (): JwtPayload | null => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch (err) {
    console.error('Erreur de décodage:', err);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur est admin
 */
export const isAdmin = (): boolean => {
  const userInfo = getUserInfo();
  return userInfo?.isAdmin === true;
};

/**
 * Récupère le rôle de l'utilisateur
 */
export const getUserRole = (): string => {
  const userInfo = getUserInfo();
  return userInfo?.role || 'user';
};


