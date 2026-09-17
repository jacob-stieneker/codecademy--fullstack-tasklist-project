import { ChangeDetectionStrategy, Component, DestroyRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { CATEGORIES, STATUSES, Category, Task, TaskStatus } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { NoticeService } from '../../services/notice.service';
import { TaskCard } from '../../components/task-card/task-card';
import { ConfirmDelete } from '../../components/confirm-delete';
import { TaskDetail } from '../../components/task-detail/task-detail';
import { Icon } from '../../components/icon';

type SortOrder = 'newest' | 'oldest' | 'priority' | 'due';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink, FormsModule, TaskCard, ConfirmDelete, TaskDetail, Icon, CdkDropList, CdkDropListGroup, CdkScrollable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  readonly store = inject(TaskService);
  private readonly notice = inject(NoticeService);
  private readonly injector = inject(Injector);
  readonly categories = CATEGORIES;
  readonly statuses = STATUSES;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly selectedId = computed(() => this.queryParams().get('task'));
  // Read the selected note from the live store, so another tab can update its details.
  readonly selectedTask = computed(() => this.store.tasks().find(task => task.id === this.selectedId()) ?? null);
  readonly search = signal('');
  readonly category = signal<Category | 'all'>('all');
  readonly sort = signal<SortOrder>('newest');
  readonly deleting = signal<Task | null>(null);
  readonly pendingIds = signal<Set<string>>(new Set());
  readonly deleteBusy = signal(false);
  readonly actionError = signal('');
  readonly deleteError = signal('');
  readonly today = signal(this.localDate());


  readonly visibleTasks = computed(() => {
    // Psudo code //
    // First start with the tasks received from Firebase.
    // Then keep tasks matching the search and category.
    // Then sort a new array so the original database list stays unchanged.
    const query = this.search().trim().toLowerCase();
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return this.store.tasks().filter(task =>
      (this.category() === 'all' || task.category === this.category()) &&
      `${task.title} ${task.description}`.toLowerCase().includes(query),
    ).sort((a, b) => {
      const newestFirst = (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0);
      if (this.sort() === 'oldest') return -newestFirst;
      if (this.sort() === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority] || newestFirst;
      if (this.sort() === 'due') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || newestFirst;
      return newestFirst;
    });
  });

  // Each column keeps the chosen sort order. Only status changes when a note is dropped.
  readonly columns = computed(() => this.statuses.map(status => ({
    status, tasks: this.visibleTasks().filter(task => task.status === status),
  })));

  async dropTask(event: CdkDragDrop<TaskStatus, TaskStatus, Task>): Promise<void> {
    if (!event.isPointerOverContainer || event.previousContainer === event.container) return;
    // Psudo code //
    // Read the dragged task and the destination column's status.
    // Save the status through the same service used by the edit form.
    // Let the confirmed Firestore update move the note into its new column.
    await this.changeStatus({ task: event.item.data, status: event.container.data });
  }

  constructor() {
    // Recheck the local date so overdue labels stay correct if the board is open overnight.
    const timer = setInterval(() => this.today.set(this.localDate()), 60000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  openTask(task: Task): void {
    // Psudo code //
    // Put the note's ID in the URL so its expanded view can survive a refresh.
    // Find that note in the live task list and show its expanded view.
    void this.router.navigate(['/tasks'], { queryParams: { task: task.id } });
  }

  closeTask(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { task: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  clearFilters(): void {
    this.search.set('');
    this.category.set('all');
  }

  async changeStatus(change: { task: Task; status: TaskStatus }): Promise<void> {
    const { task, status } = change;
    if (!this.store.connected() || this.pendingIds().has(task.id) || task.status === status) return;
    this.pendingIds.update(ids => new Set(ids).add(task.id));
    this.actionError.set('');
    try {
      await this.store.updateTask(task.id, { status });
      this.notice.show('Task moved to ' + status + '.');
      // The old card is replaced when it moves columns, so restore focus on the new card.
      afterNextRender(() => {
        const target = document.getElementById('task-' + task.id) ?? document.getElementById('board-title');
        target?.focus({ preventScroll: true });
      }, { injector: this.injector });
    } catch {
      this.actionError.set('This task could not be updated. Check your connection and try again.');
      return;
    } finally {
      this.pendingIds.update(ids => { const next = new Set(ids); next.delete(task.id); return next; });
    }
  }

  askToDelete(task: Task): void {
    this.deleteError.set('');
    this.deleting.set(task);
  }

  async deleteTask(): Promise<void> {
    const task = this.deleting();
    if (!task || this.deleteBusy()) return;
    this.deleteBusy.set(true);
    try {
      await this.store.deleteTask(task.id);
      this.deleting.set(null);
      // The deleted button no longer exists, so return keyboard focus to the board heading.
      afterNextRender(() => document.getElementById('board-title')?.focus(), { injector: this.injector });
      this.notice.show('Task deleted from your board.');
    } catch {
      this.deleteError.set('We could not delete this task. Check your connection and try again.');
    } finally {
      this.deleteBusy.set(false);
    }
  }

  private localDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}
