import { AuthService } from '../src/services/authService';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const auth = { verifyIdToken: jest.fn(), revokeRefreshTokens: jest.fn(), getUserByEmail: jest.fn(), createUser: jest.fn(), getUser: jest.fn() };
  return {
    auth: () => auth,
    apps: [],
    initializeApp: jest.fn(),
  };
});

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn(),
  };
});

jest.mock('node-fetch', () => jest.fn());

describe('AuthService.verifyIdToken', () => {
  it('calls firebase-admin verifyIdToken and returns decoded token', async () => {
    const decoded = { uid: '123' } as any;
    (admin.auth() as any).verifyIdToken.mockResolvedValue(decoded);
    const result = await AuthService.verifyIdToken('token123');
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('token123');
    expect(result).toBe(decoded);
  });
});

describe('AuthService.signInWithGoogle', () => {
  const { OAuth2Client } = require('google-auth-library');

  beforeEach(() => {
    (OAuth2Client as jest.Mock).mockClear();
  });

  it('rejects sign-in for disallowed domain', async () => {
    const instance = { verifyIdToken: jest.fn().mockResolvedValue({ getPayload: () => ({ email: 'user@bad.com' }) }) };
    (OAuth2Client as jest.Mock).mockImplementation(() => instance);
    await expect(AuthService.signInWithGoogle('idToken')).rejects.toThrow('Unauthorized domain');
  });
});

describe('AuthService.signInWithEmail', () => {
  const fetchMock = require('node-fetch');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects sign-in for disallowed domain without calling fetch', async () => {
    await expect(AuthService.signInWithEmail('user@bad.com', 'x')).rejects.toThrow('Unauthorized domain');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('AuthService.signOut', () => {
  it('revokes refresh tokens', async () => {
    await AuthService.signOut('uid1');
    expect(admin.auth().revokeRefreshTokens).toHaveBeenCalledWith('uid1');
  });
});
