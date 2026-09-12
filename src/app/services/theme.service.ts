import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'shipyard-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  private preference: Theme | null = this.savedPreference();
  readonly theme = signal<Theme>(this.preference ?? this.systemDefault());

  constructor() {
    this.apply(this.theme());
    const onSystemChange = () => {
      if (!this.preference) this.apply(this.systemDefault());
    };
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        this.preference = this.savedPreference();
        this.apply(this.preference ?? this.systemDefault());
      }
    };
    this.systemTheme.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorageChange);
    inject(DestroyRef).onDestroy(() => {
      this.systemTheme.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorageChange);
    });
  }

  setTheme(value: string): void {
    if (value !== 'light' && value !== 'dark') return;
    // Psudo code //
    // First read the selected Light or Dark option.
    // Then apply the matching CSS variables to the entire app.
    // Save only the appearance preference in this browser, never task data.
    this.preference = value;
    this.apply(this.preference);
    try { localStorage.setItem(STORAGE_KEY, this.preference); } catch {
      // The dropdown still works when the browser blocks storage.
    }
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f4f7fc');
  }

  private systemDefault(): Theme { return this.systemTheme.matches ? 'dark' : 'light'; }

  private savedPreference(): Theme | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch { return null; }
  }
}
