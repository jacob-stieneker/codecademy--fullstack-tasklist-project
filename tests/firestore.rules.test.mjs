import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

let env;
// A separate emulator project isolates rule tests from the running app's data.
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-pinboard-rules',
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  });
  // Reset only this separate test project. Old fixture timestamps must not affect a rerun.
  await env.clearFirestore();
});
after(async () => { await env?.cleanup(); });

const data = () => ({ title: 'A real task', description: '', status: 'Planning', completed: false, category: 'Work', color: 'butter', priority: 'Medium', dueDate: '', createdAt: serverTimestamp() });
const ownDoc = id => doc(env.authenticatedContext('alice').firestore(), 'users/alice/tasks', id);

test('owner can create, read, update and delete a task', async () => {
  const ref = ownDoc('crud');
  await assertSucceeds(setDoc(ref, data()));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(updateDoc(ref, { title: 'Updated', status: 'Shipped', completed: true }));
  await assertSucceeds(deleteDoc(ref));
});

test('other users cannot read, update, create, or delete someone else’s tasks', async () => {
  await assertSucceeds(setDoc(ownDoc('private'), data()));
  const intruder = doc(env.authenticatedContext('bob').firestore(), 'users/alice/tasks/private');
  await assertFails(getDoc(intruder));
  await assertFails(updateDoc(intruder, { completed: true }));
  await assertFails(deleteDoc(intruder));
  await assertFails(setDoc(doc(env.authenticatedContext('bob').firestore(), 'users/alice/tasks/forged'), data()));
});

test('unauthenticated requests are denied', async () => {
  const ref = doc(env.unauthenticatedContext().firestore(), 'users/alice/tasks/private');
  await assertFails(getDoc(ref));
  await assertFails(setDoc(ref, data()));
  await assertFails(deleteDoc(ref));
});

test('blank titles, invalid fields, and oversized text are rejected', async () => {
  for (const changes of [
    { title: '' }, { title: '   ' }, { title: 'a'.repeat(101) },
    { description: 'a'.repeat(2001) }, { completed: 'yes' }, { category: 'Other' },
    { color: 'orange' }, { priority: 'Urgent' }, { dueDate: 'tomorrow' },
    { injectedField: true }, { status: 'Other' }, { status: 'Shipped' }, { completed: true }, { category: 'Personal', color: 'butter' },
  ]) await assertFails(setDoc(ownDoc('invalid'), { ...data(), ...changes }));
});

test('valid category colors and all three consistent statuses are accepted', async () => {
  for (const [category, color] of [['Work', 'butter'], ['Personal', 'sky'], ['Learning', 'rose']]) {
    for (const status of ['Planning', 'Tracking', 'Shipped']) {
      await assertSucceeds(setDoc(ownDoc(category + status), { ...data(), category, color, status, completed: status === 'Shipped', dueDate: '2026-09-17' }));
    }
  }
});

test('creation timestamps must come from the server and stay unchanged on update', async () => {
  await assertFails(setDoc(ownDoc('backdated'), { ...data(), createdAt: Timestamp.fromMillis(0) }));
  await assertSucceeds(setDoc(ownDoc('timestamp'), data()));
  await assertFails(updateDoc(ownDoc('timestamp'), { createdAt: Timestamp.fromMillis(0) }));
});
