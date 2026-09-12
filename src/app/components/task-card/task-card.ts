import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { STATUSES, Task, TaskStatus } from '../../models/task';
import { Icon } from '../icon';

@Component({
  selector: 'app-task-card',
  imports: [DatePipe, RouterLink, Icon, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  readonly task = input.required<Task>();
  readonly busy = input(false);
  readonly disabled = input(false);
  readonly today = input.required<string>();
  readonly statuses = STATUSES;
  readonly statusChanged = output<{ task: Task; status: TaskStatus }>();
  readonly deleteRequested = output<Task>();
  readonly viewRequested = output<Task>();

  openDetails(event: Event): void {
    // Keep editing, deletion, and status controls independent of opening a note.
    const target = event.target as HTMLElement;
    if (target.closest('a, button, select, input, textarea')) return;
    if (event instanceof KeyboardEvent && event.target !== event.currentTarget) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).focus({ preventScroll: true });
    this.viewRequested.emit(this.task());
  }


  changeStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value as TaskStatus;
    // Keep the last confirmed selection visible until Firestore accepts the update.
    select.value = this.task().status;
    this.statusChanged.emit({ task: this.task(), status });
  }
}
