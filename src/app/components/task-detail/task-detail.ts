import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, output, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '../../models/task';
import { Icon } from '../icon';

@Component({
  selector: 'app-task-detail',
  imports: [DatePipe, RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail {
  readonly task = input.required<Task | null>();
  readonly closed = output();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Psudo code //
    // Wait until Angular has rendered the dialog.
    // Open it as a modal so the browser traps focus and blocks the board behind it.
    // Return focus to the original link or note when the view is removed.
    afterNextRender(() => {
      const opener = document.activeElement as HTMLElement | null;
      const dialog = this.dialog().nativeElement;
      dialog.showModal();
      this.destroyRef.onDestroy(() => {
        dialog.close();
        const target = opener?.isConnected ? opener : document.getElementById('board-title');
        target?.focus({ preventScroll: true });
      });
    });
  }

  private readonly destroyRef = inject(DestroyRef);

  close(event?: Event): void {
    event?.preventDefault();
    this.closed.emit();
  }
}
