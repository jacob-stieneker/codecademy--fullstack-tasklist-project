import { DestroyRef, Injectable, Injector, inject, runInInjectionContext, signal } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import {
  Firestore, Unsubscribe, addDoc, collection, deleteDoc, doc,
  onSnapshot, serverTimestamp, updateDoc,
} from '@angular/fire/firestore';
import { CATEGORY_COLORS, NewTask, Task, TaskChanges } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private unsubscribe?: Unsubscribe;
  private connectionTimer?: ReturnType<typeof setTimeout>;
  private userId = '';

  // Signals notify Angular when the database changes. Components only read these values.
  private readonly taskState = signal<Task[]>([]);
  readonly tasks = this.taskState.asReadonly();
  readonly loading = signal(true);
  readonly connected = signal(false);
  readonly error = signal('');

  constructor() {
    void this.connect();
    this.destroyRef.onDestroy(() => {
      this.unsubscribe?.();
      clearTimeout(this.connectionTimer);
    });
  }

  async connect(): Promise<void> {
    this.unsubscribe?.();
    clearTimeout(this.connectionTimer);
    this.loading.set(true);
    this.connected.set(false);
    this.error.set('');

    // Psudo code //
    // First restore this browser's Firebase sign-in, or create an anonymous user.
    // Then listen to that user's task collection in Firestore.
    // Then put every database update into the tasks signal.
    // Finally let Angular refresh the board automatically.
    try {
      await this.auth.authStateReady();
      const user = this.auth.currentUser ?? (await this.inFirebase(() => signInAnonymously(this.auth))).user;
      this.userId = user.uid;
      this.connectionTimer = setTimeout(() => {
        this.loading.set(false);
        this.error.set('The board could not connect. Check your connection and make sure Firebase is running, then retry.');
      }, 10000);
      this.unsubscribe = this.inFirebase(() => onSnapshot(
        collection(this.firestore, 'users', this.userId, 'tasks'),
        { includeMetadataChanges: true },
        snapshot => {
          // Only a server snapshot proves that the database is connected.
          this.connected.set(!snapshot.metadata.fromCache);
          if (!snapshot.metadata.fromCache) {
            clearTimeout(this.connectionTimer);
            this.loading.set(false);
            this.error.set('');
          }
          // Ignore optimistic local writes until Firestore confirms them.
          if (!snapshot.metadata.hasPendingWrites) {
            this.taskState.set(snapshot.docs.map(item => {
              const data = item.data() as Omit<Task, 'id'>;
              // Older records have only completed. Adapt them on read without rewriting the board.
              const status = data.status ?? (data.completed ? 'Shipped' : 'Planning');
              return { ...data, id: item.id, status, completed: status === 'Shipped', color: CATEGORY_COLORS[data.category] };
            }));
          }
        },
        () => {
          clearTimeout(this.connectionTimer);
          this.loading.set(false);
          this.connected.set(false);
          this.error.set('We could not read your board. Check the Firebase connection and security rules, then retry.');
        },
      ));
    } catch (error) {
      // Log only the error code for troubleshooting, never account credentials or task data.
      if (error && typeof error === 'object' && 'code' in error) {
        console.warn('Firebase connection failed:', error.code);
      }
      this.loading.set(false);
      this.error.set('We could not open your private board. Check that Firebase Authentication is running, then retry.');
    }
  }

  addTask(task: NewTask) {
    this.requireConnection();
    // CREATE: Firestore supplies the document ID and a trusted creation timestamp.
    return this.inFirebase(() => addDoc(collection(this.firestore, 'users', this.userId, 'tasks'), {
      ...task, title: task.title.trim(), description: task.description.trim(),
      color: CATEGORY_COLORS[task.category], completed: task.status === 'Shipped', createdAt: serverTimestamp(),
    }));
  }

  updateTask(id: string, changes: TaskChanges) {
    this.requireConnection();
    const current = this.tasks().find(task => task.id === id);
    if (!current) throw new Error('This task no longer exists.');
    const status = changes.status ?? current.status;
    const category = changes.category ?? current.category;
    // UPDATE: only the selected document changes. Its ID and creation time stay intact.
    return this.inFirebase(() => updateDoc(doc(this.firestore, 'users', this.userId, 'tasks', id), {
      ...changes, status, completed: status === 'Shipped', color: CATEGORY_COLORS[category],
    }));
  }

  deleteTask(id: string) {
    this.requireConnection();
    // DELETE: use the Firestore ID, never the visible position of a sticky note.
    return this.inFirebase(() => deleteDoc(doc(this.firestore, 'users', this.userId, 'tasks', id)));
  }

  private requireConnection(): void {
    if (!this.userId || !this.connected()) throw new Error('The board is not connected. Please retry when Firebase is available.');
  }

  private inFirebase<T>(operation: () => T): T {
    // AngularFire needs an injection context, including calls made after an await or button click.
    return runInInjectionContext(this.injector, operation);
  }
}
