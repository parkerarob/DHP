const fs = require('fs');
const {initializeTestEnvironment, assertSucceeds, assertFails} = require('@firebase/rules-unit-testing');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'dhp-test',
    firestore: {rules: fs.readFileSync('firestore.rules', 'utf8')}
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function getAuthedDb(uid, role) {
  return testEnv.authenticatedContext(uid, {role}).firestore();
}

function getAnonDb() {
  return testEnv.unauthenticatedContext().firestore();
}

describe('firestore security rules', () => {
  test('student can read own pass', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('passes').doc('p1').set({studentId: 'stu1'});
    });
    const db = getAuthedDb('stu1', 'student');
    await assertSucceeds(db.collection('passes').doc('p1').get());
  });

  test('student cannot read others pass', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('passes').doc('p2').set({studentId: 'other'});
    });
    const db = getAuthedDb('stu1', 'student');
    await assertFails(db.collection('passes').doc('p2').get());
  });

  test('student cannot write eventLogs', async () => {
    const db = getAuthedDb('stu1', 'student');
    await assertFails(db.collection('eventLogs').add({foo: 'bar'}));
  });

  test('teacher can read and write passes', async () => {
    const db = getAuthedDb('t1', 'teacher');
    await assertSucceeds(db.collection('passes').doc('p3').set({studentId: 's3'}));
    await assertSucceeds(db.collection('passes').doc('p3').get());
  });

  test('teacher cannot write users', async () => {
    const db = getAuthedDb('t1', 'teacher');
    await assertFails(db.collection('users').doc('u1').set({}));
  });

  test('admin can read and write users', async () => {
    const db = getAuthedDb('a1', 'admin');
    await assertSucceeds(db.collection('users').doc('u2').set({role: 'student'}));
    await assertSucceeds(db.collection('users').doc('u2').get());
  });

  test('admin can write autonomyMatrix', async () => {
    const db = getAuthedDb('a1', 'admin');
    await assertSucceeds(db.collection('autonomyMatrix').doc('loc1').set({type: 'Allow'}));
  });

  test('dev has full access', async () => {
    const db = getAuthedDb('d1', 'dev');
    await assertSucceeds(db.collection('any').doc('doc').set({}));
    await assertSucceeds(db.collection('any').doc('doc').get());
  });

  test('support staff can read passes', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection('passes').doc('p4').set({studentId: 's4'});
    });
    const db = getAuthedDb('sup1', 'support');
    await assertSucceeds(db.collection('passes').doc('p4').get());
  });

  test('anonymous denied', async () => {
    const db = getAnonDb();
    await assertFails(db.collection('passes').doc('p1').get());
  });
});
