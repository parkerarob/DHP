import { AuthService } from '../src/services/authService';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const auth = { verifyIdToken: jest.fn() };
  return {
    auth: () => auth,
    apps: [],
    initializeApp: jest.fn(),
  };
});

describe('AuthService.verifyIdToken', () => {
  it('calls firebase-admin verifyIdToken and returns decoded token', async () => {
    const decoded = { uid: '123' } as any;
    (admin.auth() as any).verifyIdToken.mockResolvedValue(decoded);
    const result = await AuthService.verifyIdToken('token123');
    expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('token123');
    expect(result).toBe(decoded);
  });
});
