import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const paths = {
  ship: 'M12 3v3 M8 9V6h8v3 M5 11V8h3 M19 11V8h-3 M3 13l9-4 9 4-3 6H6z M12 9v10 M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1',
  compass: 'M16 8l-3 5-5 3 3-5z M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  sun: 'M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1.5 1.5 M17.5 17.5L19 19 M5 19l1.5-1.5 M17.5 6.5L19 5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20.5 13a8.5 8.5 0 0 1-9.5-9.5A9 9 0 1 0 20.5 13z',
  board: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  plus: 'M12 5v14 M5 12h14',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  check: 'M5 12l4 4L19 6',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  arrow: 'M19 12H5 M11 6l-6 6 6 6',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  edit: 'M16 3l5 5 M4 15L16 3a3.5 3.5 0 0 1 5 5L9 20l-6 1z',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  calendar: 'M8 2v4 M16 2v4 M3 10h18 M3 4h18v17H3z',
  close: 'M6 6l12 12 M18 6L6 18',
  note: 'M5 3h14v12l-6 6H5z M13 21v-6h6 M9 8h6 M9 11h4',
  work: 'M8 6V3h8v3 M3 6h18v14H3z M3 11c6 4 12 4 18 0 M10 12h4',
  personal: 'M20 21v-2a7 7 0 0 0-14 0v2 M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  learning: 'M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2z M12 6v15',
  leaf: 'M20 3C8 2 2 8 5 15s15 6 15-12z M4 21L16 8',
  cloud: 'M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11 M9 15l3 3 5-5',
  help: 'M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
} as const;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()]" /></svg>',
  styles: ':host { display: inline-flex; width: 1.15em; height: 1.15em; flex: 0 0 auto; } svg { width: 100%; height: 100%; }',
})
export class Icon {
  readonly name = input<keyof typeof paths>('note');
  readonly paths = paths;
}
