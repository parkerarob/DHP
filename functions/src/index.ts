import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import emergencyRouter from '../../src/controllers/emergencyController';

const app = express();
app.use(express.json());
app.use('/emergency', emergencyRouter);

export const api = onRequest(app);
