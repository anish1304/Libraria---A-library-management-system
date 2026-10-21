import { Component, EventEmitter, HostListener, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface SearchResult {
  category: 'Navigation' | 'Book Catalog' | 'Member' | 'Role Switch';
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cmd-overlay" *ngIf="isOpen()" (click)="close()">
      <div class="cmd-modal" (click)="$event.stopPropagation()">
        <!-- Header search input -->
        <div class="cmd-search-box">
          <i class="bi bi-search cmd-search-icon"></i>
          <input 
            #cmdInput
            type="text" 
            class="cmd-input" 
            placeholder="Type a command, search titles, members, or press Esc to close..." 
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange()"
            autofocus>
          <span class="cmd-badge">ESC</span>
        </div>

        <!-- Results body -->
        <div class="cmd-results">
          <div *ngIf="filteredResults().length === 0" class="cmd-empty">
            <i class="bi bi-slash-circle mb-2 fs-3 text-secondary"></i>
            <div>No matching actions, books, or members found for "{{ query }}"</div>
          </div>

          <div *ngFor="let group of groupedResults(); let gIndex = index" class="cmd-group">
            <div class="cmd-group-title">{{ group.category }}</div>
            <div 
              *ngFor="let item of group.items; let iIndex = index" 
              class="cmd-item"
              [class.active]="isSelected(group.category, iIndex)"
              (click)="execute(item)">
              <div class="cmd-item-icon">
                <i [class]="'bi ' + item.icon"></i>
              </div>
              <div class="cmd-item-details">
                <div class="cmd-item-title">{{ item.title }}</div>
                <div class="cmd-item-subtitle">{{ item.subtitle }}</div>
              </div>
              <i class="bi bi-arrow-return-left cmd-item-enter"></i>
            </div>
          </div>
        </div>

        <!-- Footer helper -->
        <div class="cmd-footer">
          <div class="d-flex align-items-center gap-3">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>ESC</kbd> to exit</span>
          </div>
          <div class="cmd-brand">LIBRARIA Spotlight</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cmd-overlay {
      position: fixed;
      inset: 0;
      background: rgba(11, 16, 32, 0.72);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      z-index: 1050;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 10vh;
      animation: fadeIn 0.15s ease-out;
    }
    .cmd-modal {
      background: var(--bg-page-elevated);
      backdrop-filter: var(--glass-blur-heavy);
      -webkit-backdrop-filter: var(--glass-blur-heavy);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 640px;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 75vh;
    }
    .cmd-search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .cmd-search-icon {
      font-size: 1.15rem;
      color: var(--brand-blue);
    }
    .cmd-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 500;
    }
    .cmd-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--bg-surface-hover);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
    }
    .cmd-results {
      padding: 0.75rem 0.5rem;
      overflow-y: auto;
      flex: 1;
    }
    .cmd-group {
      margin-bottom: 0.75rem;
    }
    .cmd-group-title {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      padding: 0.35rem 0.75rem;
    }
    .cmd-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 0.1s ease;
    }
    .cmd-item:hover, .cmd-item.active {
      background: var(--brand-blue-subtle);
    }
    .cmd-item-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: var(--bg-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand-blue);
      font-size: 1rem;
      flex-shrink: 0;
    }
    .cmd-item-details {
      flex: 1;
      min-width: 0;
    }
    .cmd-item-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cmd-item-subtitle {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cmd-item-enter {
      color: var(--text-tertiary);
      font-size: 0.85rem;
      opacity: 0;
      transition: opacity 0.1s;
    }
    .cmd-item:hover .cmd-item-enter {
      opacity: 1;
    }
    .cmd-empty {
      padding: 2.5rem 1rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .cmd-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 1.25rem;
      background: var(--bg-surface-hover);
      border-top: 1px solid var(--border-subtle);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    kbd {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.7rem;
    }
    .cmd-brand {
      font-weight: 600;
      color: var(--brand-blue);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CommandPaletteComponent {
  isOpen = signal(false);
  query: string = '';
  filteredResults = signal<SearchResult[]>([]);

  private router = inject(Router);
  private mockData = inject(MockDataService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  }

  open() {
    this.isOpen.set(true);
    this.query = '';
    this.buildResults();
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  onQueryChange() {
    this.buildResults();
  }

  private buildResults() {
    const q = this.query.trim().toLowerCase();
    const results: SearchResult[] = [];
    const isAdmin = this.auth.isAdmin();

    // 1. Navigation items based on role
    const navs = isAdmin ? [
      { title: 'Admin Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2', sub: 'Executive metrics & widgets' },
      { title: 'Catalogue & Copies', path: '/admin/books', icon: 'bi-book', sub: 'Title inventory & accession copies' },
      { title: 'Circulation Desk', path: '/admin/loans', icon: 'bi-arrow-left-right', sub: 'Quick issue & return workflows' },
      { title: 'Reservations & Waitlists', path: '/admin/reservations', icon: 'bi-bookmark-check', sub: 'Queue holds & collection pickup' },
      { title: 'Fines & Penalties', path: '/admin/fines', icon: 'bi-cash-coin', sub: 'Overdue penalties & fee settlements' },
      { title: 'Analytics & Reports', path: '/admin/reports', icon: 'bi-graph-up-arrow', sub: '9 report types with CSV export' },
      { title: 'Bulk CSV Import', path: '/admin/import', icon: 'bi-file-earmark-arrow-up', sub: 'Client-side data wizard' },
      { title: 'Student & Member Directory', path: '/admin/students', icon: 'bi-people', sub: 'Accounts & borrowing privileges' },
      { title: 'Library Branches', path: '/admin/libraries', icon: 'bi-building', sub: 'Branch locations & facilities' },
      { title: 'Audit History', path: '/admin/transactions', icon: 'bi-clock-history', sub: 'Operational activity timeline' },
      { title: 'Settings & Policies', path: '/admin/settings', icon: 'bi-gear', sub: 'Loan duration, fines & demo reset' },
    ] : [
      { title: 'Student Dashboard', path: '/student/dashboard', icon: 'bi-grid-1x2', sub: 'Reading progress & due items' },
      { title: 'Book Catalogue & Discovery', path: '/student/books', icon: 'bi-search', sub: 'Explore collection & reserve books' },
      { title: 'My Active Loans', path: '/student/my-loans', icon: 'bi-journal-bookmark', sub: 'Renewals & due date countdowns' },
      { title: 'My Reservations', path: '/student/reservations', icon: 'bi-bookmark-star', sub: 'Hold queue positions & pickups' },
      { title: 'Reading Lists', path: '/student/reading-lists', icon: 'bi-card-checklist', sub: 'Personal collections & favorites' },
      { title: 'Borrowing History', path: '/student/history', icon: 'bi-clock-history', sub: 'Past returned books' },
      { title: 'Member Profile', path: '/student/profile', icon: 'bi-person-circle', sub: 'Account info & preferences' },
    ];

    navs.forEach(n => {
      if (!q || n.title.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q)) {
        results.push({
          category: 'Navigation',
          title: n.title,
          subtitle: n.sub,
          icon: n.icon,
          action: () => this.navigate(n.path)
        });
      }
    });

    // 2. Books search
    const books = this.mockData.books();
    books.forEach(b => {
      if (q && (b.title.toLowerCase().includes(q) || b.isbn.includes(q) || b.authors.some(a => a.toLowerCase().includes(q)))) {
        results.push({
          category: 'Book Catalog',
          title: b.title,
          subtitle: `By ${b.authors.join(', ')} • ${b.available_copies} of ${b.total_copies} available • ${b.library_name}`,
          icon: 'bi-book-half',
          action: () => {
            if (isAdmin) {
              this.navigate(`/admin/books`);
            } else {
              this.navigate(`/student/books`);
            }
          }
        });
      }
    });

    // 3. Members search (for staff)
    if (isAdmin && q) {
      const users = this.mockData.users();
      users.forEach(u => {
        if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.student_id_no && u.student_id_no.toLowerCase().includes(q))) {
          results.push({
            category: 'Member',
            title: u.name,
            subtitle: `${u.role_display} • ${u.email} • ID: ${u.student_id_no || u.id}`,
            icon: 'bi-person-badge',
            action: () => this.navigate(`/admin/students`)
          });
        }
      });
    }

    // 4. Quick Demo Role Switcher
    const roles: { role: 'admin' | 'librarian' | 'faculty' | 'student'; name: string; title: string; route: string }[] = [
      { role: 'admin', name: 'Dr. Arthur Pendelton', title: 'Super Administrator', route: '/admin/dashboard' },
      { role: 'librarian', name: 'Elena Rostova, MLS', title: 'Librarian (Head Cataloguer)', route: '/admin/dashboard' },
      { role: 'faculty', name: 'Prof. David K. Sterling', title: 'Faculty Member', route: '/student/dashboard' },
      { role: 'student', name: 'Alexandria Morgan', title: 'Student Scholar', route: '/student/dashboard' },
    ];

    roles.forEach(r => {
      if (!q || r.name.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || 'switch role'.includes(q)) {
        results.push({
          category: 'Role Switch',
          title: `Switch to ${r.name}`,
          subtitle: `Demo Role: ${r.title}`,
          icon: 'bi-arrow-repeat',
          action: () => {
            this.auth.demoLoginAs(r.role);
            this.toast.show(`Switched to demo role: ${r.title}`, 'success');
            this.navigate(r.route);
          }
        });
      }
    });

    this.filteredResults.set(results.slice(0, 15));
  }

  groupedResults() {
    const list = this.filteredResults();
    const categories: ('Navigation' | 'Book Catalog' | 'Member' | 'Role Switch')[] = [
      'Navigation',
      'Book Catalog',
      'Member',
      'Role Switch'
    ];
    const groups: { category: string; items: SearchResult[] }[] = [];

    categories.forEach(cat => {
      const items = list.filter(i => i.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    });
    return groups;
  }

  isSelected(cat: string, index: number) {
    return false; // dynamic hover is used
  }

  execute(item: SearchResult) {
    this.close();
    item.action();
  }

  private navigate(path: string) {
    this.router.navigate([path]);
  }
}
