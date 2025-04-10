import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!JWT_SECRET || !ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
  throw new Error('Variables d\'environnement manquantes pour l\'authentification');
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    const response = NextResponse.json(
      { message: 'Connexion réussie' },
      { status: 200 }
    );

    // Configuration sécurisée des cookies pour la production
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 heure
      path: '/',
      // Ajout de paramètres de sécurité supplémentaires
      ...(process.env.NODE_ENV === 'production' && {
        domain: new URL(process.env.NEXTAUTH_URL).hostname,
      })
    });

    return response;
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 