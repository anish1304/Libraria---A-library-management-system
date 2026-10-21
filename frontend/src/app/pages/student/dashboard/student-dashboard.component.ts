import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoanService, Loan } from '../../../services/loan.service';
import { AuthService } from '../../../services/auth.service';
import { MockDataService } from '../../../services/mock-data.service';
import { ToastService } from '../../../services/toast.service';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    StatCardComponent, 
    StatusBadgeComponent, 
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="student-dashboard-page">
      <!-- Welcome Header with Membership Badge -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="text-secondary small fw-bold text-uppercase tracking-wider">
              <i class="bi bi-calendar3 me-1"></i> {{ currentDate }}
            </span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0 fw-semibold" style="font-size: 0.72rem;">
              <i class="bi bi-award-fill me-1"></i> {{ getMembershipBadge() }}
            </span>
          </div>
          <h2 class="fw-bold mb-1">Welcome back, {{ getStudentName() }}</h2>
          <p class="text-secondary mb-0">Here is your current reading status, loan renewals, and library borrowings summary.</p>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-2">
          <a routerLink="/student/subscriptions" class="btn-saas-outline-primary">
            <i class="bi bi-gem me-1"></i>
            <span>Membership Plans</span>
          </a>
          <a routerLink="/student/payments" class="btn-saas-secondary">
            <i class="bi bi-credit-card me-1"></i>
            <span>Payments &amp; Receipts</span>
          </a>
          <a routerLink="/student/reservations" class="btn-saas-secondary">
            <i class="bi bi-bookmark-check me-1"></i>
            <span>Hold Queues</span>
          </a>
          <a routerLink="/student/books" class="btn-saas-primary">
            <i class="bi bi-search me-1"></i>
            <span>Explore Catalogue</span>
          </a>
        </div>
      </div>

      <!-- Membership & Digital Payment Spotlight Glass Banner -->
      <div class="row g-3 mb-4">
        <div class="col-lg-8">
          <div class="membership-spotlight-card glass-card p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="spotlight-gem-icon">
                <i class="bi bi-gem"></i>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span class="spotlight-plan-title fw-bold fs-6">{{ getMembershipBadge() }}</span>
                  <span class="badge-plan-active">Active Plan</span>
                </div>
                <div class="text-secondary small mt-1">
                  Borrowing Quota: <strong>{{ getCurrentBookLimit() }} concurrent books</strong> &middot; 
                  1-Click Renewals Enabled &middot; Verified Reviews
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 flex-shrink-0">
              <a routerLink="/student/subscriptions" class="btn-upgrade-pill">
                <i class="bi bi-stars me-1"></i> Upgrade Tier
              </a>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="payment-spotlight-card glass-card p-3 d-flex align-items-center justify-content-between h-100">
            <div class="d-flex align-items-center gap-2">
              <div class="spotlight-wallet-icon">
                <i class="bi bi-credit-card-2-front"></i>
              </div>
              <div>
                <div class="fw-bold small text-primary">Razorpay Gateway</div>
                <div class="text-secondary small" style="font-size: 0.72rem;">Instant UPI / QR / Cards</div>
              </div>
            </div>
            <a routerLink="/student/payments" class="btn-saas-secondary btn-sm py-1">
              <i class="bi bi-receipt me-1"></i> Receipts
            </a>
          </div>
        </div>
      </div>

      <!-- Overdue Warning Alert -->
      <div *ngIf="overdueLoans().length > 0" class="alert alert-danger d-flex align-items-center gap-3 mb-4 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-4 text-danger flex-shrink-0"></i>
        <div class="flex-grow-1">
          <h6 class="alert-heading mb-1 fw-bold">Overdue Books Warning</h6>
          <div class="small">
            You have <strong>{{ overdueLoans().length }}</strong> volume(s) past due date. Please return them or renew your loan to prevent penalty escalation.
          </div>
        </div>
        <a routerLink="/student/payments" class="btn-saas-danger btn-sm py-1">Pay Fine Online</a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()">
        <app-loading-skeleton type="cards" [count]="3"></app-loading-skeleton>
      </div>

      <!-- KPI Summary Cards -->
      <div *ngIf="!loading()" class="row g-3 mb-4">
        <div class="col-md-4">
          <app-stat-card 
            label="Currently Borrowed" 
            [value]="issuedLoans().length" 
            icon="bi-bookmark-check" 
            accent="blue" 
            caption="Active books in hand">
          </app-stat-card>
        </div>
        <div class="col-md-4">
          <app-stat-card 
            label="Overdue Alert" 
            [value]="overdueLoans().length" 
            icon="bi-exclamation-triangle" 
            accent="danger" 
            caption="Exceeded loan deadline">
          </app-stat-card>
        </div>
        <div class="col-md-4">
          <app-stat-card 
            label="Total Returned" 
            [value]="returnedLoans().length" 
            icon="bi-check2-circle" 
            accent="success" 
            caption="Lifetime completed loans">
          </app-stat-card>
        </div>
      </div>

      <!-- Active Borrowings Table Card with 1-Click Renewal -->
      <div class="saas-card mb-4">
        <div class="saas-card-header d-flex align-items-center justify-content-between p-3 border-bottom border-subtle">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-book text-primary"></i>
            <h6 class="mb-0 fw-bold">Currently Checked-Out Books</h6>
          </div>
          <span class="badge bg-primary-subtle text-primary small fw-bold">
            {{ issuedLoans().length }} Active
          </span>
        </div>

        <div class="saas-card-body p-0">
          <div *ngIf="issuedLoans().length === 0" class="p-4 text-center">
            <app-empty-state 
              icon="bi-journal-check" 
              title="No active borrowings" 
              message="You currently do not have any books checked out. Find your next read in the catalogue!"
              actionText="Browse Catalogue"
              actionLink="/student/books">
            </app-empty-state>
          </div>

          <div class="table-responsive" *ngIf="issuedLoans().length > 0">
            <table class="saas-table mb-0">
              <thead>
                <tr>
                  <th>Book Title &amp; Author</th>
                  <th>Checkout Date</th>
                  <th>Due Date</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th class="text-end">1-Click Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of issuedLoans()" [style.background]="loan.is_overdue ? 'rgba(216, 76, 90, 0.05)' : ''">
                  <td>
                    <div class="d-flex align-items-center gap-3">
                      <div class="book-cover-mock" style="width: 32px; height: 44px; font-size: 0.65rem;">BK</div>
                      <div>
                        <div class="fw-bold">{{ loan.book_title }}</div>
                        <div class="text-secondary small">{{ loan.book_author }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ loan.issue_date | date:'mediumDate' }}</td>
                  <td [class.text-danger]="loan.is_overdue" [class.fw-bold]="loan.is_overdue">
                    {{ loan.due_date | date:'mediumDate' }}
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getDaysBadgeClass(loan)">
                      {{ getDaysRemainingText(loan) }}
                    </span>
                  </td>
                  <td>
                    <app-status-badge 
                      [status]="loan.is_overdue ? 'Overdue' : 'Issued'"
                      [text]="loan.is_overdue ? 'Overdue' : 'On Time'">
                    </app-status-badge>
                  </td>
                  <td class="text-end">
                    <button 
                      type="button" 
                      class="btn btn-saas-secondary btn-sm py-1"
                      (click)="renewLoan(loan)"
                      [disabled]="(loan.renewal_count || 0) >= 2"
                      title="Extend due date by 14 days">
                      <i class="bi bi-arrow-repeat me-1"></i> Renew (+14d)
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Comprehensive Feature Navigation Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4 col-sm-6">
          <a routerLink="/student/subscriptions" class="saas-card p-3 d-flex align-items-center gap-3 text-decoration-none h-100">
            <div class="stat-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: #818CF8;">
              <i class="bi bi-gem"></i>
            </div>
            <div>
              <div class="fw-bold fs-6 text-primary">Membership Plans</div>
              <div class="text-secondary small">Compare tiers, borrow up to 20 books &amp; upgrade.</div>
            </div>
          </a>
        </div>
        <div class="col-md-4 col-sm-6">
          <a routerLink="/student/payments" class="saas-card p-3 d-flex align-items-center gap-3 text-decoration-none h-100">
            <div class="stat-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: #10B981;">
              <i class="bi bi-credit-card-2-front"></i>
            </div>
            <div>
              <div class="fw-bold fs-6 text-primary">Payments &amp; Receipts</div>
              <div class="text-secondary small">Settle fines via Razorpay UPI &amp; get clearance receipts.</div>
            </div>
          </a>
        </div>
        <div class="col-md-4 col-sm-6">
          <a routerLink="/student/books" class="saas-card p-3 d-flex align-items-center gap-3 text-decoration-none h-100">
            <div class="stat-icon-wrap" style="background: var(--brand-violet-subtle); color: var(--brand-violet);">
              <i class="bi bi-star-fill text-warning"></i>
            </div>
            <div>
              <div class="fw-bold fs-6 text-primary">Catalogue &amp; Reviews</div>
              <div class="text-secondary small">Filter genres, check 5-star ratings &amp; post reviews.</div>
            </div>
          </a>
        </div>
        <div class="col-md-4 col-sm-6">
          <a routerLink="/student/reservations" class="saas-card p-3 d-flex align-items-center gap-3 text-decoration-none h-100">
            <div class="stat-icon-wrap" style="background: var(--brand-blue-subtle); color: var(--brand-blue);">
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div>
              <div class="fw-bold fs-6 text-primary">Hold Waitlists</div>
              <div class="text-secondary small">Monitor queued items and pickup staging.</div>
            </div>
          </a>
        </div>
        <div class="col-md-4 col-sm-6">
          <a routerLink="/student/reading-lists" class="saas-card p-3 d-flex align-items-center gap-3 text-decoration-none h-100">
            <div class="stat-icon-wrap" style="background: rgba(244, 63, 94, 0.15); color: #f43f5e;">
              <i class="bi bi-heart-fill"></i>
            </div>
            <div>
              <div class="fw-bold fs-6 text-primary">Saved Wishlists</div>
              <div class="text-secondary small">Curate your reading goals and bookmarks.</div>
            </div>
          </a>
        </div>
        <div class="col-md-4 col-sm-6">
          <a routerLink="/student/history" class="saas-card p-3 d-flex align-items-center gap-3 text-decoration-none h-100">
            <div class="stat-icon-wrap" style="background: var(--color-success-bg); color: var(--color-success);">
              <i class="bi bi-clock-history"></i>
            </div>
            <div>
              <div class="fw-bold fs-6 text-primary">Reading History</div>
              <div class="text-secondary small">Review past borrowings and returns.</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .membership-spotlight-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
      border: 1px solid rgba(129, 140, 248, 0.3);
      border-radius: var(--radius-lg);
    }
    .payment-spotlight-card {
      background: linear-gradient(135deg, rgba(23, 35, 61, 0.7) 0%, rgba(11, 16, 32, 0.85) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-lg);
    }
    .spotlight-gem-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(129, 140, 248, 0.4);
      color: #818CF8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .spotlight-wallet-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10B981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .spotlight-plan-title {
      color: var(--text-primary);
    }
    .badge-plan-active {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10B981;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .btn-upgrade-pill {
      background: var(--brand-blue);
      color: #ffffff;
      font-size: 0.825rem;
      font-weight: 700;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .btn-upgrade-pill:hover {
      background: var(--brand-blue-hover);
      color: #ffffff;
      transform: translateY(-1px);
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  loanService = inject(LoanService);
  authService = inject(AuthService);
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  loans = signal<Loan[]>([]);
  issuedLoans = signal<Loan[]>([]);
  overdueLoans = signal<Loan[]>([]);
  returnedLoans = signal<Loan[]>([]);
  loading = signal(true);

  currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading.set(true);
    this.loanService.getMyLoans().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.issuedLoans.set(data.filter(l => l.status === 'Issued'));
        this.overdueLoans.set(data.filter(l => l.is_overdue));
        this.returnedLoans.set(data.filter(l => l.status === 'Returned'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getStudentName(): string {
    const user = this.authService.currentUser();
    return user?.name ?? 'Scholar';
  }

  getCurrentBookLimit(): number {
    const user = this.authService.currentUser();
    const tier = user?.membership_tier || 'standard';
    if (tier === 'research') return 20;
    if (tier === 'premium') return 8;
    return 3;
  }

  getMembershipBadge(): string {
    const user = this.authService.currentUser();
    const tier = user?.membership_tier || 'standard';
    if (tier === 'research') return 'Research Fellow';
    if (tier === 'premium') return 'Premium Scholar';
    return 'Standard Scholar';
  }

  renewLoan(loan: Loan) {
    this.loanService.renewBook(loan.id).subscribe({
      next: (updatedLoan) => {
        this.toast.show(`"${loan.book_title}" extended by 14 days! New return date: ${updatedLoan.due_date}`, 'success');
        this.loadLoans();
      },
      error: (err) => {
        this.toast.show(err.message || 'Could not renew loan.', 'warning');
      }
    });
  }

  getDaysRemainingText(loan: Loan): string {
    const due = new Date(loan.due_date).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return `${Math.abs(diff)}d overdue`;
    } else if (diff === 0) {
      return 'Due today';
    } else if (diff === 1) {
      return 'Due tomorrow';
    } else {
      return `${diff}d left`;
    }
  }

  getDaysBadgeClass(loan: Loan): string {
    if (loan.is_overdue) return 'bg-danger text-white';
    const due = new Date(loan.due_date).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (diff <= 2) return 'bg-warning text-dark';
    return 'bg-primary-subtle text-primary';
  }
}
