import {
  CURRENT_SCHEMA_VERSION,
  USERS_COLLECTION,
  LOCATIONS_COLLECTION,
  PASSES_COLLECTION,
  EVENT_LOGS_COLLECTION,
  GROUPS_COLLECTION,
  AUTONOMY_MATRIX_COLLECTION,
  RESTRICTIONS_COLLECTION,
  SETTINGS_COLLECTION,
  SystemSettings,
  EventLog,
  User,
  VersionedDocument,
} from '../src/models/firestoreModels';
import * as admin from 'firebase-admin';

describe('firestoreModels', () => {
  it('exposes collection name constants', () => {
    expect(USERS_COLLECTION).toBe('users');
    expect(LOCATIONS_COLLECTION).toBe('locations');
    expect(PASSES_COLLECTION).toBe('passes');
    expect(EVENT_LOGS_COLLECTION).toBe('event-logs');
    expect(GROUPS_COLLECTION).toBe('groups');
    expect(AUTONOMY_MATRIX_COLLECTION).toBe('autonomy-matrix');
    expect(RESTRICTIONS_COLLECTION).toBe('restrictions');
    expect(SETTINGS_COLLECTION).toBe('settings');
  });

  it('includes a current schema version', () => {
    expect(typeof CURRENT_SCHEMA_VERSION).toBe('number');
  });

  it('allows creating typed user objects', () => {
    const user: User & VersionedDocument = {
      uid: 'u1',
      email: 'a@example.com',
      role: 'student',
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
    expect(user.uid).toBe('u1');
  });

  it('allows creating typed system settings objects', () => {
    const settings: SystemSettings & VersionedDocument = {
      id: 'global',
      emergencyFreeze: false,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
    expect(settings.emergencyFreeze).toBe(false);
  });

  it('allows creating typed event log objects with new types', () => {
    const log: EventLog & VersionedDocument = {
      eventId: 'e1',
      passId: 'p1',
      actorId: 'a1',
      eventType: 'EMERGENCY_CLAIM',
      timestamp: admin.firestore.Timestamp.now(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
    expect(log.eventType).toBe('EMERGENCY_CLAIM');
  });
});
