import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent, NavItem } from '../../shared/app-sidebar/app-sidebar.component';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppSidebarComponent, AppHeaderComponent],
  template: `
    <div class="saas-layout">
      <!-- Sidebar -->
      <app-sidebar 
        [isAdmin]="true"
        [isCollapsed]="isSidebarCollapsed()"
        [isMobileOpen]="isMobileSidebarOpen()"
        [navItems]="navItems"
        (closeMobile)="isMobileSidebarOpen.set(false)">
      </app-sidebar>

      <!-- Main Shell Container -->
      <div class="saas-main-container" [class.sidebar-collapsed]="isSidebarCollapsed()">
        <!-- Header -->
        <app-header 
          [pageTitle]="currentPageTitle()"
          [category]="'Admin Workspace'"
          [isAdmin]="true"
          (toggleSidebar)="onToggleSidebar()">
        </app-header>

        <!-- Route Content -->
        <main class="saas-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  isSidebarCollapsed = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);
  currentPageTitle = signal<string>('Dashboard');

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2', exact: true },
    { label: 'Book Collection', path: '/admin/books', icon: 'bi-book' },
    { label: 'Libraries', path: '/admin/libraries', icon: 'bi-building' },
    { label: 'Student Directory', path: '/admin/students', icon: 'bi-people' },
    { label: 'Issue & Return', path: '/admin/loans', icon: 'bi-arrow-left-right' },
    { label: 'Hold Reservations', path: '/admin/reservations', icon: 'bi-hourglass-split' },
    { label: 'Fines & Payments', path: '/admin/fines', icon: 'bi-cash-coin' },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: 'bi-file-earmark-bar-graph' },
    { label: 'Audit History', path: '/admin/transactions', icon: 'bi-clock-history' },
    { label: 'Settings', path: '/admin/settings', icon: 'bi-gear' },
  ];

  constructor(private router: Router) {
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
      this.isMobileSidebarOpen.set(false);
    });
  }

  onToggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 992) {
      this.isMobileSidebarOpen.update(v => !v);
    } else {
      this.isSidebarCollapsed.update(v => !v);
    }
  }

  private updateTitle(url: string) {
    if (url.includes('/admin/books/new')) this.currentPageTitle.set('Add New Book');
    else if (url.includes('/admin/books/edit')) this.currentPageTitle.set('Edit Book');
    else if (url.includes('/admin/books')) this.currentPageTitle.set('Book Inventory');
    else if (url.includes('/admin/libraries')) this.currentPageTitle.set('Library Branches');
    else if (url.includes('/admin/students/new')) this.currentPageTitle.set('Register Student');
    else if (url.includes('/admin/students/edit')) this.currentPageTitle.set('Edit Student');
    else if (url.includes('/admin/students')) this.currentPageTitle.set('Student Directory');
    else if (url.includes('/admin/loans') || url.includes('/admin/issue-return')) this.currentPageTitle.set('Issue & Return Workspace');
    else if (url.includes('/admin/reservations')) this.currentPageTitle.set('Hold Reservations & Waitlist');
    else if (url.includes('/admin/fines')) this.currentPageTitle.set('Fines & Digital Payments');
    else if (url.includes('/admin/reports')) this.currentPageTitle.set('Reports & Circulation Analytics');
    else if (url.includes('/admin/transactions')) this.currentPageTitle.set('Transaction Audit History');
    else if (url.includes('/admin/settings')) this.currentPageTitle.set('System Configuration');
    else this.currentPageTitle.set('Executive Dashboard');
  }
}
