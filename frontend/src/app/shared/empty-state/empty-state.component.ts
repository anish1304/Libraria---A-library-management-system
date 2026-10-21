import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="empty-state-wrapper">
      <div class="empty-icon-circle">
        <i [class]="'bi ' + icon"></i>
      </div>
      <h5 class="empty-title">{{ title }}</h5>
      <p class="empty-message">{{ message }}</p>
      
      <div class="empty-action" *ngIf="actionText">
        <a *ngIf="actionLink" [routerLink]="actionLink" class="btn-saas-primary">
          <i class="bi bi-plus-lg me-1" *ngIf="showAddIcon"></i>
          {{ actionText }}
        </a>
        <button *ngIf="!actionLink" (click)="actionClick.emit()" class="btn-saas-primary">
          <i class="bi bi-plus-lg me-1" *ngIf="showAddIcon"></i>
          {{ actionText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-wrapper {
      padding: 3.5rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: var(--brand-blue-subtle);
      color: var(--brand-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 1.25rem;
    }
    .empty-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }
    .empty-message {
      font-size: 0.875rem;
      color: var(--text-secondary);
      max-width: 380px;
      margin-bottom: 1.5rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'bi-inbox';
  @Input() title: string = 'No records found';
  @Input() message: string = 'There is currently no data to display here.';
  @Input() actionText?: string;
  @Input() actionLink?: string;
  @Input() showAddIcon: boolean = true;
  @Output() actionClick = new EventEmitter<void>();
}
