import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoanService, Loan } from '../../../services/loan.service';
import { BookService, Book } from '../../../services/book.service';
import { StudentService, Student } from '../../../services/student.service';
import { ToastService } from '../../../services/toast.service';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-loan-management',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    StatusBadgeComponent, 
    ConfirmationModalComponent, 
    LoadingSkeletonComponent, 
    EmptyStateComponent
  ],
  template: `
    <div class="issue-return-workspace">
      <!-- Workspace Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">Circulation Desk</h3>
          <p class="text-secondary mb-0">Issue collection volumes, process check-ins, and inspect live borrowing statuses.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-warning-subtle text-warning py-2 px-3 fw-bold">
            Active Loans: {{ activeLoansCount() }}
          </span>
          <span class="badge bg-danger-subtle text-danger py-2 px-3 fw-bold" *ngIf="overdueLoansCount() > 0">
            Overdue: {{ overdueLoansCount() }}
          </span>
        </div>
      </div>

      <!-- Section 1: Structured Issue Workflow Card -->
      <div class="saas-card mb-4">
        <div class="saas-card-header">
          <div class="d-flex align-items-center gap-2">
            <div class="stat-icon-wrap" style="width: 34px; height: 34px; background: var(--brand-blue-subtle); color: var(--brand-blue);">
              <i class="bi bi-box-arrow-up-right fs-6"></i>
            </div>
            <h6 class="mb-0 fw-bold">Issue Book to Registered Student</h6>
          </div>
          <span class="text-secondary small">Step-by-step circulation check</span>
        </div>

        <div class="saas-card-body">
          <form [formGroup]="issueForm" (ngSubmit)="issueBook()">
            <div class="row g-3">
              <!-- Select Student -->
              <div class="col-lg-4 col-md-6">
                <label class="form-label-custom">1. Select Registered Student *</label>
                <select id="loan-student" 
                        class="form-select-saas" 
                        formControlName="student_id" 
                        (change)="onStudentSelect()">
                  <option value="">Choose borrower student...</option>
                  <option *ngFor="let s of activeStudents()" [value]="s.id">
                    {{ s.name }} (ID: {{ s.student_id }})
                  </option>
                </select>
                <!-- Selected Student Context Summary -->
                <div class="mt-2 p-2 bg-surface-hover rounded border small text-secondary" *ngIf="selectedStudentSummary">
                  <div class="fw-bold text-primary">{{ selectedStudentSummary.name }}</div>
                  <div style="font-size: 0.75rem;">Email: {{ selectedStudentSummary.email }} â€¢ Branch: {{ selectedStudentSummary.library_name }}</div>
                </div>
              </div>

              <!-- Select Book -->
              <div class="col-lg-4 col-md-6">
                <label class="form-label-custom">2. Select Book Title *</label>
                <select id="loan-book" 
                        class="form-select-saas" 
                        formControlName="book_id" 
                        (change)="onBookSelect()">
                  <option value="">Choose book title...</option>
                  <option *ngFor="let b of availableBooks()" [value]="b.id" [disabled]="b.available_copies <= 0">
                    {{ b.title }} ({{ b.available_copies }} copies left)
                  </option>
                </select>
                <!-- Selected Book Availability Context -->
                <div class="mt-2 p-2 rounded border small" 
                     [ngClass]="selectedBookSummary && selectedBookSummary.available_copies > 0 ? 'bg-surface-hover text-secondary' : 'bg-danger-subtle text-danger'"
                     *ngIf="selectedBookSummary">
                  <div class="fw-bold">{{ selectedBookSummary.title }}</div>
                  <div class="d-flex align-items-center justify-content-between mt-1">
                    <span style="font-size: 0.75rem;">ISBN: {{ selectedBookSummary.isbn }}</span>
                    <span class="badge" [ngClass]="selectedBookSummary.available_copies > 0 ? 'bg-success text-white' : 'bg-danger text-white'">
                      {{ selectedBookSummary.available_copies }} In Stock
                    </span>
                  </div>
                </div>
              </div>

              <!-- Due Date & Action -->
              <div class="col-lg-4 col-md-12">
                <div class="row g-2">
                  <div class="col-sm-6">
                    <label class="form-label-custom">3. Due Date *</label>
                    <input id="loan-due-date" 
                           type="date" 
                           class="form-control-saas" 
                           formControlName="due_date" 
                           [min]="minDueDate">
                  </div>
                  <div class="col-sm-6 d-flex align-items-end">
                    <button id="loan-issue-btn" 
                            type="submit" 
                            class="btn-saas-primary w-100 py-2 justify-content-center" 
                            [disabled]="issuing() || isSelectedBookOutOfStock()">
                      <span *ngIf="issuing()" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="bi bi-check2-circle me-1" *ngIf="!issuing()"></i>
                      {{ issuing() ? 'Processing...' : 'Authorize Loan' }}
                    </button>
                  </div>
                </div>
                <div class="text-tertiary small mt-2">
                  Standard loan period is 14 days from checkout.
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Section 2: Active Borrowings & Loans Table -->
      <div class="saas-card">
        <div class="saas-card-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-journal-bookmark text-primary"></i>
            <h6 class="mb-0 fw-bold">Live Circulation Roster</h6>
          </div>

          <!-- Status Filter Tabs -->
          <div class="d-flex gap-1">
            <button type="button" 
                    class="btn-saas-ghost btn-sm py-1 px-3" 
                    [class.fw-bold]="activeTab === 'all'" 
                    [class.bg-surface-hover]="activeTab === 'all'"
                    (click)="setTab('all')">
              All ({{ loans().length }})
            </button>
            <button type="button" 
                    class="btn-saas-ghost btn-sm py-1 px-3 text-warning" 
                    [class.fw-bold]="activeTab === 'issued'" 
                    [class.bg-surface-hover]="activeTab === 'issued'"
                    (click)="setTab('issued')">
              Active Loans
            </button>
            <button type="button" 
                    class="btn-saas-ghost btn-sm py-1 px-3 text-danger" 
                    [class.fw-bold]="activeTab === 'overdue'" 
                    [class.bg-surface-hover]="activeTab === 'overdue'"
                    (click)="setTab('overdue')">
              Overdue
            </button>
            <button type="button" 
                    class="btn-saas-ghost btn-sm py-1 px-3 text-success" 
                    [class.fw-bold]="activeTab === 'returned'" 
                    [class.bg-surface-hover]="activeTab === 'returned'"
                    (click)="setTab('returned')">
              Returned
            </button>
          </div>
        </div>

        <div class="saas-card-body p-0">
          <div *ngIf="loading()">
            <app-loading-skeleton type="table" [count]="5"></app-loading-skeleton>
          </div>

          <div *ngIf="!loading() && filteredLoans().length === 0">
            <app-empty-state 
              icon="bi-journal-check" 
              title="No loans in this category" 
              message="No circulation records currently match the selected filter."
              [showAddIcon]="false">
            </app-empty-state>
          </div>

          <div class="table-responsive" *ngIf="!loading() && filteredLoans().length > 0">
            <table class="saas-table mb-0">
              <thead>
                <tr>
                  <th>Book Title &amp; Author</th>
                  <th>Borrower Student</th>
                  <th>Checkout Date</th>
                  <th>Due Date</th>
                  <th>Return Timestamp</th>
                  <th>Status</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of filteredLoans()" [style.background]="loan.is_overdue ? 'rgba(216, 76, 90, 0.05)' : ''">
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
                    <div class="text-secondary small font-monospace">ID: {{ loan.student_id_no }}</div>
                  </td>
                  <td>{{ loan.issue_date | date:'mediumDate' }}</td>
                  <td [class.text-danger]="loan.is_overdue" [class.fw-bold]="loan.is_overdue">
                    {{ loan.due_date | date:'mediumDate' }}
                  </td>
                  <td>
                    <span *ngIf="loan.return_date" class="text-success small fw-medium">
                      {{ loan.return_date | date:'mediumDate' }}
                    </span>
                    <span *ngIf="!loan.return_date" class="text-tertiary small">Active on loan</span>
                  </td>
                  <td>
                    <app-status-badge 
                      [status]="loan.is_overdue ? 'Overdue' : loan.status"
                      [text]="loan.is_overdue ? 'Overdue' : loan.status">
                    </app-status-badge>
                  </td>
                  <td class="text-end">
                    <button *ngIf="loan.status === 'Issued'" 
                            type="button" 
                            class="btn-saas-secondary btn-sm py-1 px-2" 
                            (click)="promptReturn(loan)">
                      <i class="bi bi-box-arrow-in-left me-1 text-success"></i> Return Book
                    </button>
                    <span *ngIf="loan.status === 'Returned'" class="text-secondary small">
                      <i class="bi bi-check-all text-success me-1"></i> Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Return Confirmation Modal -->
      <app-confirmation-modal
        [isOpen]="isReturnModalOpen"
        title="Confirm Book Return"
        [message]="'Confirm check-in for &quot;' + (loanToReturn?.book_title || '') + '&quot; borrowed by ' + (loanToReturn?.student_name || '') + '? This will update the loan status to Returned and increase available inventory.'"
        confirmText="Confirm Return"
        cancelText="Keep on Loan"
        (confirm)="executeReturn()"
        (cancel)="isReturnModalOpen = false">
      </app-confirmation-modal>
    </div>
  `
})
export class LoanManagementComponent implements OnInit {
  loans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);
  availableBooks = signal<Book[]>([]);
  activeStudents = signal<Student[]>([]);
  loading = signal(true);
  issuing = signal(false);

  issueForm: FormGroup;
  minDueDate = '';
  activeTab: 'all' | 'issued' | 'overdue' | 'returned' = 'all';

  selectedBookSummary: Book | null = null;
  selectedStudentSummary: Student | null = null;

  isReturnModalOpen = false;
  loanToReturn: Loan | null = null;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private bookService: BookService,
    private studentService: StudentService,
    private toast: ToastService
  ) {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + 14);

    this.minDueDate = today.toISOString().split('T')[0];

    this.issueForm = this.fb.group({
      book_id: ['', Validators.required],
      student_id: ['', Validators.required],
      due_date: [future.toISOString().split('T')[0], Validators.required],
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.loanService.getLoans().subscribe({
      next: (data) => {
        this.loans.set(data);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.bookService.getBooks().subscribe(books => this.availableBooks.set(books));
    this.studentService.getStudents().subscribe(students => {
      this.activeStudents.set(students.filter(s => s.is_active));
    });
  }

  setTab(tab: 'all' | 'issued' | 'overdue' | 'returned') {
    this.activeTab = tab;
    this.applyFilter();
  }

  applyFilter() {
    const list = this.loans();
    if (this.activeTab === 'issued') {
      this.filteredLoans.set(list.filter(l => l.status === 'Issued' && !l.is_overdue));
    } else if (this.activeTab === 'overdue') {
      this.filteredLoans.set(list.filter(l => l.is_overdue));
    } else if (this.activeTab === 'returned') {
      this.filteredLoans.set(list.filter(l => l.status === 'Returned'));
    } else {
      this.filteredLoans.set(list);
    }
  }

  activeLoansCount(): number {
    return this.loans().filter(l => l.status === 'Issued').length;
  }

  overdueLoansCount(): number {
    return this.loans().filter(l => l.is_overdue).length;
  }

  onBookSelect() {
    const id = this.issueForm.get('book_id')?.value;
    this.selectedBookSummary = this.availableBooks().find(b => b.id === +id) || null;
  }

  onStudentSelect() {
    const id = this.issueForm.get('student_id')?.value;
    this.selectedStudentSummary = this.activeStudents().find(s => s.id === +id) || null;
  }

  isSelectedBookOutOfStock(): boolean {
    return this.selectedBookSummary ? this.selectedBookSummary.available_copies <= 0 : false;
  }

  issueBook() {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }

    if (this.isSelectedBookOutOfStock()) {
      this.toast.error('Selected book is out of stock.');
      return;
    }

    this.issuing.set(true);
    const { book_id, student_id, due_date } = this.issueForm.value;

    this.loanService.issueBook(+book_id, +student_id, due_date).subscribe({
      next: (loan) => {
        this.toast.success(`Book "${loan.book_title}" issued to ${loan.student_name}.`);
        this.issueForm.reset({
          book_id: '',
          student_id: '',
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        });
        this.selectedBookSummary = null;
        this.selectedStudentSummary = null;
        this.issuing.set(false);
        this.loadAll();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to issue book.');
        this.issuing.set(false);
      }
    });
  }

  promptReturn(loan: Loan) {
    this.loanToReturn = loan;
    this.isReturnModalOpen = true;
  }

  executeReturn() {
    if (!this.loanToReturn) return;
    const loan = this.loanToReturn;
    this.isReturnModalOpen = false;

    this.loanService.returnBook(loan.id).subscribe({
      next: () => {
        this.toast.success(`Book "${loan.book_title}" successfully returned into stock.`);
        this.loadAll();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to process return.');
      }
    });
  }
}
