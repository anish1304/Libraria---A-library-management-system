import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card-custom" [ngClass]="['accent-' + effectiveAccent]">
      <div>
        <div class="stat-label">{{ displayLabel }}</div>
        <div class="stat-value">{{ value }}</div>
        <div class="stat-caption" *ngIf="caption">{{ caption }}</div>
      </div>
      <div class="stat-icon-wrap" [ngStyle]="getIconStyle()">
        <i [class]="'bi ' + icon"></i>
      </div>
    </div>
  `,
  styles: [`
    .stat-caption {
      font-size: 0.775rem;
      color: var(--text-tertiary);
      margin-top: 0.35rem;
    }
  `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() title: string = '';
  @Input({ required: true }) value: string | number = 0;
  @Input({ required: true }) icon: string = 'bi-bar-chart';
  @Input() accent: 'blue' | 'violet' | 'success' | 'warning' | 'danger' | 'default' = 'blue';
  @Input() variant?: 'blue' | 'violet' | 'success' | 'warning' | 'danger' | 'default';
  @Input() caption?: string;

  get displayLabel(): string {
    return this.title || this.label;
  }

  get effectiveAccent(): string {
    return this.variant || this.accent || 'blue';
  }

  getIconStyle(): { [key: string]: string } {
    switch (this.effectiveAccent) {
      case 'violet':
        return { backgroundColor: 'var(--brand-violet-subtle)', color: 'var(--brand-violet)' };
      case 'success':
        return { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' };
      case 'warning':
        return { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' };
      case 'danger':
        return { backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' };
      case 'default':
        return { backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' };
      case 'blue':
      default:
        return { backgroundColor: 'var(--brand-blue-subtle)', color: 'var(--brand-blue)' };
    }
  }
}
