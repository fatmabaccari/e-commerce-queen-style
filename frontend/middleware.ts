/*import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp?: number;
  role?: string;
}

export function middleware(req: NextRequest) {
  console.log('🔥 MIDDLEWARE ACTIF →', req.nextUrl.pathname);

  if (!req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('adminToken')?.value;
  console.log('🍪 Token:', token ? 'OUI' : 'NON');

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);

    if (!payload.exp || payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/client', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};*/
// middleware.js - MODIFIÉ
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req: NextRequest) {
  console.log('🚀 Middleware exécuté pour:', req.nextUrl.pathname);
  
  const token = req.cookies.get('authToken')?.value;
  const url = req.nextUrl.clone();

  // Routes publiques (pas besoin d'authentification)
  const publicPaths = ['/login', '/register', '/', '/about', '/contact'];
  const currentPath = req.nextUrl.pathname;

  // Si la route est publique, laisser passer
  if (publicPaths.some(path => currentPath.startsWith(path))) {
    console.log('✅ Route publique, accès autorisé');
    return NextResponse.next();
  }

  // Vérifier le token pour les routes protégées
  if (!token) {
    console.log('❌ Aucun token, redirection vers /login');
    url.pathname = '/login';
    url.searchParams.set('redirect', currentPath);
    return NextResponse.redirect(url);
  }

  try {
    // Décoder le JWT pour vérifier le rôle
    const decoded = jwtDecode<{ role?: string; isAdmin?: boolean }>(token);
    console.log('🔍 Token décodé:', decoded);

    const userRole = decoded.role || 'user';
    const isAdmin = decoded.isAdmin || false;

    // Règles d'accès :
    // 1. /dashboard → uniquement pour les admins
    if (currentPath.startsWith('/dashboard')) {
      if (!isAdmin) {
        console.log('❌ Accès refusé: /dashboard nécessite un rôle admin');
        url.pathname = '/client';
        return NextResponse.redirect(url);
      }
      console.log('✅ Admin autorisé pour /dashboard');
    }

    // 2. /client → accessible à tous (même non connectés)
    // Mais si connecté comme admin, rediriger vers dashboard?
    // À vous de décider :
    if (currentPath.startsWith('/client')) {
      console.log('✅ /client accessible à tous');
      // Option: si admin et sur /client, rediriger vers dashboard
      // if (isAdmin) {
      //   url.pathname = '/dashboard';
      //   return NextResponse.redirect(url);
      // }
    }

    return NextResponse.next();

  } catch (error) {
    console.error('🚨 Erreur de décodage JWT:', error);
    // Token invalide, rediriger vers login
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /favicon.ico, etc.
     */
    '/((?!api|_next|static|favicon.ico).*)',
  ],
};
