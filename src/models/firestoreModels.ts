import { Timestamp } from 'firebase-admin/firestore';

/**
 * Current schema version for all documents. Increment when schemas evolve.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Base fields included in every versioned document.
 */
export interface VersionedDocument {
  /** Schema version of the document */
  schemaVersion: number;
}

// Collection names in kebab-case
export const USERS_COLLECTION = 'users';
export const LOCATIONS_COLLECTION = 'locations';
export const PASSES_COLLECTION = 'passes';
export const EVENT_LOGS_COLLECTION = 'event-logs';
export const GROUPS_COLLECTION = 'groups';
export const AUTONOMY_MATRIX_COLLECTION = 'autonomy-matrix';
export const RESTRICTIONS_COLLECTION = 'restrictions';
export const SETTINGS_COLLECTION = 'settings';

export interface User extends VersionedDocument {
  uid: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'support' | 'dev';
  displayName?: string;
  photoURL?: string;
}

export interface Location extends VersionedDocument {
  id: string;
  name: string;
  type?: string;
}

export interface Pass extends VersionedDocument {
  passId: string;
  studentId: string;
  originLocationId: string;
  destinationLocationId: string;
  openedAt: Timestamp;
  closedAt?: Timestamp;
  status: 'OPEN' | 'CLOSED';
}

export interface EventLog extends VersionedDocument {
  eventId: string;
  passId?: string;
  actorId: string;
  eventType:
    | 'CREATE_PASS'
    | 'CLOSE_PASS'
    | 'INVALID_TRANSITION'
    | 'EMERGENCY_ACTIVATED'
    | 'EMERGENCY_DEACTIVATED';
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface Group extends VersionedDocument {
  id: string;
  name: string;
  type: 'Positive' | 'Negative';
  members: string[];
}

export interface AutonomyMatrixEntry extends VersionedDocument {
  id: string;
  locationId: string;
  groupId: string;
  type: 'Allow' | 'Deny';
}

export interface Restriction extends VersionedDocument {
  id: string;
  studentId: string;
  locationId?: string;
  reason: string;
  expiresAt?: Timestamp;
}

export interface SystemSettings extends VersionedDocument {
  id: string;
  emergencyFreeze: boolean;
}
