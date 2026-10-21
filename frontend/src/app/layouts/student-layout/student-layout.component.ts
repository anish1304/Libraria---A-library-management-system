import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent, NavItem } from '../../shared/app-sidebar/app-sidebar.component';
import { AppHeaderComponent } from '../../shared/app-header/app-header.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppSidebarComponent, AppHeaderComponent],
  template: `
    <div class="saas-layout">
      <!-- Sidebar -->
      <app-sidebar 
        [isAdmin]="false"
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
          [category]="'Student Portal'"
          [isAdmin]="false"
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
export class StudentLayoutComponent {
  isSidebarCollapsed = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);
  currentPageTitle = signal<string>('Overview');

  navItems: NavItem[] = [
    { label: 'Overview', path: '/student/dashboard', icon: 'bi-grid-1x2', exact: true },
    { label: 'Book Catalogue', path: '/student/books', icon: 'bi-journal-bookmark' },
    { label: 'My Borrowings', path: '/student/my-loans', icon: 'bi-bookmark-check' },
    { label: 'Hold Reservations', path: '/student/reservations', icon: 'bi-hourglass-split' },
    { label: 'Wishlists & Shelves', path: '/student/reading-lists', icon: 'bi-heart' },
    { label: 'Plans & Subscriptions', path: '/student/subscriptions', icon: 'bi-gem', badge: 'PRO' },
    { label: 'Payments & Receipts', path: '/student/payments', icon: 'bi-credit-card-2-front' },
    { label: 'Loan History', path: '/student/history', icon: 'bi-clock-history' },
    { label: 'My Profile', path: '/student/profile', icon: 'bi-person-circle' },
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
    if (url.includes('/student/books')) this.currentPageTitle.set('Book Catalogue & Reviews');
    else if (url.includes('/student/my-loans') || url.includes('/student/my-books')) this.currentPageTitle.set('My Active Loans & Renewals');
    else if (url.includes('/student/reservations')) this.currentPageTitle.set('Hold Reservations & Queue');
    else if (url.includes('/student/reading-lists')) this.currentPageTitle.set('Curated Shelves & Wishlist');
    else if (url.includes('/student/subscriptions') || url.includes('/student/membership')) this.currentPageTitle.set('Membership Plans & Subscriptions');
    else if (url.includes('/student/payments') || url.includes('/student/fines')) this.currentPageTitle.set('Payments & Digital Receipts');
    else if (url.includes('/student/history')) this.currentPageTitle.set('Loan History');
    else if (url.includes('/student/profile')) this.currentPageTitle.set('Student Profile & Membership');
    else this.currentPageTitle.set('Student Overview');
  }
}
