import * as admin from 'firebase-admin';
import {
  SETTINGS_COLLECTION,
  EVENT_LOGS_COLLECTION,
  SystemSettings,
  EventLog,
  CURRENT_SCHEMA_VERSION,
} from '../models/firestoreModels';
import { PassService } from './passService';

if (!admin.apps.length) {
  admin.initializeApp();
}

export class EmergencyService {
  private static db = admin.firestore();

  private static settingsRef = EmergencyService.db
    .collection(SETTINGS_COLLECTION)
    .doc('global');

  static async getEmergencyFreeze(): Promise<boolean> {
    const snap = await this.settingsRef.get();
    if (!snap.exists) {
      return false;
    }
    const data = snap.data() as SystemSettings;
    return data.emergencyFreeze;
  }

  static async setEmergencyFreeze(enabled: boolean, actorId: string): Promise<void> {
    await this.settingsRef.set(
      { id: 'global', emergencyFreeze: enabled, schemaVersion: CURRENT_SCHEMA_VERSION },
      { merge: true },
    );
    const eventRef = this.db.collection(EVENT_LOGS_COLLECTION).doc();
    const log: EventLog = {
      eventId: eventRef.id,
      actorId,
      eventType: enabled ? 'EMERGENCY_ACTIVATED' : 'EMERGENCY_DEACTIVATED',
      timestamp: admin.firestore.Timestamp.now(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
    await eventRef.set(log);
  }

  static async emergencyClaimPass(passId: string, actorId: string): Promise<void> {
    try {
      await PassService.closePass(passId, actorId);
    } catch {
      throw new Error('INVALID_TRANSITION');
    }
  }
}

export default EmergencyService;
