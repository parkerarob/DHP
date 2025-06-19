import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as admin from 'firebase-admin';
import {
  SETTINGS_COLLECTION,
  EVENT_LOGS_COLLECTION,
  PASSES_COLLECTION,
} from '../src/models/firestoreModels';

let testEnv: RulesTestEnvironment;
let EmergencyService: typeof import('../src/services/emergencyService').EmergencyService;
let PassService: typeof import('../src/services/passService').PassService;

beforeAll(async () => {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  testEnv = await initializeTestEnvironment({
    projectId: 'dhp-test',
    firestore: { host: '127.0.0.1', port: 8080 },
  });
  process.env.GCLOUD_PROJECT = testEnv.projectId;
  ({ EmergencyService } = await import('../src/services/emergencyService'));
  ({ PassService } = await import('../src/services/passService'));
});

afterAll(async () => {
  await testEnv.cleanup();
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.GCLOUD_PROJECT;
  if (admin.apps.length) {
    await admin.app().delete();
  }
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function getDoc(collection: string, id: string) {
  let snap: any;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    snap = await ctx.firestore().collection(collection).doc(id).get();
  });
  return snap;
}

async function getCollection(collection: string) {
  let snap: any;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    snap = await ctx.firestore().collection(collection).get();
  });
  return snap;
}

test('setEmergencyFreeze stores flag and logs event', async () => {
  await EmergencyService.setEmergencyFreeze(true, 'staff1');
  const settingsSnap = await getDoc(SETTINGS_COLLECTION, 'global');
  expect(settingsSnap.data()?.emergencyFreeze).toBe(true);
  const logs = await getCollection(EVENT_LOGS_COLLECTION);
  expect(logs.docs[0].data().eventType).toBe('EMERGENCY_ACTIVATED');
});

test('getEmergencyFreeze returns current value', async () => {
  await EmergencyService.setEmergencyFreeze(true, 'staff1');
  const flag = await EmergencyService.getEmergencyFreeze();
  expect(flag).toBe(true);
});

test('emergencyClaimPass closes an open pass', async () => {
  const passId = await PassService.createPass('stu1', 'a', 'b', 'actor1');
  await EmergencyService.emergencyClaimPass(passId, 'staff1');
  const passSnap = await getDoc(PASSES_COLLECTION, passId);
  expect(passSnap.data()?.status).toBe('CLOSED');
  const logs = await getCollection(EVENT_LOGS_COLLECTION);
  expect(logs.docs[0].data().eventType).toBe('EMERGENCY_CLAIM');
});
