import { AuthService } from '../src/services/authService';
import * as admin from 'firebase-admin';
import { OAuth2Client } from 'google-auth-library';
import fetch from 'node-fetch';

jest.mock('firebase-admin');
jest.mock('google-auth-library');
jest.mock('node-fetch', () => jest.fn());

const adminAuthMock = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  verifyIdToken: jest.fn(),
  getUser: jest.fn(),
};

(admin as any).auth = jest.fn(() => adminAuthMock);
(admin as any).initializeApp = jest.fn();
(admin as any).apps = [] as any;

const verifyIdTokenMock = jest.fn();
(OAuth2Client as any).mockImplementation(() => ({ verifyIdToken: verifyIdTokenMock }));

const fetchMock = fetch as unknown as jest.Mock;

describe('AuthService.signInWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns existing user', async () => {
    verifyIdTokenMock.mockResolvedValue({ getPayload: () => ({ email: 'a@test.com' }) });
    adminAuthMock.getUserByEmail.mockResolvedValue({ uid: 'uid1' });

    const user = await AuthService.signInWithGoogle('token');
    expect(user).toEqual({ uid: 'uid1' });
    expect(adminAuthMock.getUserByEmail).toHaveBeenCalledWith('a@test.com');
    expect(adminAuthMock.createUser).not.toHaveBeenCalled();
  });

  it('creates user if not found', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ email: 'b@test.com', sub: 'sub', name: 'Name', picture: 'pic', email_verified: true }),
    });
    const notFoundError = new Error('not found') as any;
    notFoundError.code = 'auth/user-not-found';
    adminAuthMock.getUserByEmail.mockRejectedValue(notFoundError);
    adminAuthMock.createUser.mockResolvedValue({ uid: 'newuid' });

    const user = await AuthService.signInWithGoogle('token');
    expect(adminAuthMock.createUser).toHaveBeenCalledWith({
      uid: 'sub',
      email: 'b@test.com',
      displayName: 'Name',
      photoURL: 'pic',
      emailVerified: true,
    });
    expect(user).toEqual({ uid: 'newuid' });
  });
});

describe('AuthService.signInWithEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIREBASE_API_KEY = 'key';
  });

  it('signs in and returns user', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ idToken: 'id' }),
    });
    adminAuthMock.verifyIdToken.mockResolvedValue({ uid: 'uid' });
    adminAuthMock.getUser.mockResolvedValue({ uid: 'uid' });

    const user = await AuthService.signInWithEmail('a@test.com', 'pass');
    expect(fetchMock).toHaveBeenCalled();
    expect(user).toEqual({ uid: 'uid' });
  });

  it('throws on auth failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'INVALID' } }),
    });

    await expect(AuthService.signInWithEmail('a@test.com', 'pass')).rejects.toThrow('INVALID');
  });
});
