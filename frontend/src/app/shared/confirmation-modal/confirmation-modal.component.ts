import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop-custom" (click)="onBackdropClick($event)">
      <div class="modal-dialog-custom">
        <div class="modal-header-custom">
          <div class="d-flex align-items-center gap-2">
            <div class="confirm-icon-box" [ngClass]="isDanger ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'">
              <i [class]="'bi ' + (isDanger ? 'bi-exclamation-triangle' : 'bi-question-circle')"></i>
            </div>
            <h5 class="mb-0 fw-bold">{{ title }}</h5>
          </div>
          <button type="button" class="btn-close-custom" (click)="cancel.emit()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body-custom">
          <p class="mb-0 text-secondary">{{ message }}</p>
        </div>

        <div class="modal-footer-custom">
          <button type="button" class="btn-saas-secondary" (click)="cancel.emit()">
            {{ cancelText }}
          </button>
          <button type="button" [class]="isDanger ? 'btn-saas-danger' : 'btn-saas-primary'" (click)="confirm.emit()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-icon-box {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .btn-close-custom {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color var(--transition-fast);
    }
    .btn-close-custom:hover {
      color: var(--text-primary);
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.cancel.emit();
    }
  }
}
