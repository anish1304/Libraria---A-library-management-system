import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MockDataService } from '../../../services/mock-data.service';
import { ToastService } from '../../../services/toast.service';
import { PaymentModalComponent, PaymentModalData } from '../../../shared/payment-modal/payment-modal.component';
import { PaymentReceipt } from '../../../models/libraria.models';

@Component({
  selector: 'app-student-payments',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  template: `
    <div class="payments-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge-accent">
              <i class="bi bi-shield-check me-1"></i> RAZORPAY SECURE GATEWAY
            </span>
          </div>
          <h2 class="page-title mb-1">Payments &amp; Digital Clearance Receipts</h2>
          <p class="text-secondary small mb-0">
            Settle circulation fines, view verified transaction receipts, and manage membership subscriptions.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <a routerLink="/student/subscriptions" class="btn-saas-secondary">
            <i class="bi bi-gem me-1"></i> Membership Plans
          </a>
          <button type="button" class="btn-saas-primary" (click)="openQuickPay()">
            <i class="bi bi-qr-code-scan me-1"></i> Instant UPI / Card Checkout
          </button>
        </div>
      </div>

      <!-- Financial Metric Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="metric-card glass-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="metric-label text-secondary small fw-bold text-uppercase">Outstanding Fines</span>
              <div class="metric-icon-wrap bg-danger-subtle text-danger">
                <i class="bi bi-exclamation-circle-fill"></i>
              </div>
            </div>
            <div class="metric-value text-danger">\${{ totalPendingFines().toFixed(2) }}</div>
            <div class="metric-subtext small text-secondary mt-1">
              {{ pendingFinesList().length }} unsettled overdue fine(s)
            </div>
            <div class="mt-3" *ngIf="totalPendingFines() > 0">
              <button type="button" class="btn-saas-danger w-100 py-1 small" (click)="payAllFines()">
                <i class="bi bi-credit-card me-1"></i> Pay Fines Online Now
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="metric-card glass-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="metric-label text-secondary small fw-bold text-uppercase">Total Settled Dues</span>
              <div class="metric-icon-wrap bg-success-subtle text-success">
                <i class="bi bi-check-circle-fill"></i>
              </div>
            </div>
            <div class="metric-value text-success">\${{ totalSettledFines().toFixed(2) }}</div>
            <div class="metric-subtext small text-secondary mt-1">
              {{ paidFinesList().length }} transactions cleared
            </div>
            <div class="mt-3">
              <span class="badge-status badge-success">
                <i class="bi bi-shield-lock me-1"></i> 100% Audit Cleared
              </span>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="metric-card glass-card">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="metric-label text-secondary small fw-bold text-uppercase">Membership Tier</span>
              <div class="metric-icon-wrap bg-primary-subtle text-primary">
                <i class="bi bi-award-fill"></i>
              </div>
            </div>
            <div class="metric-value text-primary">{{ currentStudentTier() }}</div>
            <div class="metric-subtext small text-secondary mt-1">
              Borrowing limit: <strong>{{ getCurrentBookLimit() }} volumes</strong>
            </div>
            <div class="mt-3">
              <a routerLink="/student/subscriptions" class="btn-saas-outline-primary w-100 py-1 small text-center d-block">
                <i class="bi bi-arrow-up-circle me-1"></i> Upgrade Membership
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Fines Settlement Banner -->
      <div *ngIf="pendingFinesList().length > 0" class="saas-card mb-4 border-warning">
        <div class="saas-card-header p-3 d-flex align-items-center justify-content-between border-bottom">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
            <h6 class="mb-0 fw-bold">Unsettled Fine Obligations</h6>
          </div>
          <span class="badge bg-warning-subtle text-warning fw-bold px-2 py-1">
            Action Required
          </span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Reason</th>
                <th>Amount</th>
                <th>Date Incurred</th>
                <th class="text-end">Payment Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let fine of pendingFinesList()">
                <td class="fw-bold text-primary">#FIN-{{ fine.id }}</td>
                <td>{{ fine.reason || 'Overdue loan return policy violation' }}</td>
                <td class="fw-bold text-danger">\${{ fine.amount.toFixed(2) }}</td>
                <td class="text-secondary small">{{ fine.created_at || 'Recently' }}</td>
                <td class="text-end">
                  <button type="button" class="btn-saas-primary btn-sm py-1" (click)="openPayFine(fine)">
                    <i class="bi bi-credit-card-2-front me-1"></i> Pay with Razorpay
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Verified Transaction Receipts History -->
      <div class="saas-card mb-4">
        <div class="saas-card-header p-3 d-flex align-items-center justify-content-between border-bottom">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-receipt text-primary fs-5"></i>
            <h6 class="mb-0 fw-bold">Official Transaction Receipts &amp; Audit Log</h6>
          </div>
          <span class="badge bg-primary-subtle text-primary small fw-semibold">
            {{ allReceipts().length }} Verified Records
          </span>
        </div>

        <div class="table-responsive" *ngIf="allReceipts().length > 0">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Payment For</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th class="text-end">Digital Voucher</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of allReceipts()">
                <td>
                  <span class="font-monospace fw-bold text-primary">{{ rec.receipt_no }}</span>
                </td>
                <td>
                  <span class="fw-semibold">{{ rec.purpose || rec.description }}</span>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary small text-uppercase">
                    <i class="bi bi-wallet2 me-1"></i> {{ rec.payment_method || rec.method }}
                  </span>
                </td>
                <td class="fw-bold text-success">
                  \${{ rec.amount.toFixed(2) }}
                </td>
                <td class="small text-secondary">
                  {{ rec.paid_at }}
                </td>
                <td>
                  <span class="badge-status badge-success">
                    <i class="bi bi-patch-check-fill me-1"></i> Verified
                  </span>
                </td>
                <td class="text-end">
                  <button type="button" class="btn-saas-secondary btn-sm py-1" (click)="viewReceipt(rec)">
                    <i class="bi bi-printer me-1"></i> View Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state when no receipts -->
        <div *ngIf="allReceipts().length === 0" class="p-5 text-center">
          <div class="text-secondary mb-2 fs-1"><i class="bi bi-receipt-cutoff"></i></div>
          <h6 class="fw-bold">No Transaction Receipts Yet</h6>
          <p class="text-secondary small mb-3">When you settle fines or subscribe to membership tiers, your official clearance certificates will appear here.</p>
          <button type="button" class="btn-saas-primary btn-sm" (click)="openQuickPay()">
            <i class="bi bi-qr-code-scan me-1"></i> Make a Demo Payment
          </button>
        </div>
      </div>
    </div>

    <!-- Active Digital Payment Modal -->
    <app-payment-modal
      *ngIf="showModal() && paymentModalData()"
      [data]="paymentModalData()!"
      (close)="showModal.set(false)"
      (paymentSuccess)="onPaymentSuccess($event)">
    </app-payment-modal>

    <!-- Receipt Viewer Modal -->
    <div class="receipt-backdrop" *ngIf="selectedReceiptForView()">
      <div class="receipt-card glass-card p-4">
        <div class="text-end mb-2">
          <button type="button" class="btn-close-clean" (click)="selectedReceiptForView.set(null)">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="text-center mb-4">
          <div class="receipt-logo mb-1">LIBRARIA ACADEMIC CLEARANCE</div>
          <div class="text-secondary small">Central Campus Library Circulation Desk</div>
          <div class="receipt-pill mt-2">OFFICIAL PAYMENT RECEIPT</div>
        </div>

        <div class="receipt-details mb-4">
          <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
            <span class="text-secondary small">Receipt Number:</span>
            <span class="font-monospace fw-bold">{{ selectedReceiptForView()?.receipt_no }}</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
            <span class="text-secondary small">Transaction Ref:</span>
            <span class="font-monospace small">{{ selectedReceiptForView()?.transaction_id }}</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
            <span class="text-secondary small">Student Name:</span>
            <span class="fw-semibold">{{ selectedReceiptForView()?.member_name || selectedReceiptForView()?.student_name }}</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
            <span class="text-secondary small">Purpose:</span>
            <span class="fw-semibold">{{ selectedReceiptForView()?.purpose || selectedReceiptForView()?.description }}</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
            <span class="text-secondary small">Payment Channel:</span>
            <span class="text-uppercase fw-semibold">{{ selectedReceiptForView()?.payment_method || selectedReceiptForView()?.method }}</span>
          </div>
          <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
            <span class="text-secondary small">Payment Date:</span>
            <span>{{ selectedReceiptForView()?.paid_at }}</span>
          </div>
          <div class="d-flex justify-content-between py-2 mt-2 bg-surface-subtle p-2 rounded">
            <span class="fw-bold">Total Paid:</span>
            <span class="fw-bold text-success fs-5">\${{ selectedReceiptForView()?.amount?.toFixed(2) }}</span>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button type="button" class="btn-saas-secondary w-100" (click)="selectedReceiptForView.set(null)">
            Close
          </button>
          <button type="button" class="btn-saas-primary w-100" (click)="printReceipt()">
            <i class="bi bi-printer me-1"></i> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payments-page {
      padding: 1rem 0 3rem 0;
    }
    .badge-accent {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(129, 140, 248, 0.3);
      color: #818CF8;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
    }
    .metric-card {
      padding: 1.5rem;
      border-radius: var(--radius-lg);
    }
    .metric-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.1;
    }
    .receipt-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .receipt-card {
      width: 100%;
      max-width: 480px;
      background: linear-gradient(135deg, rgba(23, 35, 61, 0.98) 0%, rgba(11, 16, 32, 0.98) 100%);
      border: 1px solid rgba(129, 140, 248, 0.3);
      border-radius: var(--radius-xl);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
    }
    .receipt-logo {
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #818CF8;
      font-size: 0.85rem;
    }
    .receipt-pill {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 10px;
      border-radius: 9999px;
    }
    .btn-close-clean {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.1rem;
      cursor: pointer;
    }
  `]
})
export class StudentPaymentsComponent {
  auth = inject(AuthService);
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  showModal = signal<boolean>(false);
  paymentTitle = signal<string>('Library Fine Settlement');
  paymentDesc = signal<string>('Clear overdue circulation balance');
  paymentAmount = signal<number>(5.00);
  activeFineId = signal<number>(0);

