import {
  CURRENT_SCHEMA_VERSION,
  USERS_COLLECTION,
  LOCATIONS_COLLECTION,
  PASSES_COLLECTION,
  EVENT_LOGS_COLLECTION,
  GROUPS_COLLECTION,
  AUTONOMY_MATRIX_COLLECTION,
  RESTRICTIONS_COLLECTION,
  User,
  VersionedDocument,
} from '../src/models/firestoreModels';

describe('firestoreModels', () => {
  it('exposes collection name constants', () => {
    expect(USERS_COLLECTION).toBe('users');
    expect(LOCATIONS_COLLECTION).toBe('locations');
    expect(PASSES_COLLECTION).toBe('passes');
    expect(EVENT_LOGS_COLLECTION).toBe('event-logs');
    expect(GROUPS_COLLECTION).toBe('groups');
    expect(AUTONOMY_MATRIX_COLLECTION).toBe('autonomy-matrix');
    expect(RESTRICTIONS_COLLECTION).toBe('restrictions');
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
});
