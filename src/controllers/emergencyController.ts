import express from 'express';
import EmergencyService from '../services/emergencyService';
import verifyAuth from '../middleware/verifyAuth';
import authorizeRole from '../middleware/authorizeRole';

const router = express.Router();

router.post(
  '/freeze',
  verifyAuth,
  authorizeRole(['admin', 'dev']),
  async (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    await EmergencyService.setEmergencyFreeze(enabled, (req as any).user.uid);
    res.status(204).send();
  },
);

router.post(
  '/claim/:passId',
  verifyAuth,
  authorizeRole(['teacher', 'admin', 'support', 'dev']),
  async (req, res) => {
    const { passId } = req.params;
    await EmergencyService.emergencyClaimPass(passId, (req as any).user.uid);
    res.status(204).send();
  },
);

export default router;