  selectedReceiptForView = signal<PaymentReceipt | null>(null);

  currentStudent() {
    return this.auth.currentUser();
  }

  currentStudentTier(): string {
    const tier = this.currentStudent()?.membership_tier || 'standard';
    if (tier === 'research') return 'Research Fellow';
    if (tier === 'premium') return 'Premium Scholar';
    return 'Standard Scholar';
  }

  getCurrentBookLimit(): number {
    const tier = this.currentStudent()?.membership_tier || 'standard';
    if (tier === 'research') return 20;
    if (tier === 'premium') return 8;
    return 3;
  }

  // Fines data
  myFines = computed(() => {
    const user = this.currentStudent();
    if (!user) return [];
    return this.mockData.fines().filter(f => f.member_id === user.id || f.member_name.toLowerCase().includes(user.username.toLowerCase()));
  });

  pendingFinesList = computed(() => {
    return this.myFines().filter(f => f.status === 'Pending');
  });

  paidFinesList = computed(() => {
    return this.myFines().filter(f => f.status === 'Paid');
  });

  totalPendingFines = computed(() => {
    return this.pendingFinesList().reduce((sum, f) => sum + f.amount, 0);
  });

  totalSettledFines = computed(() => {
    return this.paidFinesList().reduce((sum, f) => sum + f.amount, 0);
  });

