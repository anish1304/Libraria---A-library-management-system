import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge-status" [ngClass]="getBadgeClass()">
      <span class="badge-dot"></span>
      <span>{{ text || status }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: string = '';
  @Input() text?: string;
  @Input() type?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | string;

  getBadgeClass(): string {
    if (this.type) {
      return `badge-${this.type}`;
    }
    const s = (this.status || '').toLowerCase().trim();
    if (s === 'available' || s === 'returned' || s === 'active' || s === 'on time' || s === 'paid' || s === 'ready for pickup') {
      return 'badge-success';
    }
    if (s === 'overdue' || s === 'inactive' || s === 'out of stock' || s === 'deleted' || s === 'cancelled' || s === 'pending') {
      return 'badge-danger';
    }
    if (s === 'issued' || s === 'in transit' || s === 'borrowed' || s === 'waiting') {
      return 'badge-warning';
    }
    return 'badge-info';
  }
}
