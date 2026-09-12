import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CATEGORIES, CATEGORY_COLORS, STATUSES, PRIORITIES, Category, NewTask, TaskStatus, Priority } from '../../models/task';
import { TaskService } from '../../services/task.service';
import { NoticeService } from '../../services/notice.service';
import { Icon } from '../../components/icon';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  readonly store = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notice = inject(NoticeService);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly taskId = computed(() => this.params().get('id'));
  readonly editing = computed(() => this.taskId() !== null);
  readonly task = computed(() => this.store.tasks().find(task => task.id === this.taskId()));
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly categories = CATEGORIES;
  readonly categoryColors = CATEGORY_COLORS;
  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  private loadedId: string | null = null;

  // Typed reactive forms make validation and the submitted data easy to follow.
  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
    category: new FormControl<Category>('Work', { nonNullable: true }),
    status: new FormControl<TaskStatus>('Planning', { nonNullable: true }),
    priority: new FormControl<Priority>('Medium', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)] }),
  });
  private readonly formChanges = toSignal(this.form.valueChanges);
  readonly preview = computed(() => {
    this.formChanges();
    return this.form.getRawValue();
  });

  constructor() {
    effect(() => {
      const task = this.task();
      // Fill the edit form once. Later real-time updates must not overwrite unsaved typing.
      if (task && task.id !== this.loadedId) {
        this.loadedId = task.id;
        untracked(() => this.form.patchValue(task));
      }
    });
  }

  async save(): Promise<void> {
    if (this.saving()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      document.querySelector<HTMLElement>('input.ng-invalid, textarea.ng-invalid')?.focus();
      return;
    }
    this.saving.set(true);
    this.saveError.set('');

    // Psudo code //
    // First validate the fields and remove extra spaces.
    // Then create a new task, or update the task identified by the route.
    // Wait for Firebase to confirm the write before reporting success.
    // If saving fails, keep the form values so the user can try again.
    const values = this.form.getRawValue();
    const data: NewTask = { ...values, title: values.title.trim(), description: values.description.trim() };
    try {
      const id = this.taskId();
      if (id) await this.store.updateTask(id, data);
      else await this.store.addTask(data);
      this.form.markAsPristine();
      this.notice.show(id ? 'Task updated. Ready to move forward.' : "Task added. You're underway.");
      await this.router.navigate(['/tasks']);
    } catch {
      this.saveError.set('Your task could not be saved. Your changes are still here. Check your connection and try again.');
    } finally {
      this.saving.set(false);
    }
  }
}
