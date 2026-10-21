import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService, Loan } from '../../../services/loan.service';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="transaction-history-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">Transaction Audit Log</h3>
          <p class="text-secondary mb-0">Complete historical circulation register across all campus libraries.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary-subtle text-primary py-2 px-3 fw-bold">
            Total Records: {{ filteredLoans().length }}
          </span>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="saas-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control-saas" 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="applyFilters()" 
                     placeholder="Search by book title, author, or student...">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select-saas" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
              <option value="">All Statuses</option>
              <option value="Issued">Currently Issued</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue Only</option>
            </select>
          </div>
          <div class="col-md-4 text-md-end">
            <button type="button" class="btn-saas-secondary" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div class="saas-card" *ngIf="loading()">
        <app-loading-skeleton type="table" [count]="5"></app-loading-skeleton>
      </div>

      <!-- Empty State -->
      <div class="saas-card" *ngIf="!loading() && filteredLoans().length === 0">
        <app-empty-state 
          icon="bi-journal-x" 
          title="No transactions found" 
          message="No circulation records match your search or filter criteria."
          [showAddIcon]="false"
          actionText="Clear Filters"
          (actionClick)="resetFilters()">
        </app-empty-state>
      </div>

      <!-- Transactions Table -->
      <div class="saas-table-container" *ngIf="!loading() && filteredLoans().length > 0">
        <table class="saas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Book Title & Author</th>
              <th>Borrower Student</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let loan of filteredLoans()">
              <td class="text-secondary font-monospace small">#{{ loan.id }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="book-cover-mock" style="width: 28px; height: 38px; font-size: 0.6rem;">BK</div>
                  <div>
                    <div class="fw-bold">{{ loan.book_title }}</div>
                    <div class="text-secondary small">{{ loan.book_author }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="fw-semibold">{{ loan.student_name }}</div>
                <div class="text-secondary small">ID: {{ loan.student_id_no }}</div>
              </td>
              <td>{{ loan.issue_date | date:'mediumDate' }}</td>
              <td [class.text-danger]="loan.is_overdue" [class.fw-bold]="loan.is_overdue">
                {{ loan.due_date | date:'mediumDate' }}
              </td>
              <td>
                <span *ngIf="loan.return_date" class="text-success fw-medium">
                  {{ loan.return_date | date:'mediumDate' }}
                </span>
                <span *ngIf="!loan.return_date" class="text-tertiary">â€”</span>
              </td>
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
  `
})
export class TransactionHistoryComponent implements OnInit {
  allLoans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);
  loading = signal(true);

  searchQuery = '';
  statusFilter = '';

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.fetchTransactions();
  }

  fetchTransactions() {
    this.loading.set(true);
    this.loanService.getLoans().subscribe({
      next: (data) => {
        this.allLoans.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters() {
    let result = [...this.allLoans()];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      result = result.filter(l => 
        l.book_title.toLowerCase().includes(query) ||
        l.book_author.toLowerCase().includes(query) ||
        l.student_name.toLowerCase().includes(query) ||
        l.student_id_no.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter === 'Issued') {
      result = result.filter(l => l.status === 'Issued' && !l.is_overdue);
    } else if (this.statusFilter === 'Returned') {
      result = result.filter(l => l.status === 'Returned');
    } else if (this.statusFilter === 'Overdue') {
      result = result.filter(l => l.is_overdue);
    }

    this.filteredLoans.set(result);
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.applyFilters();
  }
}
