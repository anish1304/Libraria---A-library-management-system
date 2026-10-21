import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="saas-header">
      <div class="d-flex align-items-center gap-3">
        <!-- Sidebar Toggle -->
        <button type="button" class="btn-icon-custom" (click)="toggleSidebar.emit()" title="Toggle Navigation">
          <i class="bi bi-list fs-5"></i>
        </button>

        <!-- Page Context & Breadcrumb -->
        <div class="d-flex flex-column">
          <div class="breadcrumbs-text small text-secondary" *ngIf="category">
            <span>{{ category }}</span>
            <i class="bi bi-chevron-right mx-1 small"></i>
            <span class="text-primary fw-medium">{{ pageTitle }}</span>
          </div>
          <h5 class="mb-0 fw-bold header-title" *ngIf="!category">{{ pageTitle }}</h5>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="d-flex align-items-center gap-3">
        <!-- Theme Toggle -->
        <button type="button" 
                class="btn-icon-custom theme-toggle-btn" 
                (click)="themeService.toggleTheme()" 
                [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'">
          <i [class]="themeService.isDark() ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill'"></i>
        </button>

        <!-- User Profile Pill -->
        <div class="user-profile-badge d-flex align-items-center gap-2">
          <div class="avatar-initials" [class.avatar-student]="!isAdmin">
            {{ getInitials() }}
          </div>
          <div class="d-none d-md-flex flex-column text-start">
            <span class="fw-bold small user-display-name">{{ getDisplayName() }}</span>
            <span class="role-badge-text">{{ isAdmin ? 'Administrator' : 'Student Member' }}</span>
          </div>
        </div>

        <!-- Quick Logout Action -->
        <button type="button" class="btn-icon-custom text-danger" (click)="logout()" title="Sign Out">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header-title {
      font-size: 1.15rem;
      letter-spacing: -0.01em;
    }
    .breadcrumbs-text {
      font-size: 0.775rem;
    }
    .user-profile-badge {
      background: var(--bg-surface);
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 4px 12px 4px 4px;
      box-shadow: var(--shadow-xs);
    }
    .user-display-name {
      color: var(--text-primary);
      line-height: 1.1;
    }
    .role-badge-text {
      font-size: 0.675rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
  `]
})
export class AppHeaderComponent {
  @Input() pageTitle: string = 'Workspace';
  @Input() category?: string;
  @Input() isAdmin: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public themeService: ThemeService, public auth: AuthService) {}

  getDisplayName(): string {
    const user = this.auth.currentUser();
    if (this.isAdmin) {
      return user?.username ? `@${user.username}` : 'Admin';
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
