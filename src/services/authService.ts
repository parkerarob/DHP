import * as admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';

const ALLOWED_DOMAINS = ['nhcs.net', 'student.nhcs.net'];

function isAllowedDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export class AuthService {
  /**
   * Sign in with Google SSO (stub)
   * @param idToken Google ID token from client
   */
  static async signInWithGoogle(idToken: string): Promise<admin.auth.UserRecord> {
    const client = new OAuth2Client();
    try {
      const ticket = await client.verifyIdToken({ idToken });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Invalid Google token payload');
      }
      const email = payload.email;
      if (!isAllowedDomain(email)) {
        throw new Error('Unauthorized domain');
      }
      try {
        return await admin.auth().getUserByEmail(email);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
          return await admin.auth().createUser({
            uid: payload.sub,
            email,
            displayName: payload.name,
            photoURL: payload.picture,
            emailVerified: payload.email_verified,
          });
        }
        throw err;
      }
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Unauthorized domain') {
        throw error;
      }
      throw new Error('Invalid Google ID token');
    }
  }

  /**
   * Sign in with Email/Password (stub)
   * @param email User email
   * @param password User password
   */
  static async signInWithEmail(email: string, password: string): Promise<admin.auth.UserRecord> {
    if (!isAllowedDomain(email)) {
      throw new Error('Unauthorized domain');
    }
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Firebase API key');
    }
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }
      const decoded = await admin.auth().verifyIdToken(data.idToken);
      return await admin.auth().getUser(decoded.uid);
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Authentication failed');
    }
  }

  /**
   * Verify Firebase ID token and return decoded token
   * @param idToken Firebase Auth ID token
   */
  static async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }

  /**
   * Sign out (stub)
   * @param uid User ID
   */
  static async signOut(uid: string): Promise<void> {
    await admin.auth().revokeRefreshTokens(uid);
  }
}
