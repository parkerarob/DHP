import verifyAuth from '../src/middleware/verifyAuth';
import { AuthService } from '../src/services/authService';

jest.mock('../src/services/authService');

describe('verifyAuth middleware', () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();
  let req: any;

  beforeEach(() => {
    req = { headers: {} };
    jest.clearAllMocks();
  });

  it('responds with 401 when header missing', async () => {
    await verifyAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls AuthService and attaches user when token valid', async () => {
    req.headers.authorization = 'Bearer token';
    (AuthService.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'u1' });
    await verifyAuth(req, res, next);
    expect(AuthService.verifyIdToken).toHaveBeenCalledWith('token');
    expect(req.user).toEqual({ uid: 'u1' });
    expect(next).toHaveBeenCalled();
  });
});
