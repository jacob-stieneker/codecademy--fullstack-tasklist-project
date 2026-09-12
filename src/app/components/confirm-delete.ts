import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';
import { Task } from '../models/task';

@Component({
  selector: 'app-confirm-delete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog aria-labelledby="delete-title" aria-describedby="delete-description" (cancel)="onEscape($event)">
      <h2 id="delete-title">Let this task go?</h2>
      <p id="delete-description">“{{ task().title }}” will be permanently removed from your board.</p>
      @if (error()) { <p class="field-error" role="alert">{{ error() }}</p> }
      <div class="dialog-actions">
        <button type="button" class="button button-secondary" autofocus [disabled]="busy()" (click)="cancelled.emit()">Keep task</button>
        <button type="button" class="button button-danger" [disabled]="busy()" (click)="confirmed.emit()">{{ busy() ? 'Deleting...' : 'Delete task' }}</button>
      </div>
    </dialog>
  `,
  styles: `
    dialog { width: min(440px, calc(100vw - 32px)); padding: 24px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--ink); }
    dialog::backdrop { background: #00000099; }
    h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 12px; }
    p { line-height: 1.7; color: var(--muted); overflow-wrap: anywhere; }
    .dialog-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
  `,
})
export class ConfirmDelete {
  readonly task = input.required<Task>();
  readonly busy = input(false);
  readonly error = input('');
  readonly cancelled = output();
  readonly confirmed = output();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Native dialog handles focus trapping, keyboard access, and returning focus on close.
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  onEscape(event: Event): void {
    event.preventDefault();
    if (!this.busy()) this.cancelled.emit();
  }
}
