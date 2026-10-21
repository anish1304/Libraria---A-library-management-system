import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationItem, NotificationType } from '../../models/libraria.models';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div class="drawer-backdrop" *ngIf="isOpen()" (click)="close()"></div>

    <!-- Drawer Panel -->
    <aside class="notification-drawer" [class.open]="isOpen()">
      <div class="drawer-header">
        <div class="d-flex align-items-center justify-content-between w-100">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-bell-fill text-primary"></i>
            <h6 class="mb-0 fw-bold">Notification Center</h6>
            <span class="badge bg-primary-subtle text-primary" *ngIf="unreadCount() > 0">
              {{ unreadCount() }} New
            </span>
          </div>
          <button type="button" class="btn-close-drawer" (click)="close()" title="Close Notifications">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="drawer-filters">
        <button 
          *ngFor="let tab of filterTabs" 
          type="button" 
          class="filter-pill"
          [class.active]="selectedTab() === tab.id"
          (click)="selectedTab.set(tab.id)">
          {{ tab.label }}
        </button>
      </div>

      <!-- Action Bar -->
      <div class="drawer-actions-bar" *ngIf="filteredNotifications().length > 0">
        <span class="small text-secondary">{{ filteredNotifications().length }} notification(s)</span>
        <button type="button" class="btn-text-action" (click)="markAllRead()">
          <i class="bi bi-check2-all me-1"></i> Mark all read
        </button>
      </div>

      <!-- Notifications List -->
      <div class="drawer-content">
        <div *ngIf="filteredNotifications().length === 0" class="drawer-empty">
          <div class="empty-icon-circle">
            <i class="bi bi-bell-slash"></i>
          </div>
          <div class="fw-semibold text-primary mt-2">All caught up!</div>
          <div class="small text-secondary">No {{ selectedTab() === 'all' ? '' : selectedTab() }} notifications at this time.</div>
        </div>

        <div 
          *ngFor="let notif of filteredNotifications()" 
          class="notif-card"
          [class.unread]="!notif.is_read"
          (click)="onNotificationClick(notif)">
          <div class="notif-type-icon" [ngClass]="getBadgeClass(notif.type)">
            <i [class]="getIconClass(notif.type)"></i>
          </div>
          <div class="notif-body">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="notif-title">{{ notif.title }}</span>
              <span class="notif-time">{{ notif.timestamp }}</span>
            </div>
            <p class="notif-msg">{{ notif.message }}</p>
            <div class="d-flex align-items-center justify-content-between mt-2">
              <span class="notif-chip" [ngClass]="getChipClass(notif.type)">{{ notif.type | uppercase }}</span>
              <span class="notif-link-hint" *ngIf="notif.link">
                View Details <i class="bi bi-arrow-right small"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="drawer-footer">
        <div class="small text-secondary">
          <i class="bi bi-shield-check text-success me-1"></i> Live institutional alerts
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 16, 32, 0.70);
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      z-index: 1040;
    }
    .notification-drawer {
      position: fixed;
      top: 0;
      right: -420px;
      width: 400px;
      max-width: 90vw;
      height: 100vh;
      background: var(--bg-sidebar);
      backdrop-filter: var(--glass-blur-heavy);
      -webkit-backdrop-filter: var(--glass-blur-heavy);
      border-left: 1px solid var(--border-subtle);
      z-index: 1045;
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 35px rgba(0, 0, 0, 0.35);
      transition: right 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .notification-drawer.open {
      right: 0;
    }
    .drawer-header {
      padding: 1.25rem 1.25rem 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .btn-close-drawer {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-xs);
    }
    .btn-close-drawer:hover {
      color: var(--text-primary);
      background: var(--bg-surface-hover);
    }
    .drawer-filters {
      display: flex;
      gap: 0.35rem;
      padding: 0.75rem 1.25rem;
      overflow-x: auto;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface-hover);
    }
    .filter-pill {
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      border-radius: var(--radius-pill);
      padding: 3px 10px;
      font-size: 0.725rem;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s;
    }
    .filter-pill:hover {
      border-color: var(--brand-blue);
      color: var(--brand-blue);
    }
    .filter-pill.active {
      background: var(--brand-blue);
      border-color: var(--brand-blue);
      color: #FFFFFF;
    }
    .drawer-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-surface);
    }
    .btn-text-action {
      background: none;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--brand-blue);
      cursor: pointer;
      padding: 0;
    }
    .btn-text-action:hover {
      text-decoration: underline;
    }
    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .notif-card {
      display: flex;
      gap: 0.85rem;
      padding: 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }
    .notif-card:hover {
      border-color: var(--brand-blue);
      background: var(--bg-surface-hover);
    }
    .notif-card.unread {
      background: var(--brand-blue-subtle);
      border-left: 3px solid var(--brand-blue);
    }
    .notif-type-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.95rem;
    }
    .notif-icon-loan { background: rgba(49, 87, 213, 0.12); color: var(--brand-blue); }
    .notif-icon-due { background: rgba(217, 151, 36, 0.12); color: var(--color-warning); }
    .notif-icon-overdue { background: rgba(216, 76, 90, 0.12); color: var(--color-danger); }
    .notif-icon-reservation { background: rgba(115, 87, 232, 0.12); color: var(--brand-violet); }
    .notif-icon-system { background: rgba(39, 117, 199, 0.12); color: var(--color-info); }

    .notif-body {
      flex: 1;
      min-width: 0;
    }
    .notif-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .notif-time {
      font-size: 0.7rem;
      color: var(--text-tertiary);
    }
    .notif-msg {
      font-size: 0.785rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }
    .notif-chip {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .chip-loan { background: rgba(49, 87, 213, 0.1); color: var(--brand-blue); }
    .chip-due { background: rgba(217, 151, 36, 0.1); color: var(--color-warning); }
    .chip-overdue { background: rgba(216, 76, 90, 0.1); color: var(--color-danger); }
    .chip-reservation { background: rgba(115, 87, 232, 0.1); color: var(--brand-violet); }
    .chip-system { background: rgba(39, 117, 199, 0.1); color: var(--color-info); }

    .notif-link-hint {
      font-size: 0.725rem;
      font-weight: 600;
      color: var(--brand-blue);
    }
    .drawer-empty {
      padding: 4rem 1rem;
      text-align: center;
    }
    .empty-icon-circle {
      width: 54px;
      height: 54px;
      margin: 0 auto;
      border-radius: 50%;
      background: var(--bg-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: 1.5rem;
    }
    .drawer-footer {
      padding: 0.85rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-surface-hover);
    }
  `]
})
export class NotificationDrawerComponent {
  isOpen = signal(false);
  selectedTab = signal<string>('all');

  filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'loan', label: 'Loans' },
    { id: 'due', label: 'Due Reminders' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'reservation', label: 'Reservations' },
    { id: 'system', label: 'System' }
  ];

  private mockData = inject(MockDataService);
  private auth = inject(AuthService);
  private router = inject(Router);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  filteredNotifications() {
    const user = this.auth.currentUser();
    const all = this.mockData.notifications();
    // Filter for current user or broad role
    const forUser = all.filter(n => {
      if (n.recipient_role === 'all') return true;
      if (user && n.recipient_id === user.id) return true;
      if (user && n.recipient_role === user.role) return true;
      if (!user && n.recipient_role === 'student') return true;
      return false;
    });

    const tab = this.selectedTab();
    if (tab === 'all') return forUser;
    return forUser.filter(n => n.type === tab);
  }

  unreadCount(): number {
    return this.filteredNotifications().filter(n => !n.is_read).length;
  }

  markAllRead() {
    const user = this.auth.currentUser();
    this.mockData.markAllNotificationsAsRead(user?.id);
  }

  onNotificationClick(notif: NotificationItem) {
    this.mockData.markNotificationAsRead(notif.id);
    if (notif.link) {
      this.close();
      this.router.navigate([notif.link]);
    }
  }

  getBadgeClass(type: NotificationType) {
    return `notif-icon-${type}`;
  }

  getChipClass(type: NotificationType) {
    return `chip-${type}`;
  }

  getIconClass(type: NotificationType) {
    switch (type) {
      case 'loan': return 'bi-arrow-left-right';
      case 'due': return 'bi-clock-alert';
      case 'overdue': return 'bi-exclamation-triangle-fill';
      case 'reservation': return 'bi-bookmark-check-fill';
      case 'system': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }
}
