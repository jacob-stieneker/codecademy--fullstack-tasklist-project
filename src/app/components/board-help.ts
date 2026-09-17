import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, output, viewChild } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-board-help',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog aria-labelledby="help-title" (cancel)="close($event)">
      <header><h2 id="help-title">Using Shipyard</h2><button type="button" autofocus aria-label="Close help" (click)="close()"><app-icon name="close" /></button></header>
      <dl>
        <div><dt>Add a task</dt><dd>Choose Add a task, enter the details, then select Add to my board.</dd></div>
        <div><dt>Move it forward</dt><dd>Drag notes between Planning, Tracking, and Shipped. On touch screens, hold a note first. You can also use its status menu.</dd></div>
        <div><dt>Take a closer look</dt><dd>Double-click a note to view its details. With a keyboard, focus a note and press Enter.</dd></div>
        <div><dt>Edit or delete</dt><dd>Choose Edit and save your changes. Choose Delete to remove a task after confirming.</dd></div>
        <div><dt>Find a task</dt><dd>Search titles and descriptions, filter by category, or sort tasks. Work is yellow, Personal is blue, and Learning is pink.</dd></div>
        <div><dt>Check your progress</dt><dd>Each column shows its task count. Finished tasks belong in Shipped.</dd></div>
        <div><dt>Change the theme</dt><dd>Choose Light or Dark from the Theme menu.</dd></div>
      </dl>
      <footer><button class="button button-primary" type="button" (click)="close()">Back to board</button></footer>
    </dialog>
  `,
  styles: `
    dialog { width: min(620px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow-y: auto; padding: 24px; border: 1px solid var(--line); border-radius: 3px; background: var(--surface); color: var(--ink); }
    dialog::backdrop { background: #00000099; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    h2 { margin: 0; font-size: 1.5rem; line-height: 1.4; font-weight: 600; }
    header button { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 3px; color: var(--ink); background: transparent; cursor: pointer; }
    header button:hover { background: var(--hover); }
    dl { margin: 20px 0 0; display: grid; gap: 18px; }
    dt { font-size: .9rem; font-weight: 600; }
    dd { margin: 5px 0 0; font-size: .85rem; color: var(--muted); line-height: 1.6; }
    footer { display: flex; justify-content: flex-end; margin-top: 24px; }
    @media (max-width: 480px) { dialog { padding: 18px; } }
  `,
})
export class BoardHelp {
  readonly closed = output();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // The native dialog keeps keyboard focus inside the guide until it is closed.
    afterNextRender(() => {
      const opener = document.activeElement as HTMLElement | null;
      const dialog = this.dialog().nativeElement;
      dialog.showModal();
      this.destroyRef.onDestroy(() => {
        dialog.close();
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      });
    });
  }

  close(event?: Event): void {
    event?.preventDefault();
    this.closed.emit();
  }
}
