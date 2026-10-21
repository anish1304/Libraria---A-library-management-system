import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { FineRecord, FineStatus } from '../../../models/libraria.models';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { PaymentModalComponent, PaymentModalData } from '../../../shared/payment-modal/payment-modal.component';

@Component({
  selector: 'app-fine-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    StatCardComponent,
    ConfirmationModalComponent,
    PaymentModalComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Fines & Penalties Ledger</h2>
          <p class="text-secondary small mb-0">
            Overdue penalty calculations, payment recording, and fee exemption administration.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="rate-badge">
            <i class="bi bi-info-circle text-primary me-1"></i>
            <span>Current Overdue Policy: <strong>\${{ mockData.settings().daily_fine_rate.toFixed(2) }}/day</strong></span>
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Outstanding Balance" 
            [value]="'$' + pendingTotal().toFixed(2)" 
            icon="bi-cash-stack" 
            variant="danger">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Collected Revenue" 
            [value]="'$' + paidTotal().toFixed(2)" 
            icon="bi-check-circle" 
            variant="success">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Pending Infractions" 
            [value]="pendingCount()" 
            icon="bi-exclamation-octagon" 
            variant="warning">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Settled Receipts" 
            [value]="paidCount()" 
            icon="bi-receipt" 
            variant="blue">
          </app-stat-card>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="card-saas mb-4 p-3">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-5">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input 
                type="text" 
                class="form-control-saas" 
                placeholder="Search by patron name, title, or receipt #..." 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="applyFilter()">
            </div>
          </div>
          <div class="col-6 col-md-4">
            <select class="form-select form-control-saas" [(ngModel)]="statusFilter" (change)="applyFilter()">
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Payment</option>
              <option value="Paid">Paid / Settled</option>
              <option value="Waived">Waived / Exempt</option>
            </select>
          </div>
          <div class="col-6 col-md-3 text-md-end">
            <button class="btn btn-saas-secondary btn-sm w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card-saas overflow-hidden">
        <div class="table-responsive">
          <table class="table-saas w-100 mb-0">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Borrower</th>
                <th>Book Title</th>
                <th>Overdue Days</th>
                <th>Daily Rate</th>
                <th>Penalty Amount</th>
                <th>Status</th>
                <th>Receipt / Date</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let fine of filteredList()">
                <td>
                  <span class="font-monospace small text-primary fw-bold">#FIN-{{ fine.id }}</span>
                </td>
                <td>
                  <div class="fw-bold">{{ fine.member_name }}</div>
                  <div class="xsmall text-secondary">Member ID: {{ fine.member_id }}</div>
                </td>
                <td>
                  <div class="small fw-semibold text-truncate max-w-title">{{ fine.book_title }}</div>
                </td>
                <td>
                  <span class="badge-status badge-danger">{{ fine.overdue_days }} days overdue</span>
                </td>
                <td>
                  <span class="small font-monospace">\${{ fine.daily_rate.toFixed(2) }}</span>
                </td>
                <td>
                  <span class="fw-bold text-danger fs-6 font-monospace">\${{ fine.amount.toFixed(2) }}</span>
                </td>
                <td>
                  <app-status-badge 
                    [status]="fine.status" 
                    [type]="fine.status === 'Paid' ? 'success' : (fine.status === 'Waived' ? 'info' : 'danger')">
                  </app-status-badge>
                </td>
                <td>
                  <div *ngIf="fine.receipt_no" class="font-monospace xsmall text-success fw-bold">
                    <i class="bi bi-receipt me-1"></i>{{ fine.receipt_no }}
                  </div>
                  <div class="xsmall text-secondary">{{ fine.paid_at || fine.created_at }}</div>
                </td>
                <td class="text-end">
                  <div class="btn-group" *ngIf="fine.status === 'Pending'">
                    <button 
                      class="btn btn-sm btn-saas-primary py-1 px-2"
                      (click)="openGatewayModal(fine)"
                      title="Settle online via PayGateway">
                      <i class="bi bi-credit-card-2-front-fill me-1"></i> PayGateway
                    </button>
                    <button 
                      class="btn btn-sm btn-saas-secondary py-1 px-2"
                      (click)="settleFine(fine)"
                      title="Manual Cash/Register settlement">
                      <i class="bi bi-check2-circle"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-saas-secondary py-1 px-2"
                      (click)="confirmWaive(fine)"
                      title="Waive fine">
                      <i class="bi bi-slash-circle"></i>
                    </button>
                  </div>
                  <span *ngIf="fine.status !== 'Pending'" class="xsmall text-muted fst-italic">
                    Settled
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state 
          *ngIf="filteredList().length === 0"
          icon="bi-cash-coin"
          title="No fine records found"
          description="There are currently no penalties matching the specified search or filter.">
        </app-empty-state>
      </div>
    </div>

    <!-- Digital Payment Gateway Modal -->
    <app-payment-modal
      *ngIf="showPaymentModal"
      [data]="paymentModalData!"
      (close)="showPaymentModal = false"
      (paymentSuccess)="onPaymentSuccess($event)">
    </app-payment-modal>

    <!-- Confirmation Modal for Waiving -->
    <app-confirmation-modal
      [isOpen]="showWaiveModal"
      title="Waive Fine Exemption"
      [message]="'Are you sure you want to waive the $' + (selectedFine?.amount?.toFixed(2) || '0.00') + ' penalty for ' + (selectedFine?.member_name || '') + '?'"
      confirmText="Yes, Waive Penalty"
      confirmVariant="warning"
      (confirm)="doWaive()"
      (cancel)="showWaiveModal = false">
    </app-confirmation-modal>
  `,
  styles: [`
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .rate-badge {
      background: var(--bg-surface-hover);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 0.35rem 0.85rem;
      font-size: 0.825rem;
      color: var(--text-secondary);
    }
    .max-w-title {
      max-width: 220px;
    }
    .xsmall {
      font-size: 0.725rem;
    }
  `]
})
export class FineManagementComponent {
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  searchQuery: string = '';
  statusFilter: string = 'ALL';
  filteredList = signal<FineRecord[]>([]);

  showWaiveModal: boolean = false;
  selectedFine: FineRecord | null = null;

  showPaymentModal: boolean = false;
  paymentModalData: PaymentModalData | null = null;

  constructor() {
    this.applyFilter();
  }

  openGatewayModal(fine: FineRecord) {
    this.paymentModalData = {
      title: 'Collect Overdue Penalty',
      purpose: `Penalty Settlement for "${fine.book_title}" (${fine.overdue_days} days overdue)`,
      amount: fine.amount,
      fineId: fine.id,
      memberName: fine.member_name,
      memberIdNo: `MEM-${fine.member_id}`
    };
    this.showPaymentModal = true;
  }

  onPaymentSuccess(receipt: any) {
    this.mockData.processDigitalPayment({
      amount: receipt.amount,
      purpose: receipt.purpose,
      paymentMethod: receipt.payment_method,
      memberName: receipt.member_name,
      memberIdNo: receipt.member_id_no,
      fineId: receipt.fineId
    });
    this.toast.show(`Payment of $${receipt.amount.toFixed(2)} recorded! Receipt: ${receipt.receipt_no}`, 'success');
    this.applyFilter();
  }

  pendingTotal(): number {
    return this.mockData.fines()
      .filter(f => f.status === 'Pending')
      .reduce((sum, f) => sum + f.amount, 0);
  }

  paidTotal(): number {
    return this.mockData.fines()
      .filter(f => f.status === 'Paid')
      .reduce((sum, f) => sum + f.amount, 0);
  }

  pendingCount(): number {
    return this.mockData.fines().filter(f => f.status === 'Pending').length;
  }

  paidCount(): number {
    return this.mockData.fines().filter(f => f.status === 'Paid').length;
  }

  applyFilter() {
    let list = this.mockData.fines();
    if (this.statusFilter !== 'ALL') {
      list = list.filter(f => f.status === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(f =>
        f.member_name.toLowerCase().includes(q) ||
        f.book_title.toLowerCase().includes(q) ||
        (f.receipt_no && f.receipt_no.toLowerCase().includes(q)) ||
        String(f.id).includes(q)
      );
    }
    this.filteredList.set(list);
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.applyFilter();
  }

  settleFine(fine: FineRecord) {
    const actor = this.auth.currentUser();
    const res = this.mockData.payFine(fine.id, actor?.name || 'Staff Cashier', (actor?.role || 'librarian') as any);
    if (res.success) {
      this.toast.show(res.message, 'success');
      this.applyFilter();
    }
  }

  confirmWaive(fine: FineRecord) {
    this.selectedFine = fine;
    this.showWaiveModal = true;
  }

  doWaive() {
    if (!this.selectedFine) return;
    const actor = this.auth.currentUser();
    this.mockData.fines.update(list => list.map(f => f.id === this.selectedFine!.id ? { ...f, status: 'Waived' } : f));
    this.mockData.logAuditEvent(
      actor?.name || 'Staff Administrator',
      (actor?.role || 'librarian') as any,
      'FINE_WAIVE',
      'Fine',
      this.selectedFine.id,
      `Waived $${this.selectedFine.amount.toFixed(2)} fine for ${this.selectedFine.member_name}`
    );
    this.toast.show(`Fine of $${this.selectedFine.amount.toFixed(2)} waived.`, 'info');
    this.showWaiveModal = false;
    this.selectedFine = null;
    this.applyFilter();
  }
}
