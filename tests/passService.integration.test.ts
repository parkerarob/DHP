import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as admin from 'firebase-admin';
import {
  PASSES_COLLECTION,
  EVENT_LOGS_COLLECTION,
  SETTINGS_COLLECTION,
} from '../src/models/firestoreModels';

let testEnv: RulesTestEnvironment;
let PassService: typeof import('../src/services/passService').PassService;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({ projectId: 'dhp-test' });
  process.env.GCLOUD_PROJECT = testEnv.projectId;
  ({ PassService } = await import('../src/services/passService'));
});

afterAll(async () => {
  await testEnv.cleanup();
  delete process.env.GCLOUD_PROJECT;
  if (admin.apps.length) {
    admin.app().delete();
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

async function getCollection(collection: string, field: string, value: any) {
  let snap: any;
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    snap = await ctx
      .firestore()
      .collection(collection)
      .where(field, '==', value)
      .get();
  });
  return snap;
}

test('createPass creates a pass and logs event', async () => {
  const passId = await PassService.createPass('stu1', 'loc1', 'loc2', 'actor1');
  const passSnap = await getDoc(PASSES_COLLECTION, passId);
  expect(passSnap.exists).toBe(true);
  expect(passSnap.data()!.status).toBe('OPEN');
  const logs = await getCollection(EVENT_LOGS_COLLECTION, 'passId', passId);
  expect(logs.docs[0].data().eventType).toBe('CREATE_PASS');
});

test('createPass prevents multiple open passes', async () => {
  await PassService.createPass('stu1', 'loc1', 'loc2', 'actor1');
  await expect(
    PassService.createPass('stu1', 'loc1', 'loc3', 'actor1')
  ).rejects.toThrow('INVALID_TRANSITION');
  const passes = await getCollection(PASSES_COLLECTION, 'studentId', 'stu1');
  expect(passes.docs.length).toBe(1);
  const logs = await getCollection(EVENT_LOGS_COLLECTION, 'eventType', 'INVALID_TRANSITION');
  expect(logs.docs.length).toBe(1);
});

test('closePass updates pass and logs event', async () => {
  const passId = await PassService.createPass('stu2', 'a', 'b', 'actor1');
  await PassService.closePass(passId, 'actor1');
  const passSnap = await getDoc(PASSES_COLLECTION, passId);
  expect(passSnap.data()!.status).toBe('CLOSED');
  expect(passSnap.data()!.closedAt).toBeDefined();
  const logs = await getCollection(EVENT_LOGS_COLLECTION, 'eventType', 'CLOSE_PASS');
  expect(logs.docs.length).toBe(1);
});

test('closePass on closed pass logs invalid transition', async () => {
  const passId = await PassService.createPass('stu3', 'a', 'b', 'actor1');
  await PassService.closePass(passId, 'actor1');
  await expect(PassService.closePass(passId, 'actor1')).rejects.toThrow('INVALID_TRANSITION');
  const logs = await getCollection(EVENT_LOGS_COLLECTION, 'eventType', 'INVALID_TRANSITION');
  expect(logs.docs.length).toBe(1);
});

test('createPass rejects when emergency freeze is active', async () => {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().collection(SETTINGS_COLLECTION).doc('global').set({
      id: 'global',
      emergencyFreeze: true,
      schemaVersion: 1,
    });
  });

  await expect(
    PassService.createPass('stu4', 'a', 'b', 'actor1')
  ).rejects.toThrow('INVALID_TRANSITION');
  const logs = await getCollection(
    EVENT_LOGS_COLLECTION,
    'eventType',
    'INVALID_TRANSITION'
  );
  expect(logs.docs.length).toBe(1);
});

test('emergencyClaimPass closes pass and logs event', async () => {
  const passId = await PassService.createPass('stu5', 'a', 'b', 'actor1');
  await PassService.emergencyClaimPass(passId, 'staff1');
  const passSnap = await getDoc(PASSES_COLLECTION, passId);
  expect(passSnap.data()!.status).toBe('CLOSED');
  const logs = await getCollection(EVENT_LOGS_COLLECTION, 'eventType', 'EMERGENCY_CLAIM');
  expect(logs.docs.length).toBe(1);
});
