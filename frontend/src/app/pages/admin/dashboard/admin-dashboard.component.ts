import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
import { LoanService, Loan } from '../../../services/loan.service';
import { AuthService } from '../../../services/auth.service';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    StatCardComponent, 
    StatusBadgeComponent, 
    LoadingSkeletonComponent
  ],
  template: `
    <div class="admin-dashboard-page">
      <!-- Welcome Hero Area -->
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <div class="text-secondary small fw-bold text-uppercase tracking-wider">
            <i class="bi bi-calendar3 me-1"></i> {{ currentDate }}
          </div>
          <h2 class="fw-bold mb-1">{{ greeting }}, {{ auth.currentUser()?.username || 'Administrator' }}</h2>
          <p class="text-secondary mb-0">Here is your institutional collection and circulation overview for today.</p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="d-flex flex-wrap gap-2">
          <a routerLink="/admin/books/new" class="btn-saas-secondary">
            <i class="bi bi-journal-plus"></i>
            <span>Add Book</span>
          </a>
          <a routerLink="/admin/students/new" class="btn-saas-secondary">
            <i class="bi bi-person-plus"></i>
            <span>Add Student</span>
          </a>
          <a routerLink="/admin/loans" class="btn-saas-primary">
            <i class="bi bi-arrow-left-right"></i>
            <span>Issue / Return Book</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()">
        <app-loading-skeleton type="cards" [count]="6"></app-loading-skeleton>
      </div>

      <!-- KPI Metrics Cards Grid -->
      <div *ngIf="!loading() && stats()" class="row g-3 mb-4">
        <div class="col-xl-2 col-md-4 col-sm-6">
          <app-stat-card 
            label="Total Books" 
            [value]="stats()!.total_books" 
            icon="bi-book" 
            accent="blue" 
            caption="In catalog">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-sm-6">
          <app-stat-card 
            label="Available Copies" 
            [value]="stats()!.available_copies" 
            icon="bi-check-circle" 
            accent="success" 
            caption="Ready for loan">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-sm-6">
          <app-stat-card 
            label="Total Students" 
            [value]="stats()!.total_students" 
            icon="bi-people" 
            accent="violet" 
            caption="Active readers">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-sm-6">
          <app-stat-card 
            label="Total Libraries" 
            [value]="stats()!.total_libraries" 
            icon="bi-building" 
            accent="blue" 
            caption="Campus branches">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-sm-6">
          <app-stat-card 
            label="Currently Issued" 
            [value]="stats()!.issued_books" 
            icon="bi-arrow-up-right-circle" 
            accent="warning" 
            caption="Active borrowings">
          </app-stat-card>
        </div>
        <div class="col-xl-2 col-md-4 col-sm-6">
          <app-stat-card 
            label="Overdue Books" 
            [value]="stats()!.overdue_books" 
            icon="bi-exclamation-triangle" 
            accent="danger" 
            caption="Requires attention">
          </app-stat-card>
        </div>
      </div>

      <!-- Analytics & Visual Distribution Row -->
      <div class="row g-4 mb-4" *ngIf="!loading() && stats()">
        <!-- Visual Circulation Status Bar -->
        <div class="col-lg-7">
          <div class="saas-card h-100">
            <div class="saas-card-header">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-pie-chart text-primary"></i>
                <h6 class="mb-0 fw-bold">Inventory & Circulation Balance</h6>
              </div>
              <span class="text-secondary small">Total Inventory: {{ stats()!.available_copies + stats()!.issued_books }}</span>
            </div>
            <div class="saas-card-body">
              <!-- Visual Multi-segment Progress Bar -->
              <div class="circulation-bar-container mb-3">
                <div class="segment-available" [style.width.%]="getAvailablePercent()" title="Available Copies"></div>
                <div class="segment-issued" [style.width.%]="getIssuedPercent()" title="Issued Copies"></div>
                <div class="segment-overdue" [style.width.%]="getOverduePercent()" title="Overdue Copies"></div>
              </div>

              <!-- Legends -->
              <div class="row g-3 text-center pt-2">
                <div class="col-4">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="legend-dot bg-success"></span>
                    <span class="small fw-semibold">Available: {{ stats()!.available_copies }}</span>
                  </div>
                  <span class="text-secondary small">{{ getAvailablePercent() | number:'1.0-0' }}%</span>
                </div>
                <div class="col-4">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="legend-dot bg-warning"></span>
                    <span class="small fw-semibold">On Loan: {{ stats()!.issued_books }}</span>
                  </div>
                  <span class="text-secondary small">{{ getIssuedPercent() | number:'1.0-0' }}%</span>
                </div>
                <div class="col-4">
                  <div class="d-flex align-items-center justify-content-center gap-2">
                    <span class="legend-dot bg-danger"></span>
                    <span class="small fw-semibold">Overdue: {{ stats()!.overdue_books }}</span>
                  </div>
                  <span class="text-secondary small">{{ getOverduePercent() | number:'1.0-0' }}%</span>
                </div>
              </div>

              <!-- Workflow Hint Callout -->
              <div class="callout-hint mt-4 p-3 rounded d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-info-circle-fill text-primary"></i>
                  <span class="small text-secondary">Need to process borrowings or receive books back into stock?</span>
                </div>
                <a routerLink="/admin/loans" class="btn-saas-primary btn-sm py-1">
                  Open Circulation Desk
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Overdue Alert Panel -->
        <div class="col-lg-5">
          <div class="saas-card h-100">
            <div class="saas-card-header">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-bell text-danger"></i>
                <h6 class="mb-0 fw-bold">Overdue Attention Items</h6>
              </div>
              <span class="badge bg-danger-subtle text-danger small fw-bold">
                {{ overdueList().length }} Overdue
              </span>
            </div>
            <div class="saas-card-body p-0">
              <div *ngIf="overdueList().length === 0" class="p-4 text-center">
                <i class="bi bi-check-circle-fill text-success fs-3 mb-2 d-block"></i>
                <h6 class="fw-bold mb-1">All Loans On Schedule</h6>
                <p class="text-secondary small mb-0">No overdue borrowings detected in the system.</p>
              </div>

              <div *ngIf="overdueList().length > 0" class="list-group list-group-flush">
                <div *ngFor="let item of overdueList().slice(0, 4)" class="list-group-item d-flex align-items-center justify-content-between p-3">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar-initials avatar-sm" style="background: var(--color-danger-bg); color: var(--color-danger);">
                      <i class="bi bi-exclamation"></i>
                    </div>
                    <div>
                      <div class="fw-bold small text-truncate" style="max-width: 180px;">{{ item.book_title }}</div>
                      <div class="text-secondary small">{{ item.student_name }} (ID: {{ item.student_id_no }})</div>
                    </div>
                  </div>
                  <a routerLink="/admin/loans" class="btn-saas-secondary btn-sm py-1 px-2 text-danger">
                    Process Return
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Circulation Activity Table -->
      <div class="saas-card">
        <div class="saas-card-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-clock-history text-primary"></i>
            <h6 class="mb-0 fw-bold">Recent Circulation Activity</h6>
          </div>
          <a routerLink="/admin/transactions" class="btn-saas-secondary btn-sm py-1 px-3">
            View All Transactions <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        <div class="saas-card-body p-0">
          <div *ngIf="recentLoans().length === 0" class="p-4 text-center">
            <p class="text-secondary mb-0">No recent transactions recorded.</p>
          </div>

          <div class="table-responsive" *ngIf="recentLoans().length > 0">
            <table class="saas-table mb-0">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrower</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of recentLoans().slice(0, 5)">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="book-cover-mock" style="width: 26px; height: 36px; font-size: 0.6rem;">BK</div>
                      <div>
                        <div class="fw-bold small">{{ loan.book_title }}</div>
                        <div class="text-secondary small" style="font-size: 0.75rem;">{{ loan.book_author }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="fw-semibold small">{{ loan.student_name }}</div>
                    <div class="text-secondary" style="font-size: 0.75rem;">ID: {{ loan.student_id_no }}</div>
                  </td>
                  <td>{{ loan.issue_date | date:'mediumDate' }}</td>
                  <td [class.text-danger]="loan.is_overdue">{{ loan.due_date | date:'mediumDate' }}</td>
                  <td>
                    <app-status-badge 
                      [status]="loan.is_overdue ? 'Overdue' : loan.status"
                      [text]="loan.is_overdue ? 'Overdue' : loan.status">
                    </app-status-badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .circulation-bar-container {
      height: 14px;
      width: 100%;
      border-radius: var(--radius-pill);
      background-color: var(--bg-surface-hover);
      display: flex;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
    }
    .segment-available { background-color: var(--color-success); height: 100%; transition: width 0.3s; }
    .segment-issued { background-color: var(--color-warning); height: 100%; transition: width 0.3s; }
    .segment-overdue { background-color: var(--color-danger); height: 100%; transition: width 0.3s; }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .callout-hint {
      background-color: var(--bg-surface-hover);
      border: 1px solid var(--border-subtle);
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  recentLoans = signal<Loan[]>([]);
  overdueList = signal<Loan[]>([]);
  loading = signal(true);

  greeting = 'Welcome back';
  currentDate = '';

  constructor(
    private dashboardService: DashboardService,
    private loanService: LoanService,
    public auth: AuthService
  ) {
    this.calculateGreeting();
    this.formatCurrentDate();
  }

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.loanService.getLoans().subscribe({
      next: (loans) => {
        this.recentLoans.set(loans);
        this.overdueList.set(loans.filter(l => l.is_overdue));
      }
    });
  }

  getAvailablePercent(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.available_copies + s.issued_books;
    return total > 0 ? (s.available_copies / total) * 100 : 0;
  }

  getIssuedPercent(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.available_copies + s.issued_books;
    const regularIssued = Math.max(0, s.issued_books - s.overdue_books);
    return total > 0 ? (regularIssued / total) * 100 : 0;
  }

  getOverduePercent(): number {
    const s = this.stats();
    if (!s) return 0;
    const total = s.available_copies + s.issued_books;
    return total > 0 ? (s.overdue_books / total) * 100 : 0;
  }

  private calculateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 18) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  private formatCurrentDate() {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('en-US', options);
  }
}
