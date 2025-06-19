import * as admin from 'firebase-admin';
import {
  CURRENT_SCHEMA_VERSION,
  PASSES_COLLECTION,
  EVENT_LOGS_COLLECTION,
  SETTINGS_COLLECTION,
  SystemSettings,
  Pass,
  EventLog,
} from '../models/firestoreModels';

if (!admin.apps.length) {
  admin.initializeApp();
}

export class PassService {
  private static db = admin.firestore();

  static async createPass(
    studentId: string,
    originLocationId: string,
    destinationLocationId: string,
    actorId: string
  ): Promise<string> {
    const passRef = this.db.collection(PASSES_COLLECTION).doc();
    const eventRef = this.db.collection(EVENT_LOGS_COLLECTION).doc();

    const settingsSnap = await this.db
      .collection(SETTINGS_COLLECTION)
      .doc('global')
      .get();
    if (
      settingsSnap.exists &&
      (settingsSnap.data() as SystemSettings).emergencyFreeze
    ) {
      const log: EventLog = {
        eventId: eventRef.id,
        actorId,
        eventType: 'INVALID_TRANSITION',
        timestamp: admin.firestore.Timestamp.now(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
        metadata: { reason: 'EMERGENCY_FREEZE' },
      };
      await eventRef.set(log);
      throw new Error('INVALID_TRANSITION');
    }

    const result = await this.db.runTransaction(async (tx) => {
      const openQuery = this.db
        .collection(PASSES_COLLECTION)
        .where('studentId', '==', studentId)
        .where('status', '==', 'OPEN')
        .limit(1);
      const existing = await tx.get(openQuery);
      if (!existing.empty) {
        const invalid: EventLog = {
          eventId: eventRef.id,
          passId: existing.docs[0].id,
          actorId,
          eventType: 'INVALID_TRANSITION',
          timestamp: admin.firestore.Timestamp.now(),
          schemaVersion: CURRENT_SCHEMA_VERSION,
          metadata: { attempted: 'CREATE_PASS' },
        };
        tx.set(eventRef, invalid);
        return { success: false };
      }

      const pass: Pass = {
        passId: passRef.id,
        studentId,
        originLocationId,
        destinationLocationId,
        openedAt: admin.firestore.Timestamp.now(),
        status: 'OPEN',
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      tx.set(passRef, pass);
      const log: EventLog = {
        eventId: eventRef.id,
        passId: passRef.id,
        actorId,
        eventType: 'CREATE_PASS',
        timestamp: admin.firestore.Timestamp.now(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      tx.set(eventRef, log);
      return { success: true };
    });

    if (!result.success) {
      throw new Error('INVALID_TRANSITION');
    }

    return passRef.id;
  }

  static async closePass(passId: string, actorId: string): Promise<void> {
    const passRef = this.db.collection(PASSES_COLLECTION).doc(passId);
    const eventRef = this.db.collection(EVENT_LOGS_COLLECTION).doc();

    const result = await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(passRef);
      if (!snap.exists) {
        const invalid: EventLog = {
          eventId: eventRef.id,
          passId,
          actorId,
          eventType: 'INVALID_TRANSITION',
          timestamp: admin.firestore.Timestamp.now(),
          schemaVersion: CURRENT_SCHEMA_VERSION,
          metadata: { reason: 'NOT_FOUND' },
        };
        tx.set(eventRef, invalid);
        return { success: false };
      }
      const pass = snap.data() as Pass;
      if (pass.status !== 'OPEN') {
        const invalid: EventLog = {
          eventId: eventRef.id,
          passId,
          actorId,
          eventType: 'INVALID_TRANSITION',
          timestamp: admin.firestore.Timestamp.now(),
          schemaVersion: CURRENT_SCHEMA_VERSION,
          metadata: { reason: 'ALREADY_CLOSED' },
        };
        tx.set(eventRef, invalid);
        return { success: false };
      }
      tx.update(passRef, {
        status: 'CLOSED',
        closedAt: admin.firestore.Timestamp.now(),
      });
      const log: EventLog = {
        eventId: eventRef.id,
        passId,
        actorId,
        eventType: 'CLOSE_PASS',
        timestamp: admin.firestore.Timestamp.now(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      tx.set(eventRef, log);
      return { success: true };
    });

    if (!result.success) {
      throw new Error('INVALID_TRANSITION');
    }
  }

  static async emergencyClaimPass(passId: string, actorId: string): Promise<void> {
    const passRef = this.db.collection(PASSES_COLLECTION).doc(passId);
    const eventRef = this.db.collection(EVENT_LOGS_COLLECTION).doc();

    const result = await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(passRef);
      if (!snap.exists) {
        const invalid: EventLog = {
          eventId: eventRef.id,
          passId,
          actorId,
          eventType: 'INVALID_TRANSITION',
          timestamp: admin.firestore.Timestamp.now(),
          schemaVersion: CURRENT_SCHEMA_VERSION,
          metadata: { reason: 'NOT_FOUND' },
        };
        tx.set(eventRef, invalid);
        return { success: false };
      }
      const pass = snap.data() as Pass;
      if (pass.status !== 'OPEN') {
        const invalid: EventLog = {
          eventId: eventRef.id,
          passId,
          actorId,
          eventType: 'INVALID_TRANSITION',
          timestamp: admin.firestore.Timestamp.now(),
          schemaVersion: CURRENT_SCHEMA_VERSION,
          metadata: { reason: 'ALREADY_CLOSED' },
        };
        tx.set(eventRef, invalid);
        return { success: false };
      }
      tx.update(passRef, {
        status: 'CLOSED',
        closedAt: admin.firestore.Timestamp.now(),
      });
      const log: EventLog = {
        eventId: eventRef.id,
        passId,
        actorId,
        eventType: 'EMERGENCY_CLAIM',
        timestamp: admin.firestore.Timestamp.now(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };
      tx.set(eventRef, log);
      return { success: true };
    });

    if (!result.success) {
      throw new Error('INVALID_TRANSITION');
    }
  }
}

export default PassService;
