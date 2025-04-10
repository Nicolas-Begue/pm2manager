import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Variable d\'environnement JWT_SECRET manquante');
}

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  // Autoriser l'accès à la page de connexion
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/pm2/:path*'],
}; 