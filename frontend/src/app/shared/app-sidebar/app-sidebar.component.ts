import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { AuthService } from '../../services/auth.service';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BrandLogoComponent],
  template: `
    <!-- Mobile Backdrop -->
    <div class="sidebar-backdrop d-lg-none" *ngIf="isMobileOpen" (click)="closeMobile.emit()"></div>

    <!-- Sidebar Element -->
    <aside class="saas-sidebar" [class.mobile-open]="isMobileOpen" [class.collapsed]="isCollapsed">
      <!-- Brand Header -->
      <div class="sidebar-brand-box">
        <app-brand-logo [variant]="isCollapsed ? 'compact' : 'default'" [showTagline]="false" [linkUrl]="isAdmin ? '/admin/dashboard' : '/student/dashboard'"></app-brand-logo>
      </div>

      <!-- Navigation Links -->
      <div class="sidebar-nav-scroll">
        <div class="nav-section-label" *ngIf="!isCollapsed">
          {{ isAdmin ? 'MANAGEMENT WORKSPACE' : 'STUDENT PORTAL' }}
        </div>

        <nav class="nav-links-list">
          <a *ngFor="let item of navItems" 
             [routerLink]="item.path" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
             class="nav-link-item"
             [title]="isCollapsed ? item.label : ''"
             (click)="onLinkClick()">
            <div class="nav-icon">
              <i [class]="'bi ' + item.icon"></i>
            </div>
            <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="!isCollapsed && item.badge">{{ item.badge }}</span>
          </a>
        </nav>
      </div>

      <!-- Footer User Block -->
      <div class="sidebar-footer-box">
        <div class="user-info-card" *ngIf="!isCollapsed">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="avatar-initials avatar-sm" [class.avatar-student]="!isAdmin">
              {{ getInitials() }}
            </div>
            <div class="user-details overflow-hidden">
              <div class="user-name text-truncate fw-bold">{{ getDisplayName() }}</div>
              <div class="user-role text-truncate">{{ isAdmin ? 'Admin' : 'Student' }}</div>
            </div>
          </div>
          <button type="button" class="btn-logout-sidebar" (click)="logout()">
            <i class="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>

        <!-- Collapsed Logout Button -->
        <button *ngIf="isCollapsed" type="button" class="btn-icon-custom w-100 text-danger" (click)="logout()" title="Sign Out">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-brand-box {
      height: var(--header-height);
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .sidebar-nav-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 0.85rem;
    }
    .nav-section-label {
      font-size: 0.675rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      padding: 0 0.65rem 0.65rem 0.65rem;
    }
    .nav-links-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .nav-link-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all var(--transition-fast);
      position: relative;
    }
    .nav-link-item:hover {
      background-color: var(--bg-surface-hover);
      color: var(--text-primary);
    }
    .nav-link-item.active {
      background-color: var(--brand-blue-subtle);
      color: var(--brand-blue-hover);
      border: 1px solid rgba(129, 140, 248, 0.25);
    }
    .nav-link-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 18%;
      height: 64%;
      width: 3.5px;
      border-radius: 0 3px 3px 0;
      background-color: var(--brand-blue-hover);
      box-shadow: 0 0 10px var(--brand-blue-hover);
    }
    .nav-icon {
      font-size: 1.15rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
    }
    .nav-badge {
      margin-left: auto;
      font-size: 0.7rem;
      background-color: var(--border-subtle);
      color: var(--text-secondary);
      padding: 2px 6px;
      border-radius: var(--radius-pill);
      font-weight: 700;
    }
    .sidebar-footer-box {
      padding: 1rem 0.85rem;
      border-top: 1px solid var(--border-subtle);
      flex-shrink: 0;
      background-color: rgba(255, 255, 255, 0.02);
    }
    .user-info-card {
      background-color: var(--bg-surface);
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
    }
    .avatar-sm {
      width: 32px;
      height: 32px;
      font-size: 0.775rem;
    }
    .user-name {
      font-size: 0.825rem;
      color: var(--text-primary);
      line-height: 1.15;
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--text-tertiary);
    }
    .btn-logout-sidebar {
      width: 100%;
      background: var(--color-danger-bg);
      border: 1px solid var(--color-danger-border);
      border-radius: var(--radius-xs);
      color: var(--color-danger);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem;
      transition: all var(--transition-fast);
      cursor: pointer;
    }
    .btn-logout-sidebar:hover {
      background-color: var(--color-danger);
      color: #FFFFFF;
      border-color: var(--color-danger);
    }
  `]
})
export class AppSidebarComponent {
  @Input() isAdmin: boolean = true;
  @Input() isCollapsed: boolean = false;
  @Input() isMobileOpen: boolean = false;
  @Input() navItems: NavItem[] = [];

  @Output() closeMobile = new EventEmitter<void>();

  constructor(public auth: AuthService) {}

  onLinkClick() {
    this.closeMobile.emit();
  }

  getDisplayName(): string {
    const user = this.auth.currentUser();
    if (this.isAdmin) {
      return user?.username ? `@${user.username}` : 'Administrator';
    }
    return user?.student_name || user?.username || 'Student';
  }

  getInitials(): string {
    const name = this.getDisplayName().replace('@', '');
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
