import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'kx_theme';
  private current: Theme;

  constructor() {
    // Recuperar preferencia guardada, o usar preferencia del sistema como fallback
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.current = saved || (prefersDark ? 'dark' : 'light');
    this.apply(this.current);
  }

  getTheme(): Theme {
    return this.current;
  }

  isDark(): boolean {
    return this.current === 'dark';
  }

  toggle(): void {
    this.apply(this.current === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.current = theme;
    localStorage.setItem(this.STORAGE_KEY, theme);
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}
