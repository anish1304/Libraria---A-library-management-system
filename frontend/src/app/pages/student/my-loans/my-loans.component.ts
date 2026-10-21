import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoanService, Loan } from '../../../services/loan.service';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { FineRecord } from '../../../models/libraria.models';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { PaymentModalComponent, PaymentModalData } from '../../../shared/payment-modal/payment-modal.component';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    StatusBadgeComponent, 
    StatCardComponent, 
    LoadingSkeletonComponent, 
    EmptyStateComponent,
    PaymentModalComponent
  ],
  template: `
    <div class="my-loans-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">My Active &amp; Past Borrowings</h3>
          <p class="text-secondary mb-0">Track due dates, renew loans with 1 click, and settle overdue fees with the digital gateway.</p>
        </div>
        <a routerLink="/student/books" class="btn-saas-primary">
          <i class="bi bi-search me-1"></i> Browse More Books
        </a>
      </div>

      <!-- Outstanding Fines & Razorpay Payment Banner -->
      <div *ngIf="pendingFinesTotal() > 0" class="alert alert-danger d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 saas-card p-3 border-danger">
        <div class="d-flex align-items-center gap-3">
          <div class="fine-alert-icon">
            <i class="bi bi-cash-stack fs-3 text-danger"></i>
          </div>
          <div>
            <div class="fw-bold text-danger">Outstanding Overdue Penalties: \${{ pendingFinesTotal().toFixed(2) }}</div>
            <div class="small text-secondary">
              You have {{ pendingFines().length }} overdue penalty balance(s) requiring institutional settlement.
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm px-3 text-nowrap" (click)="openPaymentModal()">
          <i class="bi bi-credit-card-2-front-fill me-1"></i> Settle Online via PayGateway
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()">
        <app-loading-skeleton type="cards" [count]="3"></app-loading-skeleton>
      </div>

      <!-- Summary KPI Cards -->
      <div *ngIf="!loading()" class="row g-3 mb-4">
        <div class="col-md-4">
          <app-stat-card 
            label="Currently With You" 
            [value]="issued().length" 
            icon="bi-bookmark-check" 
            accent="blue" 
            caption="Active borrowings">
          </app-stat-card>
        </div>
        <div class="col-md-4">
          <app-stat-card 
            label="Overdue Alert" 
            [value]="overdue().length" 
            icon="bi-exclamation-triangle" 
            accent="danger" 
            caption="Immediate return needed">
          </app-stat-card>
        </div>
        <div class="col-md-4">
          <app-stat-card 
            label="Total Returned" 
            [value]="returned().length" 
            icon="bi-check2-circle" 
            accent="success" 
            caption="Completed check-ins">
          </app-stat-card>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="saas-card p-3 mb-4" *ngIf="!loading() && loans().length > 0">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control-saas" 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="applyFilters()" 
                     placeholder="Search borrowed titles or authors...">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select-saas" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
              <option value="">All Records</option>
              <option value="Issued">Currently Borrowed</option>
              <option value="Overdue">Overdue Only</option>
              <option value="Returned">Returned</option>
            </select>
          </div>
          <div class="col-md-3 text-md-end">
            <button type="button" class="btn-saas-secondary" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="saas-card" *ngIf="!loading() && filteredLoans().length === 0">
        <app-empty-state 
          icon="bi-journal-check" 
          title="No borrowing records found" 
          message="You currently have no loans matching this filter. Explore our collection to borrow books!"
          actionText="Browse Catalogue"
          actionLink="/student/books">
        </app-empty-state>
      </div>

      <!-- Active Loans Table with 1-Click Renewal -->
      <div class="saas-table-container" *ngIf="!loading() && filteredLoans().length > 0">
        <table class="saas-table">
          <thead>
            <tr>
              <th>Book Title &amp; Author</th>
              <th>Borrowed On</th>
              <th>Due Date</th>
              <th>Countdown</th>
              <th>Status</th>
              <th class="text-end">1-Click Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let loan of filteredLoans()" [style.background]="loan.is_overdue ? 'rgba(216, 76, 90, 0.05)' : ''">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="book-cover-mock" style="width: 32px; height: 44px; font-size: 0.65rem;">BK</div>
                  <div>
                    <div class="fw-bold fs-6">{{ loan.book_title }}</div>
                    <div class="text-secondary small">{{ loan.book_author }}</div>
                  </div>
                </div>
              </td>
              <td>{{ loan.issue_date | date:'mediumDate' }}</td>
              <td [class.text-danger]="loan.is_overdue" [class.fw-bold]="loan.is_overdue">
                {{ loan.due_date | date:'mediumDate' }}
              </td>
              <td>
                <span class="badge" [ngClass]="getDaysBadgeClass(loan)" *ngIf="loan.status === 'Issued'">
                  {{ getDaysRemainingText(loan) }}
                </span>
                <span class="text-tertiary small" *ngIf="loan.status === 'Returned'">
                  Completed
                </span>
              </td>
              <td>
                <app-status-badge 
                  [status]="loan.is_overdue ? 'Overdue' : loan.status"
                  [text]="loan.is_overdue ? 'Overdue' : loan.status">
                </app-status-badge>
              </td>
              <td class="text-end">
                <!-- 1-Click Renew Loan Button -->
                <div *ngIf="loan.status === 'Issued'" class="d-flex align-items-center justify-content-end gap-2">
                  <button 
                    type="button" 
                    class="btn btn-saas-secondary btn-sm py-1" 
                    (click)="renewLoan(loan)"
                    [disabled]="(loan.renewal_count || 0) >= 2"
                    [title]="(loan.renewal_count || 0) >= 2 ? 'Maximum renewals reached (2/2)' : 'Extend due date by 14 days'">
                    <i class="bi bi-arrow-repeat me-1"></i>
                    <span>Renew (+14d)</span>
                  </button>
                  <span class="badge bg-surface-hover border small" style="font-size: 0.7rem;">
                    {{ loan.renewal_count || 0 }}/2
                  </span>
                </div>
                <span *ngIf="loan.status === 'Returned'" class="text-success small fw-medium">
                  <i class="bi bi-check-circle me-1"></i> Returned {{ loan.return_date | date:'mediumDate' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment Gateway Modal -->
      <app-payment-modal 
        *ngIf="showPaymentModal" 
        [data]="paymentModalData!" 
        (close)="showPaymentModal = false"
        (paymentSuccess)="onPaymentSuccess($event)">
      </app-payment-modal>
    </div>
  `
})
export class MyLoansComponent implements OnInit {
  loanService = inject(LoanService);
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  loans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);
  issued = signal<Loan[]>([]);
  overdue = signal<Loan[]>([]);
  returned = signal<Loan[]>([]);
  loading = signal(true);

  searchQuery = '';
  statusFilter = '';

  showPaymentModal = false;
  paymentModalData: PaymentModalData | null = null;

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading.set(true);
    this.loanService.getMyLoans().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.issued.set(data.filter(l => l.status === 'Issued'));
        this.overdue.set(data.filter(l => l.is_overdue));
        this.returned.set(data.filter(l => l.status === 'Returned'));
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  pendingFines(): FineRecord[] {
    const user = this.auth.currentUser();
    const memberId = user?.id || 5;
    return this.mockData.fines().filter(f => f.member_id === memberId && f.status === 'Pending');
  }

  pendingFinesTotal(): number {
    return this.pendingFines().reduce((sum, f) => sum + f.amount, 0);
  }

  openPaymentModal() {
    const user = this.auth.currentUser();
    const fines = this.pendingFines();
    if (!fines.length) return;

    const firstFine = fines[0];
    this.paymentModalData = {
      title: 'Settle Overdue Penalty',
      purpose: `Fine Settlement: ${firstFine.book_title} (${firstFine.overdue_days}d overdue)`,
      amount: firstFine.amount,
      fineId: firstFine.id,
      memberName: user?.name || 'Alexandria Morgan',
      memberIdNo: user?.student_id || 'STU-2024-001'
    };
    this.showPaymentModal = true;
  }

  onPaymentSuccess(receipt: any) {
    this.toast.show(`Fine of $${receipt.amount.toFixed(2)} paid! Receipt: ${receipt.receipt_no}`, 'success');
    this.loadLoans();
  }

  renewLoan(loan: Loan) {
    this.loanService.renewBook(loan.id).subscribe({
      next: (updatedLoan) => {
        this.toast.show(`Loan renewed! New due date: ${updatedLoan.due_date}`, 'success');
        this.loadLoans();
      },
      error: (err) => {
        this.toast.show(err.message || 'Could not renew loan.', 'warning');
      }
    });
  }

  applyFilters() {
    let result = [...this.loans()];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      result = result.filter(l => 
        l.book_title.toLowerCase().includes(query) ||
        l.book_author.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter === 'Issued') {
      result = result.filter(l => l.status === 'Issued' && !l.is_overdue);
    } else if (this.statusFilter === 'Overdue') {
      result = result.filter(l => l.is_overdue);
    } else if (this.statusFilter === 'Returned') {
      result = result.filter(l => l.status === 'Returned');
    }

    this.filteredLoans.set(result);
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.applyFilters();
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