  paymentModalData = computed<PaymentModalData | null>(() => {
    const user = this.currentStudent();
    return {
      title: this.paymentTitle(),
      purpose: this.paymentDesc(),
      amount: this.paymentAmount(),
      fineId: this.activeFineId() || undefined,
      memberName: user?.name || user?.student_name || 'Scholar Member',
      memberIdNo: user?.student_id || 'STU-1001'
    };
  });

  allReceipts = computed(() => {
    const receipts = this.mockData.paymentReceipts();
    const user = this.currentStudent();
    if (!user) return receipts;
    const nameLower = (user.name || user.student_name || user.username || '').toLowerCase();
    return receipts.filter((r: PaymentReceipt) => 
      (r.student_id && r.student_id === user.id) || 
      (r.member_name && r.member_name.toLowerCase().includes(nameLower)) ||
      (r.student_name && r.student_name.toLowerCase().includes(nameLower))
    );
  });

  openPayFine(fine: any) {
    this.activeFineId.set(fine.id);
    this.paymentTitle.set(`Fine Settlement: #FIN-${fine.id}`);
    this.paymentDesc.set(fine.reason || 'Overdue library fine');
    this.paymentAmount.set(fine.amount);
    this.showModal.set(true);
  }

  payAllFines() {
    const amount = this.totalPendingFines();
    if (amount <= 0) return;
    this.activeFineId.set(this.pendingFinesList()[0]?.id || 0);
    this.paymentTitle.set('Clear All Outstanding Fines');
    this.paymentDesc.set(`Consolidated payment for ${this.pendingFinesList().length} overdue item(s)`);
    this.paymentAmount.set(amount);
    this.showModal.set(true);
  }

  openQuickPay() {
    this.activeFineId.set(0);
    this.paymentTitle.set('Digital Payment Gateway Checkout');
    this.paymentDesc.set('Campus Digital Wallet & Fee Clearance');
    this.paymentAmount.set(5.00);
    this.showModal.set(true);
  }

  onPaymentSuccess(receipt: PaymentReceipt) {
    // If it was for a fine, mark it as paid
    if (this.activeFineId()) {
      const user = this.currentStudent();
      this.mockData.payFine(this.activeFineId(), user?.student_name || 'Student', 'student');
    }
    this.toast.show(`Payment of $${receipt.amount.toFixed(2)} completed! Receipt ${receipt.receipt_no} generated.`, 'success');
  }

  viewReceipt(receipt: PaymentReceipt) {
    this.selectedReceiptForView.set(receipt);
  }

  printReceipt() {
    window.print();
  }
}
