import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'libraria_theme';
  currentTheme = signal<Theme>('dark');

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(this.THEME_KEY) as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      this.setTheme(saved);
    } else {
      this.setTheme('dark');
    }
  }

  toggleTheme() {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
