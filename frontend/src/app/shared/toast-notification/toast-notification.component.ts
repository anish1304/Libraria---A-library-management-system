import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container-custom" *ngIf="toastService.toasts().length > 0">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast-item-custom" 
           [ngClass]="'toast-' + toast.type">
        <div class="toast-icon">
          <i [class]="getIcon(toast.type)"></i>
        </div>
        <div class="toast-content flex-grow-1">
          <div class="toast-title fw-bold" *ngIf="toast.title">{{ toast.title }}</div>
          <div class="toast-message text-secondary small">{{ toast.message }}</div>
        </div>
        <button type="button" class="btn-close-toast" (click)="toastService.remove(toast.id)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-icon {
      font-size: 1.25rem;
      line-height: 1;
    }
    .toast-success .toast-icon { color: var(--color-success); }
    .toast-error .toast-icon { color: var(--color-danger); }
    .toast-warning .toast-icon { color: var(--color-warning); }
    .toast-info .toast-icon { color: var(--color-info); }

    .btn-close-toast {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0;
      line-height: 1;
    }
    .btn-close-toast:hover {
      color: var(--text-primary);
    }
  `]
})
export class ToastNotificationComponent {
  constructor(public toastService: ToastService) {}

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi bi-check-circle-fill';
      case 'error': return 'bi bi-x-circle-fill';
      case 'warning': return 'bi bi-exclamation-triangle-fill';
      case 'info':
      default: return 'bi bi-info-circle-fill';
    }
  }
}
