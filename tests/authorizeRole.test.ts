import authorizeRole from '../src/middleware/authorizeRole';

const buildReq = (user?: any, params: any = {}) => ({ params, user });

const res: any = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

const next = jest.fn();

beforeEach(() => {
  res.status.mockClear();
  res.json.mockClear();
  next.mockClear();
});

test('denies when role not allowed', () => {
  const mw = authorizeRole(['admin']);
  const req = buildReq({ uid: 'u1', role: 'student' });
  mw(req as any, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(next).not.toHaveBeenCalled();
});

test('denies when uid mismatch for non-admin', () => {
  const mw = authorizeRole(['teacher']);
  const req = buildReq({ uid: 'u1', role: 'teacher' }, { uid: 'u2' });
  mw(req as any, res, next);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(next).not.toHaveBeenCalled();
});

test('allows when role and uid valid', () => {
  const mw = authorizeRole(['teacher']);
  const req = buildReq({ uid: 'u1', role: 'teacher' }, { uid: 'u1' });
  mw(req as any, res, next);
  expect(next).toHaveBeenCalled();
});
